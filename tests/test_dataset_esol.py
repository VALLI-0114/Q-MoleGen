"""
Tests for Phase 4: Delaney ESOL Dataset Acquisition & Validation
"""

import os
import pytest
from src.preprocessing.download_esol import acquire_esol_dataset, OUTPUT_RAW_PATH


def test_esol_download_and_integrity():
    df, stats = acquire_esol_dataset()

    # Verify file existence
    assert os.path.exists(OUTPUT_RAW_PATH)

    # Verify dataset dimensions (Delaney contains 1128 molecules)
    assert stats["total_molecules"] == 1128
    assert stats["valid_rdkit_molecules"] == 1128
    assert stats["invalid_molecules_count"] == 0

    # Verify expected column presence
    assert "smiles" in df.columns
    assert "measured log solubility in mols per litre" in df.columns
    assert "canonical_smiles" in df.columns

    # Verify target distribution sanity
    assert -12.0 < stats["target_min"] < -10.0
    assert 1.0 < stats["target_max"] < 3.0
    assert -4.0 < stats["target_mean"] < -2.0
