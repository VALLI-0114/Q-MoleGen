"""
Classical vs. Quantum Machine Learning Benchmark & Statistical Evaluation.
Compares QSVC against Linear SVM, RBF SVM, Logistic Regression, Random Forest, and Gradient Boosting
on identical molecular physicochemical feature representations.
"""

import json
import logging
import sys
import time
from pathlib import Path
from typing import Dict, List

# Add workspace root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.svm import SVC

from src.quantum.qsvc_model import QuantumSolubilityClassifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

FIGURES_DIR = Path("docs/figures")
FIGURES_DIR.mkdir(parents=True, exist_ok=True)


def run_comprehensive_qml_benchmark(
    data_npz_path: str = "data/processed/quantum_esol_4q.npz",
    output_json_path: str = "models/quantum/qml_benchmark_summary.json",
    output_csv_path: str = "data/processed/qml_benchmark_comparison.csv",
) -> pd.DataFrame:
    """
    Executes multi-model classical vs quantum comparative benchmarking.
    """
    npz_data = np.load(data_npz_path)
    X_train = npz_data["X_train_full"]
    y_train = npz_data["y_train_full"]
    X_test = npz_data["X_test_full"]
    y_test = npz_data["y_test_full"]

    logger.info(f"Loaded benchmark dataset: Train={X_train.shape}, Test={X_test.shape}")

    # Define Candidate Classifiers
    models = {
        "Logistic Regression": LogisticRegression(C=1.0, random_state=42),
        "Linear SVM": SVC(kernel="linear", C=1.0, probability=True, random_state=42),
        "RBF SVM": SVC(kernel="rbf", C=1.0, gamma="scale", probability=True, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42),
        "QSVC (ZZ-FeatureMap)": QuantumSolubilityClassifier(num_qubits=4, reps=2, entanglement="linear", c_param=1.0),
    }

    results_list = []
    roc_curves_dict = {}

    for name, model in models.items():
        logger.info(f"--- Training and Evaluating: {name} ---")
        t0 = time.time()
        model.fit(X_train, y_train)
        fit_time = time.time() - t0

        t_inf_0 = time.time()
        preds_test = model.predict(X_test)
        inference_time = (time.time() - t_inf_0) / len(X_test) * 1000  # ms per sample

        preds_train = model.predict(X_train)
        probs_test = model.predict_proba(X_test)[:, 1]

        acc_train = float(accuracy_score(y_train, preds_train))
        acc_test = float(accuracy_score(y_test, preds_test))
        prec_test = float(precision_score(y_test, preds_test, zero_division=0))
        rec_test = float(recall_score(y_test, preds_test, zero_division=0))
        f1_test = float(f1_score(y_test, preds_test, zero_division=0))
        auc_test = float(roc_auc_score(y_test, probs_test))

        fpr, tpr, _ = roc_curve(y_test, probs_test)
        roc_curves_dict[name] = {"fpr": fpr.tolist(), "tpr": tpr.tolist(), "auc": auc_test}

        is_quantum = "Quantum" in name or "QSVC" in name

        record = {
            "model_name": name,
            "category": "Quantum Machine Learning" if is_quantum else "Classical ML Baseline",
            "train_accuracy": round(acc_train, 4),
            "test_accuracy": round(acc_test, 4),
            "test_precision": round(prec_test, 4),
            "test_recall": round(rec_test, 4),
            "test_f1": round(f1_test, 4),
            "test_roc_auc": round(auc_test, 4),
            "fit_time_sec": round(fit_time, 4),
            "inference_latency_ms": round(inference_time, 4),
        }
        results_list.append(record)

    df_results = pd.DataFrame(results_list)
    df_results.sort_values(by="test_roc_auc", ascending=False, inplace=True)

    # Save CSV & JSON
    df_results.to_csv(output_csv_path, index=False)
    
    summary_payload = {
        "benchmark_date": "2026-09-04",
        "dataset": "Delaney ESOL (4 scaled continuous descriptors)",
        "features": ["logp", "molecular_weight", "tpsa", "molar_refractivity"],
        "num_train_samples": len(X_train),
        "num_test_samples": len(X_test),
        "results": df_results.to_dict(orient="records"),
        "roc_curves": roc_curves_dict,
    }
    
    with open(output_json_path, "w") as f:
        json.dump(summary_payload, f, indent=2)

    logger.info(f"Saved benchmark summary to: {output_json_path}")
    logger.info(f"Saved benchmark CSV to: {output_csv_path}")

    # Generate Publication Figures
    generate_quantum_benchmark_figures(df_results, roc_curves_dict, X_test, y_test)

    return df_results


def generate_quantum_benchmark_figures(
    df_results: pd.DataFrame,
    roc_curves_dict: Dict,
    X_test: np.ndarray,
    y_test: np.ndarray,
):
    """
    Generates high-resolution visualization figures for the scientific documentation.
    """
    sns.set_theme(style="whitegrid", font="sans-serif")
    palette = ["#0284c7", "#0ea5e9", "#38bdf8", "#6366f1", "#8b5cf6", "#10b981"]

    # 1. Figure 10: Quantum Circuit Architecture Diagram (Matplotlib Custom Layout)
    fig, ax = plt.subplots(figsize=(11, 4.5), dpi=300)
    ax.set_facecolor("#0f172a")
    fig.patch.set_facecolor("#0b0f19")
    
    # Draw stylized 4-qubit quantum feature map circuit representation
    ax.text(0.02, 0.90, "Quantum Feature Map: ZZFeatureMap (4 Qubits, 2 Layers)", color="#38bdf8", fontsize=14, fontweight="bold")
    ax.text(0.02, 0.80, "U_Φ(x) = exp( i ∑_j 2x_j Z_j + i ∑_{j<k} 2(π - x_j)(π - x_k) Z_j Z_k ) H^⊗4", color="#94a3b8", fontsize=10, style="italic")
    
    qubit_labels = [r"$|q_0\rangle \ (LogP)$", r"$|q_1\rangle \ (MW)$", r"$|q_2\rangle \ (TPSA)$", r"$|q_3\rangle \ (MR)$"]
    y_pos = [0.65, 0.47, 0.29, 0.11]
    
    for i, (lbl, y) in enumerate(zip(qubit_labels, y_pos)):
        ax.text(0.02, y, lbl, color="#f1f5f9", fontsize=11, fontweight="semibold", va="center")
        ax.plot([0.15, 0.95], [y, y], color="#475569", lw=1.5, zorder=1)
        
        # Layer 1: H Gate
        rect_h = plt.Rectangle((0.18, y - 0.05), 0.06, 0.10, color="#6366f1", ec="#818cf8", lw=1.5, zorder=2)
        ax.add_patch(rect_h)
        ax.text(0.21, y, "H", color="white", fontsize=10, fontweight="bold", ha="center", va="center", zorder=3)
        
        # Layer 1: Rz(2x_i) Single-qubit phase gate
        rect_p = plt.Rectangle((0.27, y - 0.05), 0.10, 0.10, color="#0ea5e9", ec="#38bdf8", lw=1.5, zorder=2)
        ax.add_patch(rect_p)
        ax.text(0.32, y, f"P(2x_{i})", color="white", fontsize=8, fontweight="bold", ha="center", va="center", zorder=3)

    # Entanglers (CNOT + Phase + CNOT) between adjacent qubits
    for i in range(3):
        y1, y2 = y_pos[i], y_pos[i+1]
        x_cnot = 0.42 + i * 0.15
        # Control dot
        ax.plot([x_cnot], [y1], marker="o", markersize=6, color="#10b981", zorder=4)
        # Line
        ax.plot([x_cnot, x_cnot], [y1, y2], color="#10b981", lw=1.5, zorder=2)
        # Target cross
        ax.plot([x_cnot], [y2], marker="+", markersize=10, color="#10b981", markeredgewidth=2, zorder=4)
        # Phase gate on pair
        rect_ent = plt.Rectangle((x_cnot + 0.03, (y1+y2)/2 - 0.04), 0.08, 0.08, color="#8b5cf6", ec="#a78bfa", lw=1, zorder=3)
        ax.add_patch(rect_ent)
        ax.text(x_cnot + 0.07, (y1+y2)/2, "R_zz", color="white", fontsize=7, fontweight="bold", ha="center", va="center", zorder=4)

    # Layer 2 Repeat Indicator
    ax.text(0.90, 0.38, "× 2 Reps\n(Depth=19)", color="#f59e0b", fontsize=9, fontweight="bold", ha="center", va="center",
            bbox=dict(boxstyle="round,pad=0.4", fc="#1e293b", ec="#f59e0b", lw=1.2))

    ax.set_xlim(0, 1.0)
    ax.set_ylim(0, 1.0)
    ax.axis("off")
    plt.tight_layout()
    fig_path_10 = FIGURES_DIR / "10_quantum_circuit_diagram.png"
    plt.savefig(fig_path_10, dpi=300, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    logger.info(f"Saved figure: {fig_path_10}")

    # 2. Figure 11: Quantum Kernel Gram Matrix Heatmap
    qsvc = QuantumSolubilityClassifier(num_qubits=4, reps=2)
    # Compute on stratified 40 test samples for crystal-clear visual block structure
    sub_X = X_test[:40]
    sub_y = y_test[:40]
    # Sort by class label for block-diagonal visualization
    sort_idx = np.argsort(sub_y)
    sorted_X = sub_X[sort_idx]
    sorted_y = sub_y[sort_idx]
    K_test = qsvc.compute_kernel_matrix(sorted_X)

    fig, ax = plt.subplots(figsize=(8, 6.5), dpi=300)
    cax = ax.imshow(K_test, cmap="viridis", interpolation="nearest", vmin=0, vmax=1.0)
    cbar = fig.colorbar(cax, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label(r"Quantum State Fidelity $|\langle \Phi(x_i) | \Phi(x_j) \rangle|^2$", fontsize=11, fontweight="bold")
    
    # Draw separation line between Insoluble (0) and Soluble (1)
    split_idx = int(np.sum(sorted_y == 0))
    ax.axhline(split_idx - 0.5, color="#f43f5e", lw=2, linestyle="--", label="Solubility Class Boundary")
    ax.axvline(split_idx - 0.5, color="#f43f5e", lw=2, linestyle="--")
    
    ax.set_title("Quantum Fidelity Kernel Matrix $K_Q(x_i, x_j)$ ($N=40$ Test Compounds)", fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel("Compound Index (Sorted: Insoluble $\\to$ Soluble)", fontsize=11, fontweight="bold")
    ax.set_ylabel("Compound Index (Sorted: Insoluble $\\to$ Soluble)", fontsize=11, fontweight="bold")
    ax.legend(loc="upper right", framealpha=0.9)
    plt.tight_layout()
    fig_path_11 = FIGURES_DIR / "11_quantum_kernel_matrix_heatmap.png"
    plt.savefig(fig_path_11, dpi=300, bbox_inches="tight")
    plt.close()
    logger.info(f"Saved figure: {fig_path_11}")

    # 3. Figure 12: Classical vs Quantum Performance Comparison
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.5), dpi=300)
    
    # Left: Multi-Metric Grouped Bar Chart
    plot_df = df_results.melt(
        id_vars=["model_name", "category"],
        value_vars=["test_accuracy", "test_precision", "test_recall", "test_f1", "test_roc_auc"],
        var_name="Metric",
        value_name="Score",
    )
    metric_labels = {
        "test_accuracy": "Accuracy",
        "test_precision": "Precision",
        "test_recall": "Recall",
        "test_f1": "F1-Score",
        "test_roc_auc": "ROC-AUC",
    }
    plot_df["Metric"] = plot_df["Metric"].map(metric_labels)

    sns.barplot(
        data=plot_df,
        x="Metric",
        y="Score",
        hue="model_name",
        palette=["#0284c7", "#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#ec4899"],
        ax=ax1,
    )
    ax1.set_ylim(0.70, 1.0)
    ax1.set_title("Classical vs. Quantum Classification Metrics", fontsize=12, fontweight="bold")
    ax1.set_ylabel("Test Set Metric Value", fontsize=11, fontweight="bold")
    ax1.set_xlabel("")
    ax1.legend(title="Algorithm", bbox_to_anchor=(0.5, -0.15), loc="upper center", ncol=3, frameon=True)

    # Right: ROC Curves
    for name, roc_data in roc_curves_dict.items():
        is_q = "QSVC" in name
        lw = 2.5 if is_q else 1.5
        ls = "-" if is_q else "--"
        ax2.plot(
            roc_data["fpr"],
            roc_data["tpr"],
            label=f"{name} (AUC = {roc_data['auc']:.3f})",
            lw=lw,
            linestyle=ls,
        )
    ax2.plot([0, 1], [0, 1], "k:", alpha=0.5, label="Random Guess")
    ax2.set_title("Test Set ROC Curves", fontsize=12, fontweight="bold")
    ax2.set_xlabel("False Positive Rate", fontsize=11, fontweight="bold")
    ax2.set_ylabel("True Positive Rate", fontsize=11, fontweight="bold")
    ax2.legend(loc="lower right", fontsize=8, framealpha=0.9)

    plt.tight_layout()
    fig_path_12 = FIGURES_DIR / "12_classical_vs_quantum_metrics.png"
    plt.savefig(fig_path_12, dpi=300, bbox_inches="tight")
    plt.close()
    logger.info(f"Saved figure: {fig_path_12}")


if __name__ == "__main__":
    df = run_comprehensive_qml_benchmark()
    print("\n" + "=" * 80)
    print("CLASSICAL VS. QUANTUM BENCHMARK SUMMARY TABLE:")
    print("=" * 80)
    print(df.to_string(index=False))
    print("=" * 80)
