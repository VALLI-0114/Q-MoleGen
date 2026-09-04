"""
Unit & Integration Tests for Molecular Generative AI & Multi-Objective Pareto Optimization Engine.
"""

import numpy as np
import pytest
from rdkit import Chem

from src.generation.generator import MoleculeGenerator
from src.optimization.pareto_optimizer import (
    CandidateOptimizer,
    compute_synthetic_accessibility_heuristic,
    is_pareto_efficient,
)


def test_molecule_generator_population():
    """Verifies that stochastic mutation generator creates valid, unique SMILES strings."""
    generator = MoleculeGenerator(seed_smiles=["c1ccccc1", "c1ccncc1"], random_state=42)
    candidates = generator.generate_candidate_population(target_count=10)

    assert len(candidates) >= 5
    for smi in candidates:
        mol = Chem.MolFromSmiles(smi)
        assert mol is not None, f"Invalid SMILES produced: {smi}"
        assert mol.GetNumHeavyAtoms() >= 4


def test_synthetic_accessibility_heuristic():
    """Verifies that synthetic accessibility scoring is bounded in [1.0, 10.0]."""
    mol_benzene = Chem.MolFromSmiles("c1ccccc1")
    mol_complex = Chem.MolFromSmiles("CC12CCC3c4ccc(O)cc4CCC3C1CCC2O")  # Steroid

    sa_benzene = compute_synthetic_accessibility_heuristic(mol_benzene)
    sa_complex = compute_synthetic_accessibility_heuristic(mol_complex)

    assert 1.0 <= sa_benzene <= 10.0
    assert 1.0 <= sa_complex <= 10.0
    assert sa_complex > sa_benzene, "Complex steroid must have higher synthetic complexity than benzene"


def test_pareto_efficiency_calculation():
    """Verifies mathematical non-dominated sorting across multi-objective cost matrix."""
    # Point 0 is dominated by Point 1 (both objectives are higher)
    # Points 1 and 2 are non-dominated (tradeoff)
    costs = np.array([
        [1.0, 2.0],  # Dominated by [2.0, 3.0]
        [2.0, 3.0],  # Pareto Optimal
        [3.0, 1.5],  # Pareto Optimal
    ])
    efficient = is_pareto_efficient(costs)
    assert not efficient[0]
    assert efficient[1]
    assert efficient[2]


def test_candidate_optimizer_evaluation():
    """Verifies multi-objective candidate evaluation on a known drug candidate."""
    optimizer = CandidateOptimizer()
    eval_res = optimizer.evaluate_single_candidate("CC(=O)Oc1ccccc1C(=O)O")  # Aspirin

    assert eval_res is not None
    assert "pred_solubility_logs" in eval_res
    assert "quantum_fidelity_prob" in eval_res
    assert "qed_drug_likeness" in eval_res
    assert "homo_lumo_gap_ev" in eval_res
    assert "composite_score" in eval_res
    assert 0.0 <= eval_res["composite_score"] <= 100.0
    assert 0.0 <= eval_res["qed_drug_likeness"] <= 1.0
    assert "<svg" in eval_res["svg"]


def test_generative_campaign_execution():
    """Verifies end-to-end generative campaign with Pareto frontier ranking."""
    optimizer = CandidateOptimizer()
    campaign = optimizer.run_generative_campaign(target_count=8, top_k=4)

    assert campaign["total_generated"] >= 4
    assert campaign["pareto_optimal_count"] >= 1
    assert len(campaign["top_candidates"]) <= 4
    assert all("is_pareto_optimal" in c for c in campaign["top_candidates"])
