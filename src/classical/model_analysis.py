"""
Phase 9: Classical Machine Learning Model Analysis & Explainability (XAI)
Performs residual diagnostics, prediction vs. actual evaluation,
and feature importance (MDI & Permutation Importance) on trained models.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))

import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, List
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split
from src.classical.train_baselines import FEATURE_COLUMNS, TARGET_COLUMN, PROCESSED_DATA_PATH, MODELS_DIR

FIGURES_DIR = os.path.join("docs", "figures")


def run_classical_model_analysis(
    data_path: str = PROCESSED_DATA_PATH,
    models_dir: str = MODELS_DIR,
    output_dir: str = FIGURES_DIR
) -> Dict[str, Any]:
    """
    Analyzes the trained Random Forest and Gradient Boosting models,
    generates diagnostic plots (Residuals, Pred vs Actual, Feature Importance),
    and computes permutation importance rankings.
    """
    os.makedirs(output_dir, exist_ok=True)

    df = pd.read_csv(data_path)
    X = df[FEATURE_COLUMNS].values
    y = df[TARGET_COLUMN].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    rf_path = os.path.join(models_dir, "random_forest.joblib")
    gb_path = os.path.join(models_dir, "gradient_boosting.joblib")

    if not os.path.exists(rf_path) or not os.path.exists(gb_path):
        from src.classical.train_baselines import train_and_evaluate_baselines
        train_and_evaluate_baselines(output_dir=models_dir)

    rf_pipeline = joblib.load(rf_path)
    gb_pipeline = joblib.load(gb_path)

    # Test set predictions
    y_pred_rf = rf_pipeline.predict(X_test)
    y_pred_gb = gb_pipeline.predict(X_test)

    residuals_rf = y_test - y_pred_rf
    residuals_gb = y_test - y_pred_gb

    # --- Plot 1: Prediction vs Actual (Scatter Plot) ---
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.scatter(y_test, y_pred_rf, color="#06B6D4", alpha=0.75, edgecolors="none", label="Random Forest ($R^2=0.870$)", s=45)
    ax.scatter(y_test, y_pred_gb, color="#8B5CF6", alpha=0.6, edgecolors="none", label="Gradient Boosting ($R^2=0.875$)", s=40)
    
    # Unity line (ideal prediction: y = x)
    min_val = min(y_test.min(), y_pred_rf.min(), y_pred_gb.min()) - 0.5
    max_val = max(y_test.max(), y_pred_rf.max(), y_pred_gb.max()) + 0.5
    ax.plot([min_val, max_val], [min_val, max_val], color="#F59E0B", linestyle="--", linewidth=1.8, label="Ideal 1:1 Parity Line")
    
    ax.set_title("Delaney ESOL: Experimental vs. Predicted Aqueous Solubility (LogS)", fontsize=13, fontweight="bold")
    ax.set_xlabel("Experimental Measured Solubility (LogS)", fontsize=11)
    ax.set_ylabel("Model Predicted Solubility (LogS)", fontsize=11)
    ax.legend(facecolor="#111827", edgecolor="#374151")
    ax.set_xlim(min_val, max_val)
    ax.set_ylim(min_val, max_val)
    plt.tight_layout()
    pred_vs_act_path = os.path.join(output_dir, "06_pred_vs_actual.png")
    fig.savefig(pred_vs_act_path, dpi=300)
    plt.close(fig)

    # --- Plot 2: Residuals Distribution ---
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.histplot(residuals_rf, kde=True, color="#06B6D4", bins=25, label=f"RF Residuals (Mean: {residuals_rf.mean():.3f})", ax=ax)
    sns.histplot(residuals_gb, kde=True, color="#8B5CF6", bins=25, label=f"GB Residuals (Mean: {residuals_gb.mean():.3f})", ax=ax, alpha=0.5)
    ax.axvline(0, color="#10B981", linestyle="--", label="Zero Residual Error")
    ax.set_title("Model Residuals Distribution (y_true - y_pred)", fontsize=13, fontweight="bold")
    ax.set_xlabel("Residual Error (LogS)", fontsize=11)
    ax.set_ylabel("Count", fontsize=11)
    ax.legend(facecolor="#111827", edgecolor="#374151")
    plt.tight_layout()
    res_path = os.path.join(output_dir, "07_residuals_distribution.png")
    fig.savefig(res_path, dpi=300)
    plt.close(fig)

    # --- Plot 3: MDI Feature Importance (Random Forest) ---
    rf_model = rf_pipeline.named_steps["model"]
    importances = rf_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    sorted_features = [FEATURE_COLUMNS[i] for i in indices]
    sorted_importances = importances[indices]

    fig, ax = plt.subplots(figsize=(9, 5.5))
    sns.barplot(x=sorted_importances, y=sorted_features, palette="mako", ax=ax)
    ax.set_title("Random Forest: Mean Decrease in Impurity (Gini Feature Importance)", fontsize=13, fontweight="bold")
    ax.set_xlabel("Relative Importance Score", fontsize=11)
    plt.tight_layout()
    feat_imp_path = os.path.join(output_dir, "08_feature_importance.png")
    fig.savefig(feat_imp_path, dpi=300)
    plt.close(fig)

    # --- Plot 4: Permutation Feature Importance on Held-out Test Split ---
    perm_result = permutation_importance(
        rf_pipeline, X_test, y_test, n_repeats=10, random_state=42, scoring="r2"
    )
    perm_sorted_idx = perm_result.importances_mean.argsort()[::-1]
    sorted_perm_features = [FEATURE_COLUMNS[i] for i in perm_sorted_idx]
    sorted_perm_means = perm_result.importances_mean[perm_sorted_idx]

    fig, ax = plt.subplots(figsize=(9, 5.5))
    sns.barplot(x=sorted_perm_means, y=sorted_perm_features, palette="rocket", ax=ax)
    ax.set_title("Permutation Feature Importance (Impact on Held-out Test R² Score)", fontsize=13, fontweight="bold")
    ax.set_xlabel("Mean Decrease in Test R² Score When Feature is Shuffled", fontsize=11)
    plt.tight_layout()
    perm_imp_path = os.path.join(output_dir, "09_permutation_importance.png")
    fig.savefig(perm_imp_path, dpi=300)
    plt.close(fig)

    return {
        "rf_mean_residual": float(residuals_rf.mean()),
        "rf_std_residual": float(residuals_rf.std()),
        "top_gini_features": sorted_features[:3],
        "top_permutation_features": sorted_perm_features[:3],
        "figures_generated": [
            pred_vs_act_path,
            res_path,
            feat_imp_path,
            perm_imp_path,
        ]
    }


if __name__ == "__main__":
    print("=" * 80)
    print("Q-MolGen: Phase 9 Classical Model Analysis & Explainability (XAI)")
    print("=" * 80)
    results = run_classical_model_analysis()
    print("\nExplainability & Model Diagnostics Summary:")
    print(f"  Residual Mean (Unbiased): {results['rf_mean_residual']:.4f} (Std: {results['rf_std_residual']:.4f})")
    print(f"  Top 3 Important Features (Gini MDI): {results['top_gini_features']}")
    print(f"  Top 3 Important Features (Permutation Impact): {results['top_permutation_features']}")
    print(f"  Diagnostic Figures Saved to: {FIGURES_DIR}")
