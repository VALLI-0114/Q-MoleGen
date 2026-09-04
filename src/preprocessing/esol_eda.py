"""
Phase 5: Delaney ESOL Exploratory Data Analysis (EDA) Module
Generates descriptive statistical summaries, correlation matrices,
and publication-quality distribution plots for aqueous solubility and molecular properties.
"""

import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless plotting
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any

RAW_DATA_PATH = os.path.join("data", "raw", "delaney_esol.csv")
FIGURES_DIR = os.path.join("docs", "figures")


def run_esol_eda(data_path: str = RAW_DATA_PATH, output_dir: str = FIGURES_DIR) -> Dict[str, Any]:
    """
    Performs comprehensive Exploratory Data Analysis on the Delaney ESOL dataset.
    Saves high-resolution plots to output_dir and returns statistical metrics dictionary.
    """
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(data_path):
        from src.preprocessing.download_esol import acquire_esol_dataset
        df, _ = acquire_esol_dataset()
    else:
        df = pd.read_csv(data_path)

    target_col = "measured log solubility in mols per litre"
    mw_col = "Molecular Weight"
    hbd_col = "Number of H-Bond Donors"
    rings_col = "Number of Rings"
    rotb_col = "Number of Rotatable Bonds"
    tpsa_col = "Polar Surface Area"

    # 1. Descriptive Statistics
    desc_stats = df.describe().to_dict()

    # 2. Set seaborn style
    sns.set_theme(style="darkgrid")
    plt.rcParams.update({
        "figure.facecolor": "#0B0F19",
        "axes.facecolor": "#111827",
        "axes.edgecolor": "#374151",
        "axes.labelcolor": "#F9FAFB",
        "xtick.color": "#9CA3AF",
        "ytick.color": "#9CA3AF",
        "text.color": "#F9FAFB",
        "grid.color": "#1F2937",
    })

    # --- Plot 1: Solubility Distribution ---
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.histplot(df[target_col], kde=True, color="#06B6D4", bins=30, ax=ax)
    ax.axvline(df[target_col].mean(), color="#F59E0B", linestyle="--", label=f"Mean: {df[target_col].mean():.2f}")
    ax.axvline(df[target_col].median(), color="#10B981", linestyle=":", label=f"Median: {df[target_col].median():.2f}")
    ax.set_title("Delaney ESOL: Aqueous Solubility Distribution (LogS)", fontsize=13, fontweight="bold", color="#F9FAFB")
    ax.set_xlabel("Measured Log Solubility (mol/L)", fontsize=11)
    ax.set_ylabel("Frequency / Molecule Count", fontsize=11)
    ax.legend(facecolor="#111827", edgecolor="#374151")
    plt.tight_layout()
    sol_plot_path = os.path.join(output_dir, "01_solubility_distribution.png")
    fig.savefig(sol_plot_path, dpi=300)
    plt.close(fig)

    # --- Plot 2: Molecular Weight Distribution ---
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.histplot(df[mw_col], kde=True, color="#8B5CF6", bins=30, ax=ax)
    ax.axvline(500, color="#F43F5E", linestyle="--", label="Lipinski Ro5 Limit (500 Da)")
    ax.set_title("Molecular Weight Distribution (Da)", fontsize=13, fontweight="bold", color="#F9FAFB")
    ax.set_xlabel("Molecular Weight (Da)", fontsize=11)
    ax.set_ylabel("Molecule Count", fontsize=11)
    ax.legend(facecolor="#111827", edgecolor="#374151")
    plt.tight_layout()
    mw_plot_path = os.path.join(output_dir, "02_mw_distribution.png")
    fig.savefig(mw_plot_path, dpi=300)
    plt.close(fig)

    # --- Plot 3: TPSA Distribution ---
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.histplot(df[tpsa_col], kde=True, color="#10B981", bins=30, ax=ax)
    ax.axvline(140, color="#F59E0B", linestyle="--", label="Oral Bioavailability Threshold (140 Å²)")
    ax.set_title("Topological Polar Surface Area (TPSA) Distribution", fontsize=13, fontweight="bold", color="#F9FAFB")
    ax.set_xlabel("Polar Surface Area (Å²)", fontsize=11)
    ax.set_ylabel("Molecule Count", fontsize=11)
    ax.legend(facecolor="#111827", edgecolor="#374151")
    plt.tight_layout()
    tpsa_plot_path = os.path.join(output_dir, "03_tpsa_distribution.png")
    fig.savefig(tpsa_plot_path, dpi=300)
    plt.close(fig)

    # --- Plot 4: Correlation Matrix Heatmap ---
    numeric_cols = [
        target_col, mw_col, hbd_col, rings_col, rotb_col, tpsa_col
    ]
    corr_matrix = df[numeric_cols].corr()

    fig, ax = plt.subplots(figsize=(9, 7))
    sns.heatmap(
        corr_matrix,
        annot=True,
        fmt=".2f",
        cmap="mako",
        cbar=True,
        square=True,
        ax=ax,
        linewidths=0.5,
        linecolor="#1F2937",
    )
    ax.set_title("Physicochemical Pearson Correlation Heatmap", fontsize=13, fontweight="bold", color="#F9FAFB")
    plt.tight_layout()
    corr_plot_path = os.path.join(output_dir, "04_correlation_heatmap.png")
    fig.savefig(corr_plot_path, dpi=300)
    plt.close(fig)

    # --- Plot 5: Multi-Feature Outlier Boxplot ---
    fig, ax = plt.subplots(figsize=(10, 5))
    # Normalize features for comparative boxplot visualization
    normalized_df = (df[numeric_cols] - df[numeric_cols].mean()) / df[numeric_cols].std()
    sns.boxplot(data=normalized_df, palette="crest", ax=ax)
    ax.set_xticks(range(len(numeric_cols)))
    ax.set_xticklabels(
        ["LogS", "MW", "HBD", "Rings", "RotBonds", "TPSA"],
        rotation=15,
        ha="right",
        fontsize=10
    )
    ax.set_title("Z-Score Standardized Feature Distributions & Outlier Detection", fontsize=13, fontweight="bold", color="#F9FAFB")
    ax.set_ylabel("Standardized Z-Score", fontsize=11)
    plt.tight_layout()
    outlier_plot_path = os.path.join(output_dir, "05_outlier_boxplots.png")
    fig.savefig(outlier_plot_path, dpi=300)
    plt.close(fig)

    # Return key insights
    sol_mw_corr = float(corr_matrix.loc[target_col, mw_col])
    sol_hbd_corr = float(corr_matrix.loc[target_col, hbd_col])
    sol_tpsa_corr = float(corr_matrix.loc[target_col, tpsa_col])

    return {
        "total_molecules": len(df),
        "target_mean": float(df[target_col].mean()),
        "target_std": float(df[target_col].std()),
        "target_skewness": float(df[target_col].skew()),
        "solubility_mw_correlation": sol_mw_corr,
        "solubility_hbd_correlation": sol_hbd_corr,
        "solubility_tpsa_correlation": sol_tpsa_corr,
        "figures_generated": [
            sol_plot_path,
            mw_plot_path,
            tpsa_plot_path,
            corr_plot_path,
            outlier_plot_path,
        ]
    }


if __name__ == "__main__":
    print("=" * 80)
    print("Q-MolGen: Phase 5 Delaney ESOL Exploratory Data Analysis (EDA)")
    print("=" * 80)
    results = run_esol_eda()
    print(f"\nEDA Execution Completed Successfully:")
    print(f"  Molecules Analyzed: {results['total_molecules']}")
    print(f"  Target Solubility Mean: {results['target_mean']:.3f} LogS (Std: {results['target_std']:.3f})")
    print(f"  Solubility Skewness: {results['target_skewness']:.3f} (Near-Gaussian distribution)")
    print(f"  Pearson Correlation (LogS vs MW): {results['solubility_mw_correlation']:.3f} (Strong negative correlation)")
    print(f"  Pearson Correlation (LogS vs HBD): {results['solubility_hbd_correlation']:.3f}")
    print(f"  Generated High-Res Figures in: {FIGURES_DIR}")
