"""
Quantum Support Vector Classifier (QSVC) & Fidelity Quantum Kernel for Q-MolGen.
Implements quantum-enhanced molecular property prediction using parameterized quantum circuits (ZZFeatureMap)
and exact statevector fidelity kernel evaluation.
"""

import json
import logging
import time
from pathlib import Path
from typing import Dict, Optional, Tuple, Union

import joblib
import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.svm import SVC

# Qiskit 2.x imports
from qiskit.circuit.library import zz_feature_map
from qiskit.quantum_info import Statevector

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class QuantumSolubilityClassifier(BaseEstimator, ClassifierMixin):
    """
    Quantum Support Vector Classifier (QSVC) for molecular solubility categorization.
    
    Uses a Parameterized Quantum Feature Map (ZZFeatureMap) to embed scaled continuous
    molecular descriptors into a 2^n dimensional quantum Hilbert space, computing
    quantum transition fidelities |<phi(x_i)|phi(x_j)>|^2 as the SVM kernel.
    """

    def __init__(
        self,
        num_qubits: int = 4,
        reps: int = 2,
        entanglement: str = "linear",
        c_param: float = 1.0,
        feature_map_type: str = "zz",
    ):
        self.num_qubits = num_qubits
        self.reps = reps
        self.entanglement = entanglement
        self.c_param = c_param
        self.feature_map_type = feature_map_type

        self.feature_map = None
        self.svc_model = None
        self.is_fitted = False
        self.train_kernel_matrix_ = None
        self.train_statevectors_ = None

        self._initialize_quantum_circuit()

    def _initialize_quantum_circuit(self):
        """Constructs the parameterized quantum feature map."""
        self.feature_map = zz_feature_map(
            feature_dimension=self.num_qubits,
            reps=self.reps,
            entanglement=self.entanglement,
        )
        logger.info(
            f"Initialized Quantum Feature Map: {self.feature_map_type.upper()} "
            f"({self.num_qubits} qubits, {self.reps} reps, '{self.entanglement}' entanglement, "
            f"Circuit Depth: {self.feature_map.depth()}, Gates: {dict(self.feature_map.count_ops())})"
        )

    def embed_to_statevectors(self, X: np.ndarray) -> np.ndarray:
        """
        Maps classical data matrix X to quantum statevectors |Phi(x)> in C^(2^n).
        
        Parameters
        ----------
        X : np.ndarray of shape (N, num_qubits)

        Returns
        -------
        states : np.ndarray of shape (N, 2^num_qubits), complex128
        """
        states = []
        for x_row in X:
            bound_circ = self.feature_map.assign_parameters(x_row)
            sv = Statevector.from_instruction(bound_circ).data
            states.append(sv)
        return np.array(states, dtype=np.complex128)

    def compute_kernel_matrix(
        self,
        X1: np.ndarray,
        X2: Optional[np.ndarray] = None,
        states1: Optional[np.ndarray] = None,
        states2: Optional[np.ndarray] = None,
    ) -> np.ndarray:
        """
        Computes the quantum fidelity Gram matrix:
            K_Q(x_i, x_j) = |<Phi(x_i) | Phi(x_j)>|^2 = |(V_1 @ V_2^dagger)_{i,j}|^2
        
        Parameters
        ----------
        X1 : np.ndarray of shape (N, num_qubits)
        X2 : np.ndarray of shape (M, num_qubits), optional
        states1 : precomputed quantum statevectors for X1, optional
        states2 : precomputed quantum statevectors for X2, optional

        Returns
        -------
        K : np.ndarray of shape (N, N) or (N, M)
        """
        if states1 is None:
            states1 = self.embed_to_statevectors(X1)

        if X2 is None and states2 is None:
            # Self-kernel K(X1, X1)
            inner_prods = states1 @ states1.conj().T
            K = np.abs(inner_prods) ** 2
            # Numerical precision: exact unit diagonal
            np.fill_diagonal(K, 1.0)
            return np.clip(K, 0.0, 1.0)
        else:
            if states2 is None:
                states2 = self.embed_to_statevectors(X2)
            inner_prods = states1 @ states2.conj().T
            K = np.abs(inner_prods) ** 2
            return np.clip(K, 0.0, 1.0)

    def fit(self, X: np.ndarray, y: np.ndarray) -> "QuantumSolubilityClassifier":
        """
        Fits the Quantum Support Vector Classifier.
        
        1. Computes quantum statevectors for training samples.
        2. Computes the N x N quantum Gram matrix using quantum state fidelity.
        3. Solves the dual quadratic programming problem with penalty C.
        """
        t0 = time.time()
        logger.info(f"Embedding {len(X)} samples into {2**self.num_qubits}-dimensional Hilbert space...")
        self.train_statevectors_ = self.embed_to_statevectors(X)
        self.train_kernel_matrix_ = self.compute_kernel_matrix(X, states1=self.train_statevectors_)
        
        # Train classical SVC with precomputed quantum kernel
        self.svc_model = SVC(kernel="precomputed", C=self.c_param, probability=True)
        self.svc_model.fit(self.train_kernel_matrix_, y)
        self.X_train_ = np.copy(X)
        self.classes_ = np.unique(y)
        self.is_fitted = True

        fit_time = time.time() - t0
        n_support_vectors = len(self.svc_model.support_)
        logger.info(
            f"QSVC fit complete in {fit_time:.3f}s. Support vectors: {n_support_vectors}/{len(X)} "
            f"({n_support_vectors / len(X) * 100:.1f}%)"
        )
        return self

    def predict(self, X: np.ndarray, precomputed_kernel: Optional[np.ndarray] = None) -> np.ndarray:
        """Predicts binary solubility class (1=Soluble, 0=Insoluble)."""
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() first.")
        if precomputed_kernel is not None:
            return self.svc_model.predict(precomputed_kernel)
        test_kernel = self.compute_kernel_matrix(X, states2=self.train_statevectors_)
        return self.svc_model.predict(test_kernel)

    def predict_proba(self, X: np.ndarray, precomputed_kernel: Optional[np.ndarray] = None) -> np.ndarray:
        """Predicts class probabilities using Platt scaling over quantum kernel space."""
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() first.")
        if precomputed_kernel is not None:
            return self.svc_model.predict_proba(precomputed_kernel)
        test_kernel = self.compute_kernel_matrix(X, states2=self.train_statevectors_)
        return self.svc_model.predict_proba(test_kernel)

    def decision_function(self, X: np.ndarray, precomputed_kernel: Optional[np.ndarray] = None) -> np.ndarray:
        """Computes signed distance to the quantum separating hyperplane."""
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() first.")
        if precomputed_kernel is not None:
            return self.svc_model.decision_function(precomputed_kernel)
        test_kernel = self.compute_kernel_matrix(X, states2=self.train_statevectors_)
        return self.svc_model.decision_function(test_kernel)

    def evaluate_metrics(
        self,
        X_test: np.ndarray,
        y_test: np.ndarray,
        is_train: bool = False,
    ) -> Dict[str, Union[float, list, int, dict]]:
        """
        Computes standard classification metrics on given partition.
        """
        if is_train and self.train_kernel_matrix_ is not None:
            kernel = self.train_kernel_matrix_
        else:
            kernel = self.compute_kernel_matrix(X_test, states2=self.train_statevectors_)

        preds = self.predict(X_test, precomputed_kernel=kernel)
        probs = self.predict_proba(X_test, precomputed_kernel=kernel)[:, 1]
        cm = confusion_matrix(y_test, preds)

        metrics = {
            "accuracy": float(accuracy_score(y_test, preds)),
            "precision": float(precision_score(y_test, preds, zero_division=0)),
            "recall": float(recall_score(y_test, preds, zero_division=0)),
            "f1_score": float(f1_score(y_test, preds, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, probs)),
            "confusion_matrix": cm.tolist(),
            "n_samples": int(len(y_test)),
            "n_support_vectors": int(len(self.svc_model.support_)),
            "circuit_depth": int(self.feature_map.depth()),
            "gate_counts": dict(self.feature_map.count_ops()),
        }
        return metrics

    def circuit_text_diagram(self) -> str:
        """Returns ASCII text drawing of the quantum circuit."""
        return str(self.feature_map.draw(output="text"))

    def save_model(self, filepath: str):
        """Serializes trained QSVC and configuration."""
        out_path = Path(filepath)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        bundle = {
            "num_qubits": self.num_qubits,
            "reps": self.reps,
            "entanglement": self.entanglement,
            "c_param": self.c_param,
            "feature_map_type": self.feature_map_type,
            "svc_model": self.svc_model,
            "X_train_": self.X_train_,
            "train_statevectors_": self.train_statevectors_,
            "classes_": self.classes_,
        }
        joblib.dump(bundle, out_path)
        logger.info(f"Saved QSVC model bundle to: {filepath}")

    @classmethod
    def load_model(cls, filepath: str) -> "QuantumSolubilityClassifier":
        """Loads and reconstructs a serialized QSVC model."""
        in_path = Path(filepath)
        if not in_path.exists():
            raise FileNotFoundError(f"Model file not found at: {filepath}")
        bundle = joblib.load(in_path)
        instance = cls(
            num_qubits=bundle["num_qubits"],
            reps=bundle["reps"],
            entanglement=bundle["entanglement"],
            c_param=bundle["c_param"],
            feature_map_type=bundle["feature_map_type"],
        )
        instance.svc_model = bundle["svc_model"]
        instance.X_train_ = bundle["X_train_"]
        instance.train_statevectors_ = bundle.get("train_statevectors_")
        instance.classes_ = bundle["classes_"]
        instance.is_fitted = True
        return instance


def train_and_evaluate_qsvc(
    data_npz_path: str = "data/processed/quantum_esol_4q.npz",
    output_model_path: str = "models/quantum/qsvc_esol_model.joblib",
    output_metrics_path: str = "models/quantum/qsvc_metrics.json",
    use_subsample: bool = False,
) -> Tuple[QuantumSolubilityClassifier, Dict]:
    """
    Loads preprocessed quantum data, trains QSVC, and logs comprehensive evaluation metrics.
    Supports both subsample and full Delaney ESOL dataset (1,128 molecules).
    """
    npz_data = np.load(data_npz_path)
    if use_subsample:
        X_train = npz_data["X_train_sub"]
        y_train = npz_data["y_train_sub"]
        X_test = npz_data["X_test_sub"]
        y_test = npz_data["y_test_sub"]
        logger.info(f"Training QSVC on Stratified Subsample: Train={len(X_train)}, Test={len(X_test)}")
    else:
        X_train = npz_data["X_train_full"]
        y_train = npz_data["y_train_full"]
        X_test = npz_data["X_test_full"]
        y_test = npz_data["y_test_full"]
        logger.info(f"Training QSVC on Full Dataset: Train={len(X_train)}, Test={len(X_test)}")

    model = QuantumSolubilityClassifier(
        num_qubits=4,
        reps=2,
        entanglement="linear",
        c_param=1.0,
    )
    t_start = time.time()
    model.fit(X_train, y_train)
    total_fit_time = time.time() - t_start

    train_metrics = model.evaluate_metrics(X_train, y_train, is_train=True)
    test_metrics = model.evaluate_metrics(X_test, y_test, is_train=False)

    results = {
        "model_type": "Quantum Support Vector Classifier (QSVC)",
        "quantum_feature_map": "ZZFeatureMap (Second-Order Pauli Expansion)",
        "num_qubits": 4,
        "circuit_depth": test_metrics["circuit_depth"],
        "gate_counts": test_metrics["gate_counts"],
        "training_time_sec": round(total_fit_time, 4),
        "dataset_split": "Subsample (200 molecules)" if use_subsample else f"Full ({len(X_train)+len(X_test)} molecules)",
        "train_metrics": train_metrics,
        "test_metrics": test_metrics,
    }

    # Save artifacts
    model.save_model(output_model_path)
    out_metrics_p = Path(output_metrics_path)
    out_metrics_p.parent.mkdir(parents=True, exist_ok=True)
    with open(out_metrics_p, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(
        f"QSVC Evaluation Results ({results['dataset_split']}): "
        f"Test Accuracy: {test_metrics['accuracy']:.4f} | "
        f"Test Precision: {test_metrics['precision']:.4f} | "
        f"Test Recall: {test_metrics['recall']:.4f} | "
        f"Test F1: {test_metrics['f1_score']:.4f} | "
        f"Test ROC-AUC: {test_metrics['roc_auc']:.4f}"
    )

    return model, results


if __name__ == "__main__":
    train_and_evaluate_qsvc()
