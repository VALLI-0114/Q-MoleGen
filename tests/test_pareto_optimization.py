"""
Automated unit and integration test suite for Phase 17: Multi-Objective Pareto Optimization.
"""

import numpy as np
import pytest
from rdkit import Chem

from src.optimization.pareto_optimizer import (
    CandidateOptimizer,
    compute_synthetic_accessibility_heuristic,
    is_pareto_efficient,
)


def test_synthetic_accessibility_bounds():
    """Verifies that the synthetic accessibility heuristic respects [1.0, 10.0] bounds."""
    aspirin = Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O")
    complex_steroid = Chem.MolFromSmiles("CC12CCC3C(C1CCC2O)CCC4=CC(=O)CCC34C")
    
    sa_aspirin = compute_synthetic_accessibility_heuristic(aspirin)
    sa_complex = compute_synthetic_accessibility_heuristic(complex_steroid)

    assert 1.0 <= sa_aspirin <= 10.0
    assert 1.0 <= sa_complex <= 10.0
    # Simple aspirin should have lower synthetic complexity than steroid
    assert sa_aspirin < sa_complex


def test_pareto_efficiency_corner_cases():
    """Verifies non-dominated sorting logic on synthetic 2D/3D cost matrices."""
    # Point 0: [10, 10] dominates Point 1: [5, 5] and Point 2: [8, 9]
    # Point 3: [12, 4] is non-dominated (higher objective 0, lower objective 1)
    costs = np.array([
        [10.0, 10.0],
        [5.0, 5.0],
        [8.0, 9.0],
        [12.0, 4.0],
        [4.0, 12.0],
    ])

    efficient_mask = is_pareto_efficient(costs)
    assert efficient_mask[0] is True or efficient_mask[0] == 1  # [10, 10]
    assert efficient_mask[1] is False or efficient_mask[1] == 0  # [5, 5] dominated
    assert efficient_mask[2] is False or efficient_mask[2] == 0  # [8, 9] dominated by [10, 10]
    assert efficient_mask[3] is True or efficient_mask[3] == 1  # [12, 4] Pareto optimal
    assert efficient_mask[4] is True or efficient_mask[4] == 1  # [4, 12] Pareto optimal


def test_single_candidate_evaluation_integrity():
    """Verifies that single candidate evaluation returns all required keys and valid types."""
    optimizer = CandidateOptimizer()
    res = optimizer.evaluate_single_candidate("c1ccc(O)cc1C(=O)O")  # Salicylic acid
    
    assert res is not None
    assert "pred_solubility_logs" in res
    assert "qed_drug_likeness" in res
    assert "quantum_fidelity_prob" in res
    assert "synthetic_accessibility" in res
    assert "homo_lumo_gap_ev" in res
    assert "ro5_compliant" in res
    assert "composite_score" in res
    assert "svg" in res

    assert 0.0 <= res["qed_drug_likeness"] <= 1.0
    assert 0.0 <= res["quantum_fidelity_prob"] <= 1.0
    assert 0.0 <= res["composite_score"] <= 100.0
    assert "<svg" in res["svg"]


def test_campaign_generation_and_ranking():
    """Verifies end-to-end small campaign execution with sorting and Pareto flag assignment."""
    optimizer = CandidateOptimizer()
    campaign = optimizer.run_generative_campaign(target_count=10, top_k=5)

    assert campaign["total_generated"] >= 10
    assert campaign["pareto_optimal_count"] > 0
    assert len(campaign["top_candidates"]) <= 5

    # Check sort order
    scores = [c["composite_score"] for c in campaign["top_candidates"]]
    assert scores == sorted(scores, reverse=True)
