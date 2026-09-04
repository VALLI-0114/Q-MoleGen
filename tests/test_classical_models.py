"""
Tests for Phase 8: Classical Machine Learning Baseline Models
"""

import os
import pytest
from src.classical.train_baselines import (
    train_and_evaluate_baselines,
    predict_solubility_with_model,
    MODELS_DIR,
    FEATURE_COLUMNS
)
from src.features.descriptors import extract_single_molecule_descriptors


def test_classical_models_training_and_serialization():
    results = train_and_evaluate_baselines()

    # Verify all 5 models trained
    expected_models = [
        "linear_regression",
        "ridge_regression",
        "random_forest",
        "support_vector_regressor",
        "gradient_boosting"
    ]
    for m in expected_models:
        assert m in results, f"Missing model: {m}"
        assert results[m]["r2_test"] > 0.70, f"R² below threshold for {m}: {results[m]['r2_test']}"
        assert results[m]["mae"] < 1.0, f"MAE too high for {m}: {results[m]['mae']}"
        assert os.path.exists(results[m]["model_path"])

    # Verify best model exceeds 0.80 R2
    best_r2 = max(results[m]["r2_test"] for m in expected_models)
    assert best_r2 >= 0.80, f"Expected best model R² >= 0.80, got {best_r2}"


def test_single_molecule_inference():
    # Aspirin: CC(=O)Oc1ccccc1C(=O)O
    desc = extract_single_molecule_descriptors("CC(=O)Oc1ccccc1C(=O)O")
    assert desc is not None

    pred_rf = predict_solubility_with_model(desc, model_name="random_forest")
    pred_svr = predict_solubility_with_model(desc, model_name="support_vector_regressor")
    pred_gbr = predict_solubility_with_model(desc, model_name="gradient_boosting")

    # Aspirin experimental LogS is ~ -1.4 to -2.3
    assert -4.0 < pred_rf < 0.0, f"Aspirin predicted LogS out of expected range: {pred_rf}"
    assert -4.0 < pred_svr < 0.0, f"Aspirin predicted LogS out of expected range: {pred_svr}"
    assert -4.0 < pred_gbr < 0.0, f"Aspirin predicted LogS out of expected range: {pred_gbr}"
