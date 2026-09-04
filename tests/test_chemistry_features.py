"""
Tests for Phase 1 Chemistry & Cheminformatics Feature Extraction
"""

import pytest
from src.features.chemistry_intro import compute_all_descriptors


def test_aspirin_descriptors():
    # Aspirin: CC(=O)Oc1ccccc1C(=O)O
    data = compute_all_descriptors("CC(=O)Oc1ccccc1C(=O)O")
    assert data is not None
    assert 180.0 < data["molecular_weight"] < 180.5
    assert 1.0 < data["logp"] < 1.5
    assert 60.0 < data["tpsa"] < 65.0
    assert data["hbd"] == 1
    assert data["hba"] == 3
    assert data["ro5_compliant"] is True
    assert data["ro5_violations"] == 0


def test_invalid_smiles_handling():
    # Invalid SMILES syntax
    data = compute_all_descriptors("Invalid_Not_A_Molecule_123")
    assert data is None


def test_caffeine_descriptors():
    # Caffeine: Cn1c(=O)c2c(ncn2C)n(C)c1=O
    data = compute_all_descriptors("Cn1cnc2c1c(=O)n(c(=O)n2C)C")
    assert data is not None
    assert data["hbd"] == 0
    assert data["hba"] == 3
    assert data["ring_count"] == 2
    assert data["ro5_compliant"] is True
