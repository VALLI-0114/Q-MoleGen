"""
Tests for Phase 7: Molecular Visualization Engine
"""

import os
import pytest
from src.features.visualization import smiles_to_svg, render_molecule_grid_image


def test_smiles_to_svg_rendering():
    # Aspirin
    svg = smiles_to_svg("CC(=O)Oc1ccccc1C(=O)O")
    assert svg is not None
    assert "<svg" in svg
    assert "</svg>" in svg

    # Substructure highlight
    svg_hl = smiles_to_svg("CC(=O)Oc1ccccc1C(=O)O", highlight_substructure="c1ccccc1")
    assert svg_hl is not None
    assert "<svg" in svg_hl

    # Invalid SMILES
    assert smiles_to_svg("INVALID_NOT_A_MOL") is None
    assert smiles_to_svg("") is None


def test_molecule_grid_image_rendering(tmp_path):
    smiles_batch = [
        "CC(=O)Oc1ccccc1C(=O)O",  # Aspirin
        "Cn1c(=O)c2c(ncn2C)n(C)c1=O",  # Caffeine
        "CC(=O)Nc1ccc(O)cc1",  # Paracetamol
    ]
    output_png = str(tmp_path / "test_grid.png")
    saved_path = render_molecule_grid_image(
        smiles_batch,
        legends=["Aspirin", "Caffeine", "Paracetamol"],
        output_path=output_png
    )
    assert saved_path == output_png
    assert os.path.exists(output_png)
    assert os.path.getsize(output_png) > 1000
