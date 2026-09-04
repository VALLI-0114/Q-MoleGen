"""
Tests for Phase 9: Classical Model Analysis & Diagnostics
"""

import os
import pytest
from src.classical.model_analysis import run_classical_model_analysis, FIGURES_DIR


def test_model_analysis_execution_and_figures():
    results = run_classical_model_analysis()

    # Verify residual properties (mean should be close to 0 for unbiased models)
    assert abs(results["rf_mean_residual"]) < 0.25
    assert results["rf_std_residual"] < 1.0

    # Verify feature importance output
    assert len(results["top_gini_features"]) == 3
    assert len(results["top_permutation_features"]) == 3

    # Verify all 4 diagnostic figures exist
    for fig_path in results["figures_generated"]:
        assert os.path.exists(fig_path), f"Figure {fig_path} was not created"
        assert os.path.getsize(fig_path) > 1000
