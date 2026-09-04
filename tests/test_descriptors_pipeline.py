"""
Tests for Phase 6: RDKit Molecular Descriptor Extraction Pipeline
"""

import os
import pytest
import pandas as pd
from src.features.descriptors import (
    extract_single_molecule_descriptors,
    process_esol_features,
    PROCESSED_DATA_PATH
)


def test_single_molecule_extraction():
    # Test Benzene
    data_benzene = extract_single_molecule_descriptors("c1ccccc1")
    assert data_benzene is not None
    assert data_benzene["canonical_smiles"] == "c1ccccc1"
    assert round(data_benzene["molecular_weight"], 1) == 78.1
    assert data_benzene["ring_count"] == 1
    assert data_benzene["num_aromatic_rings"] == 1
    assert data_benzene["hbd"] == 0
    assert data_benzene["ro5_compliant"] is True

    # Test Invalid SMILES Handling
    data_invalid = extract_single_molecule_descriptors("INVALID_123_SMILES")
    assert data_invalid is None
    assert extract_single_molecule_descriptors("") is None
    assert extract_single_molecule_descriptors(None) is None


def test_esol_features_matrix_generation():
    df_features = process_esol_features()

    # Verify file existence and non-zero size
    assert os.path.exists(PROCESSED_DATA_PATH)
    assert os.path.getsize(PROCESSED_DATA_PATH) > 1000

    # Verify rows (all 1128 molecules in Delaney ESOL)
    assert len(df_features) == 1128

    # Verify columns
    expected_cols = [
        "compound_id", "canonical_smiles", "measured_solubility_logs",
        "molecular_weight", "logp", "tpsa", "hbd", "hba",
        "rotatable_bonds", "ring_count", "heavy_atom_count",
        "num_aromatic_rings", "fraction_csp3", "molar_refractivity",
        "ro5_violations", "ro5_compliant"
    ]
    for col in expected_cols:
        assert col in df_features.columns, f"Missing expected column: {col}"

    # Verify no nulls in computed descriptors
    assert df_features.isnull().sum().sum() == 0, "Unexpected null values in processed feature matrix"
