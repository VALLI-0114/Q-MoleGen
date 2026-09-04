"""
Unit & Integration Tests for Quantum Computing & Quantum Machine Learning Pipelines.
"""

from pathlib import Path
import numpy as np
import pytest

from src.quantum.quantum_prep import (
    load_and_preprocess_quantum_data,
    save_quantum_dataset,
    SOLUBILITY_BINARY_THRESHOLD,
)
from src.quantum.qsvc_model import QuantumSolubilityClassifier


@pytest.fixture
def quantum_dataset():
    """Provides a small, fast subsample of quantum-scaled ESOL data."""
    payload, scaler = load_and_preprocess_quantum_data(
        features_csv_path="data/processed/esol_features.csv",
        n_qubits=4,
        subsample_size=40,
        test_size=0.25,
        random_state=42,
    )
    return payload, scaler


def test_quantum_data_preparation(quantum_dataset):
    """Verifies quantum feature scaling, bounds [0, pi], and binary labels."""
    payload, scaler = quantum_dataset
    X_train = payload["X_train_sub"]
    y_train = payload["y_train_sub"]
    X_test = payload["X_test_sub"]
    y_test = payload["y_test_sub"]

    assert X_train.shape[1] == 4
    assert X_test.shape[1] == 4
    assert len(X_train) == 30
    assert len(X_test) == 10

    # Verify scaling bounds [0, pi]
    assert np.all(X_train >= 0.0)
    assert np.all(X_train <= np.pi + 1e-5)
    assert np.all(X_test >= -1e-5)  # slight out-of-range allowed on test, but near bounds
    assert set(np.unique(y_train)).issubset({0, 1})
    assert set(np.unique(y_test)).issubset({0, 1})


def test_quantum_circuit_initialization():
    """Verifies ZZFeatureMap construction and gate parameters."""
    qsvc = QuantumSolubilityClassifier(num_qubits=4, reps=2, entanglement="linear")
    assert qsvc.num_qubits == 4
    assert qsvc.reps == 2
    assert qsvc.feature_map.num_qubits == 4
    assert qsvc.feature_map.depth() > 0
    gate_counts = dict(qsvc.feature_map.count_ops())
    assert "h" in gate_counts
    assert "cx" in gate_counts


def test_quantum_kernel_matrix_properties():
    """Verifies quantum Gram matrix mathematical invariants: symmetry & self-fidelity."""
    qsvc = QuantumSolubilityClassifier(num_qubits=4, reps=1, entanglement="linear")
    dummy_X = np.array([
        [0.1, 0.5, 1.2, 2.0],
        [0.8, 1.5, 0.3, 2.8],
        [2.1, 0.2, 1.9, 0.7],
    ])
    K = qsvc.compute_kernel_matrix(dummy_X)
    
    assert K.shape == (3, 3)
    # Self fidelity must be 1.0
    np.testing.assert_allclose(np.diag(K), np.ones(3), atol=1e-5)
    # Symmetry: K == K.T
    np.testing.assert_allclose(K, K.T, atol=1e-5)
    # Values between 0 and 1
    assert np.all(K >= 0.0)
    assert np.all(K <= 1.0 + 1e-5)


def test_qsvc_fit_predict_metrics(quantum_dataset):
    """Tests end-to-end training, probability output, and metric computation."""
    payload, _ = quantum_dataset
    X_train = payload["X_train_sub"]
    y_train = payload["y_train_sub"]
    X_test = payload["X_test_sub"]
    y_test = payload["y_test_sub"]

    qsvc = QuantumSolubilityClassifier(num_qubits=4, reps=1, entanglement="linear", c_param=1.0)
    qsvc.fit(X_train, y_train)

    assert qsvc.is_fitted
    preds = qsvc.predict(X_test)
    assert len(preds) == len(X_test)
    assert set(np.unique(preds)).issubset({0, 1})

    probs = qsvc.predict_proba(X_test)
    assert probs.shape == (len(X_test), 2)
    np.testing.assert_allclose(np.sum(probs, axis=1), np.ones(len(X_test)), atol=1e-5)

    metrics = qsvc.evaluate_metrics(X_test, y_test)
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1_score" in metrics
    assert "roc_auc" in metrics
    assert 0.0 <= metrics["accuracy"] <= 1.0


def test_qsvc_model_save_and_load(quantum_dataset, tmp_path):
    """Verifies that trained QSVC can be serialized and deserialized accurately."""
    payload, _ = quantum_dataset
    X_train = payload["X_train_sub"]
    y_train = payload["y_train_sub"]
    X_test = payload["X_test_sub"]

    model = QuantumSolubilityClassifier(num_qubits=4, reps=1, c_param=1.0)
    model.fit(X_train, y_train)

    orig_preds = model.predict(X_test)
    save_path = tmp_path / "test_qsvc.joblib"
    model.save_model(str(save_path))
    assert save_path.exists()

    loaded_model = QuantumSolubilityClassifier.load_model(str(save_path))
    loaded_preds = loaded_model.predict(X_test)

    np.testing.assert_array_equal(orig_preds, loaded_preds)
