"""
Tests for Phase 5: Delaney ESOL Exploratory Data Analysis (EDA)
"""

import os
import pytest
from src.preprocessing.esol_eda import run_esol_eda, FIGURES_DIR


def test_esol_eda_execution_and_figures():
    results = run_esol_eda()

    # Verify molecule counts and statistics
    assert results["total_molecules"] == 1128
    assert -4.0 < results["target_mean"] < -2.0
    assert 1.5 < results["target_std"] < 2.5

    # Verify strong negative correlation between Molecular Weight and Solubility
    assert results["solubility_mw_correlation"] < -0.5, "Expected strong negative correlation between MW and Solubility"

    # Verify all figures generated on disk
    for fig_path in results["figures_generated"]:
        assert os.path.exists(fig_path), f"Figure {fig_path} was not created"
        assert os.path.getsize(fig_path) > 1000, f"Figure {fig_path} is empty or corrupted"
