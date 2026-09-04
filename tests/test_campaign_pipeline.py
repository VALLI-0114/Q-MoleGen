"""
Automated unit and integration test suite for Phase 18: Integrated Discovery Pipeline & Campaign Orchestrator.
"""

from pathlib import Path
import pytest
from src.generation.campaign_pipeline import DiscoveryCampaignPipeline


def test_internal_diversity_calculation():
    """Verifies that Morgan fingerprint pairwise Tanimoto diversity returns a float between 0 and 1."""
    pipeline = DiscoveryCampaignPipeline()
    smiles_list = ["c1ccccc1", "c1ccncc1", "CC(=O)O", "CC(C)Cc1ccc(cc1)C(C)C(=O)O"]
    diversity = pipeline.compute_internal_diversity(smiles_list)
    
    assert 0.0 <= diversity <= 1.0
    assert diversity > 0.3  # Diverse set of molecules should have positive diversity


def test_end_to_end_campaign_execution(tmp_path):
    """Verifies full execution of a small discovery campaign with summary statistics and CSV export."""
    pipeline = DiscoveryCampaignPipeline()
    results = pipeline.execute_campaign(
        campaign_name="Test CI/CD Campaign",
        target_count=10,
        top_k=5,
    )

    summary = results["summary"]
    assert summary["campaign_name"] == "Test CI/CD Campaign"
    assert summary["evaluated_valid_count"] >= 10
    assert summary["validity_rate"] == 100.0
    assert summary["uniqueness_rate"] == 100.0
    assert 0.0 <= summary["novelty_rate"] <= 100.0
    assert summary["pareto_optimal_count"] > 0
    assert 0.0 <= summary["internal_diversity_score"] <= 1.0

    top_candidates = results["top_candidates"]
    assert len(top_candidates) <= 5
    assert all("candidate_id" in c for c in top_candidates)
    assert all("is_pareto_optimal" in c for c in top_candidates)
    assert all("composite_score" in c for c in top_candidates)

    # Verify CSV file output exists
    csv_path = Path("data/processed/generated_candidates_library.csv")
    assert csv_path.exists()
    assert csv_path.stat().st_size > 0
