"""
Tests for Phase 10: Morgan Fingerprint Generation & Machine Learning
"""

import os
import pytest
import numpy as np
from src.features.fingerprints import (
    smiles_to_morgan_fingerprint,
    generate_dataset_fingerprints,
    FP_OUTPUT_PATH
)
from src.classical.train_fingerprint_models import (
    train_and_evaluate_fingerprint_models,
    compare_descriptors_vs_fingerprints
)


def test_single_morgan_fingerprint():
    # Aspirin
    fp = smiles_to_morgan_fingerprint("CC(=O)Oc1ccccc1C(=O)O", radius=2, n_bits=1024)
    assert fp is not None
    assert isinstance(fp, np.ndarray)
    assert fp.shape == (1024,)
    assert fp.sum() > 0  # Should have active on-bits

    # Invalid SMILES handling
    assert smiles_to_morgan_fingerprint("INVALID") is None
    assert smiles_to_morgan_fingerprint("") is None


def test_fingerprint_model_training_and_comparison():
    results = train_and_evaluate_fingerprint_models()

    # Verify models trained
    assert "fingerprint_ridge" in results
    assert "fingerprint_random_forest" in results
    assert "fingerprint_svr" in results

    # Verify empirical R2 metrics (SVR > 0.70, Random Forest > 0.60)
    assert results["fingerprint_random_forest"]["r2_test"] > 0.60
    assert results["fingerprint_svr"]["r2_test"] > 0.70

    # Test representation comparison dataframe
    df_comp = compare_descriptors_vs_fingerprints()
    assert len(df_comp) >= 3
    assert "Descriptor R²" in df_comp.columns
    assert "Fingerprint R²" in df_comp.columns
