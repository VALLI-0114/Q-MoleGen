"""
Automated unit and integration test suite for Phase 19: Explainable AI & Molecular Substructure Attribution.
"""

from pathlib import Path
import pytest
from src.features.molecular_xai import (
    compute_atomic_contributions,
    generate_atom_attribution_svg,
    generate_xai_comparison_figure,
)


def test_atomic_contributions_aspirin():
    """Verifies atom-level LogP, MR, and partial charge computation on Aspirin."""
    aspirin_smiles = "CC(=O)Oc1ccccc1C(=O)O"
    res = compute_atomic_contributions(aspirin_smiles)

    assert res is not None
    assert res["smiles"] == aspirin_smiles
    assert res["num_atoms"] == 13
    assert len(res["atoms"]) == 13
    assert res["num_hydrophilic_atoms"] > 0
    assert res["num_lipophilic_atoms"] > 0

    # Verify first atom fields
    atom0 = res["atoms"][0]
    assert "atom_idx" in atom0
    assert "symbol" in atom0
    assert "logp_contrib" in atom0
    assert "mr_contrib" in atom0
    assert "partial_charge" in atom0
    assert "role" in atom0


def test_invalid_smiles_handling():
    """Verifies graceful handling of invalid SMILES."""
    assert compute_atomic_contributions("INVALID_XYZ_123") is None
    assert generate_atom_attribution_svg("INVALID_XYZ_123") == ""


def test_atom_attribution_svg_generation():
    """Verifies SVG generation with highlighted atom weights."""
    svg = generate_atom_attribution_svg("c1ccncc1", property_name="logp")
    assert svg != ""
    assert "<svg" in svg
    assert "</svg>" in svg


def test_xai_comparison_figure_generation(tmp_path):
    """Verifies generation of Figure 15 publication artifact."""
    fig_path = tmp_path / "test_15_attribution.png"
    out = generate_xai_comparison_figure(output_path=fig_path)
    assert fig_path.exists()
    assert fig_path.stat().st_size > 1000
