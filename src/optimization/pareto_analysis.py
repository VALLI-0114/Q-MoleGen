"""
Phase 17: Multi-Objective Pareto Frontier Analysis and Visualization Engine for Q-MolGen.
Generates publication-quality charts illustrating Pareto non-dominated sorting and multi-property trade-offs.
"""

import json
import logging
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Add workspace root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski, QED

from src.optimization.pareto_optimizer import CandidateOptimizer, is_pareto_efficient

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

FIGURES_DIR = Path("docs/figures")
FIGURES_DIR.mkdir(parents=True, exist_ok=True)


def run_pareto_analysis(sample_size: int = 60) -> Tuple[pd.DataFrame, Dict]:
    """
    Runs multi-objective candidate evaluation on a diverse population and performs Pareto analysis.
    """
    logger.info(f"Initiating Pareto frontier analysis with sample size N={sample_size}...")
    optimizer = CandidateOptimizer()
    campaign_res = optimizer.run_generative_campaign(target_count=sample_size, top_k=sample_size)
    candidates = campaign_res["all_candidates"]

    rows = []
    for c in candidates:
        rows.append({
            "candidate_id": c.get("candidate_id", ""),
            "smiles": c["smiles"],
            "pred_logs": c["pred_solubility_logs"],
            "qed": c["qed_drug_likeness"],
            "quantum_fidelity": c["quantum_fidelity_prob"],
            "sa_score": c["synthetic_accessibility"],
            "homo_lumo_gap": c["homo_lumo_gap_ev"],
            "dipole_moment": c["dipole_moment_debye"],
            "composite_score": c["composite_score"],
            "ro5_compliant": c["ro5_compliant"],
            "is_pareto": c["is_pareto_optimal"],
            "mw": c["descriptors"]["molecular_weight"],
            "logp": c["descriptors"]["logp"],
            "tpsa": c["descriptors"]["tpsa"],
        })

    df = pd.DataFrame(rows)
    logger.info(f"Processed {len(df)} candidates. Pareto-optimal count: {df['is_pareto'].sum()}")

    # Generate Figures
    generate_pareto_frontier_plot(df)
    generate_property_tradeoffs_plot(df)

    summary = {
        "total_evaluated": int(len(df)),
        "pareto_optimal_count": int(df["is_pareto"].sum()),
        "pareto_optimal_percentage": round(float(df["is_pareto"].mean() * 100), 2),
        "mean_composite_score": round(float(df["composite_score"].mean()), 2),
        "max_composite_score": round(float(df["composite_score"].max()), 2),
        "mean_qed": round(float(df["qed"].mean()), 3),
        "mean_pred_logs": round(float(df["pred_logs"].mean()), 3),
        "ro5_compliance_rate": round(float(df["ro5_compliant"].mean() * 100), 2),
    }

    metrics_path = Path("models/quantum/pareto_summary_metrics.json")
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    with open(metrics_path, "w") as f:
        json.dump(summary, f, indent=2)
    logger.info(f"Saved Pareto summary metrics to {metrics_path}")

    return df, summary


def generate_pareto_frontier_plot(df: pd.DataFrame):
    """
    Plots Predicted Solubility (LogS) vs QED Drug-Likeness with Pareto Frontier Boundary.
    """
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)

    # Separate Pareto and non-Pareto
    pareto_df = df[df["is_pareto"]].sort_values("pred_logs")
    non_pareto_df = df[~df["is_pareto"]]

    # Scatter non-Pareto points
    sc1 = ax.scatter(
        non_pareto_df["pred_logs"],
        non_pareto_df["qed"],
        c=non_pareto_df["quantum_fidelity"],
        cmap="coolwarm",
        s=80,
        alpha=0.6,
        edgecolors="none",
        label="Dominated Candidates",
    )

    # Scatter Pareto points
    sc2 = ax.scatter(
        pareto_df["pred_logs"],
        pareto_df["qed"],
        c=pareto_df["quantum_fidelity"],
        cmap="coolwarm",
        s=160,
        alpha=0.95,
        edgecolors="black",
        linewidths=1.8,
        label="Pareto-Optimal Frontier",
    )

    # Draw step-wise / frontier connecting line
    if len(pareto_df) > 1:
        # Sort descending by solubility for stepped curve
        sorted_p = pareto_df.sort_values(by=["pred_logs", "qed"], ascending=[True, True])
        ax.plot(
            sorted_p["pred_logs"],
            sorted_p["qed"],
            color="#2563eb",
            linestyle="--",
            linewidth=2.0,
            alpha=0.85,
            label="Pareto Boundary (Non-Dominated)",
        )

    # Annotate top candidates
    top_3 = df.nlargest(3, "composite_score")
    for _, row in top_3.iterrows():
        ax.annotate(
            f"{row['candidate_id']} ({row['composite_score']:.1f})",
            (row["pred_logs"], row["qed"]),
            textcoords="offset points",
            xytext=(10, 8),
            ha="left",
            fontsize=9,
            fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.2", facecolor="#fef08a", edgecolor="#ca8a04", alpha=0.9),
            arrowprops=dict(arrowstyle="->", connectionstyle="arc3,rad=0.2", color="#854d0e"),
        )

    cbar = plt.colorbar(sc2, ax=ax)
    cbar.set_label("QSVC Quantum Solubility Probability", fontsize=11, fontweight="bold")

    ax.set_title("Q-MolGen Phase 17: Multi-Objective Pareto Frontier (LogS vs. QED)", fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel("Predicted Aqueous Solubility (LogS, mol/L) [Higher is Better]", fontsize=11, fontweight="bold")
    ax.set_ylabel("Quantitative Estimate of Drug-Likeness (QED) [Higher is Better]", fontsize=11, fontweight="bold")
    ax.legend(loc="lower left", frameon=True, facecolor="white", edgecolor="#cbd5e1", fontsize=10)
    ax.grid(True, linestyle=":", alpha=0.6)

    plt.tight_layout()
    fig_path = FIGURES_DIR / "13_pareto_frontier.png"
    fig.savefig(fig_path, dpi=300)
    plt.close(fig)
    logger.info(f"Saved Pareto frontier visualization to: {fig_path}")


def generate_property_tradeoffs_plot(df: pd.DataFrame):
    """
    Plots correlation matrix and distribution comparison across multi-objective dimensions.
    """
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    fig, axes = plt.subplots(1, 2, figsize=(14, 5.5), dpi=300)

    # Left: Correlation Matrix
    cols = ["pred_logs", "qed", "quantum_fidelity", "sa_score", "homo_lumo_gap", "composite_score"]
    corr = df[cols].corr()
    labels = ["LogS", "QED", "QSVC Fidelity", "SA Score", "HOMO-LUMO Gap", "Composite Score"]

    sns.heatmap(
        corr,
        annot=True,
        fmt=".2f",
        cmap="vlag",
        vmin=-1,
        vmax=1,
        xticklabels=labels,
        yticklabels=labels,
        ax=axes[0],
        cbar_kws={"label": "Pearson Correlation (r)"},
    )
    axes[0].set_title("Multi-Objective Property Correlation Matrix", fontsize=12, fontweight="bold")
    axes[0].tick_params(axis="x", rotation=30)

    # Right: Composite Score Distribution (Pareto vs Non-Pareto)
    sns.boxplot(
        data=df,
        x="is_pareto",
        y="composite_score",
        palette=["#94a3b8", "#38bdf8"],
        ax=axes[1],
        width=0.4,
    )
    sns.stripplot(
        data=df,
        x="is_pareto",
        y="composite_score",
        color="black",
        alpha=0.6,
        jitter=0.2,
        size=6,
        ax=axes[1],
    )
    axes[1].set_xticklabels(["Dominated Candidates", "Pareto Optimal Frontier"])
    axes[1].set_xlabel("Pareto Classification", fontsize=11, fontweight="bold")
    axes[1].set_ylabel("Composite Prioritization Score (0-100)", fontsize=11, fontweight="bold")
    axes[1].set_title("Candidate Prioritization Score by Pareto Status", fontsize=12, fontweight="bold")
    axes[1].grid(True, linestyle=":", alpha=0.6)

    plt.tight_layout()
    fig_path = FIGURES_DIR / "14_property_tradeoffs.png"
    fig.savefig(fig_path, dpi=300)
    plt.close(fig)
    logger.info(f"Saved property trade-offs visualization to: {fig_path}")


if __name__ == "__main__":
    run_pareto_analysis(sample_size=50)
