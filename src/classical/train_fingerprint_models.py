"""
Phase 10: Morgan Circular Fingerprint Machine Learning Training & Benchmark
Trains baseline models on 1024-bit Morgan Fingerprints (ECFP4) and performs
systematic comparative evaluation against 1D Physicochemical Descriptors.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("."))

import json
import time
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from src.features.fingerprints import FP_OUTPUT_PATH, generate_dataset_fingerprints, smiles_to_morgan_fingerprint

MODELS_DIR = os.path.join("models", "classical")


def train_and_evaluate_fingerprint_models(
    npz_path: str = FP_OUTPUT_PATH,
    output_dir: str = MODELS_DIR
) -> Dict[str, Any]:
    """
    Trains Ridge, Random Forest, SVR, and Gradient Boosting on 1024-bit Morgan Fingerprints.
    Saves trained pipelines and returns comparative evaluation metrics.
    """
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(npz_path):
        X, y, _ = generate_dataset_fingerprints(output_npz=npz_path)
    else:
        data = np.load(npz_path)
        X = data["X"]
        y = data["y"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    models = {
        "fingerprint_ridge": Ridge(alpha=2.0, random_state=42),
        "fingerprint_random_forest": RandomForestRegressor(n_estimators=100, max_depth=14, random_state=42, n_jobs=-1),
        "fingerprint_svr": SVR(C=3.0, epsilon=0.1, kernel="rbf"),
        "fingerprint_gradient_boosting": GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42),
    }

    results = {}
    cv = KFold(n_splits=5, shuffle=True, random_state=42)

    for name, model in models.items():
        start_time = time.time()
        
        # 5-Fold Cross Validation
        cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="r2")
        
        # Fit on training split
        model.fit(X_train, y_train)
        training_duration = time.time() - start_time

        # Held-out Test Set evaluation
        y_pred = model.predict(X_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        # Save model binary
        model_path = os.path.join(output_dir, f"{name}.joblib")
        joblib.dump(model, model_path)

        results[name] = {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2_test": round(r2, 4),
            "cv_r2_mean": round(float(np.mean(cv_scores)), 4),
            "cv_r2_std": round(float(np.std(cv_scores)), 4),
            "training_time_seconds": round(training_duration, 3),
            "model_path": model_path,
        }

    # Save metrics summary
    summary_path = os.path.join(output_dir, "fingerprint_benchmark_metrics.json")
    with open(summary_path, "w") as f:
        json.dump(results, f, indent=4)

    return results


def compare_descriptors_vs_fingerprints(
    models_dir: str = MODELS_DIR
) -> pd.DataFrame:
    """
    Compares test performance of Descriptor-based models vs. Fingerprint-based models.
    """
    desc_json = os.path.join(models_dir, "benchmark_metrics.json")
    fp_json = os.path.join(models_dir, "fingerprint_benchmark_metrics.json")

    if not os.path.exists(desc_json):
        from src.classical.train_baselines import train_and_evaluate_baselines
        train_and_evaluate_baselines(output_dir=models_dir)
    if not os.path.exists(fp_json):
        train_and_evaluate_fingerprint_models(output_dir=models_dir)

    with open(desc_json, "r") as f:
        desc_data = json.load(f)
    with open(fp_json, "r") as f:
        fp_data = json.load(f)

    comparison_rows = [
        {
            "Algorithm": "Random Forest",
            "Descriptor MAE": desc_data.get("random_forest", {}).get("mae"),
            "Descriptor R²": desc_data.get("random_forest", {}).get("r2_test"),
            "Fingerprint MAE": fp_data.get("fingerprint_random_forest", {}).get("mae"),
            "Fingerprint R²": fp_data.get("fingerprint_random_forest", {}).get("r2_test"),
        },
        {
            "Algorithm": "Support Vector Regressor",
            "Descriptor MAE": desc_data.get("support_vector_regressor", {}).get("mae"),
            "Descriptor R²": desc_data.get("support_vector_regressor", {}).get("r2_test"),
            "Fingerprint MAE": fp_data.get("fingerprint_svr", {}).get("mae"),
            "Fingerprint R²": fp_data.get("fingerprint_svr", {}).get("r2_test"),
        },
        {
            "Algorithm": "Gradient Boosting",
            "Descriptor MAE": desc_data.get("gradient_boosting", {}).get("mae"),
            "Descriptor R²": desc_data.get("gradient_boosting", {}).get("r2_test"),
            "Fingerprint MAE": fp_data.get("fingerprint_gradient_boosting", {}).get("mae"),
            "Fingerprint R²": fp_data.get("fingerprint_gradient_boosting", {}).get("r2_test"),
        },
        {
            "Algorithm": "Ridge Regression",
            "Descriptor MAE": desc_data.get("ridge_regression", {}).get("mae"),
            "Descriptor R²": desc_data.get("ridge_regression", {}).get("r2_test"),
            "Fingerprint MAE": fp_data.get("fingerprint_ridge", {}).get("mae"),
            "Fingerprint R²": fp_data.get("fingerprint_ridge", {}).get("r2_test"),
        },
    ]

    df_comp = pd.DataFrame(comparison_rows)
    return df_comp


if __name__ == "__main__":
    print("=" * 80)
    print("Q-MolGen: Phase 10 Fingerprint-based ML vs. Descriptor-based ML Benchmark")
    print("=" * 80)
    fp_results = train_and_evaluate_fingerprint_models()
    print("\nFingerprint Model Evaluation on Test Set:")
    for m, vals in fp_results.items():
        print(f"  {m:<32} | MAE: {vals['mae']:.4f} | R²: {vals['r2_test']:.4f} | CV R²: {vals['cv_r2_mean']:.4f} ± {vals['cv_r2_std']:.4f}")

    print("\n" + "=" * 80)
    print("Direct Representation Comparison: Descriptors (11 Features) vs. Morgan Fingerprints (1024 Bits)")
    print("=" * 80)
    comp_df = compare_descriptors_vs_fingerprints()
    print(comp_df.to_string(index=False))
