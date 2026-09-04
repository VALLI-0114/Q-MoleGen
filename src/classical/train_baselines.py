"""
Phase 8: Classical Machine Learning Baseline Models
Trains, cross-validates, evaluates, and serializes baseline regression models
(Linear Regression, Ridge, Random Forest, SVR, Gradient Boosting)
for aqueous solubility prediction on Delaney ESOL.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

PROCESSED_DATA_PATH = os.path.join("data", "processed", "esol_features.csv")
MODELS_DIR = os.path.join("models", "classical")

FEATURE_COLUMNS = [
    "molecular_weight",
    "logp",
    "tpsa",
    "hbd",
    "hba",
    "rotatable_bonds",
    "ring_count",
    "heavy_atom_count",
    "num_aromatic_rings",
    "fraction_csp3",
    "molar_refractivity",
]

TARGET_COLUMN = "measured_solubility_logs"


def get_baseline_models() -> Dict[str, Any]:
    """Returns a dictionary of classical regression model pipelines."""
    return {
        "linear_regression": Pipeline([
            ("scaler", StandardScaler()),
            ("model", LinearRegression())
        ]),
        "ridge_regression": Pipeline([
            ("scaler", StandardScaler()),
            ("model", Ridge(alpha=1.0, random_state=42))
        ]),
        "random_forest": Pipeline([
            ("scaler", StandardScaler()),
            ("model", RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
        ]),
        "support_vector_regressor": Pipeline([
            ("scaler", StandardScaler()),
            ("model", SVR(C=2.0, epsilon=0.1, kernel="rbf"))
        ]),
        "gradient_boosting": Pipeline([
            ("scaler", StandardScaler()),
            ("model", GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42))
        ]),
    }


def train_and_evaluate_baselines(
    data_path: str = PROCESSED_DATA_PATH,
    output_dir: str = MODELS_DIR
) -> Dict[str, Any]:
    """
    Loads processed Delaney ESOL features, performs 80/20 train/test split,
    trains all 5 classical models, computes MAE/RMSE/R2 + 5-Fold CV,
    and serializes trained pipelines.
    """
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(data_path):
        from src.features.descriptors import process_esol_features
        df = process_esol_features()
    else:
        df = pd.read_csv(data_path)

    X = df[FEATURE_COLUMNS].values
    y = df[TARGET_COLUMN].values

    # 80/20 Train-Test Split (Reproducible random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    models = get_baseline_models()
    benchmark_results = {}
    cv = KFold(n_splits=5, shuffle=True, random_state=42)

    for name, pipeline in models.items():
        # 1. 5-Fold Cross-Validation on training split
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="r2")

        # 2. Fit model on full training set
        pipeline.fit(X_train, y_train)

        # 3. Evaluate on held-out test set
        y_pred = pipeline.predict(X_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        # 4. Save trained pipeline binary
        model_path = os.path.join(output_dir, f"{name}.joblib")
        joblib.dump(pipeline, model_path)

        benchmark_results[name] = {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2_test": round(r2, 4),
            "cv_r2_mean": round(float(np.mean(cv_scores)), 4),
            "cv_r2_std": round(float(np.std(cv_scores)), 4),
            "model_path": model_path,
        }

    # Save benchmark metrics to JSON
    json_path = os.path.join(output_dir, "benchmark_metrics.json")
    with open(json_path, "w") as f:
        json.dump(benchmark_results, f, indent=4)

    return benchmark_results


def predict_solubility_with_model(
    feature_dict: Dict[str, float],
    model_name: str = "random_forest",
    models_dir: str = MODELS_DIR
) -> float:
    """
    Predicts aqueous solubility (LogS) for a given dictionary of molecular descriptors.
    """
    model_path = os.path.join(models_dir, f"{model_name}.joblib")
    if not os.path.exists(model_path):
        train_and_evaluate_baselines(output_dir=models_dir)

    pipeline = joblib.load(model_path)
    feature_vector = np.array([[feature_dict[col] for col in FEATURE_COLUMNS]])
    prediction = pipeline.predict(feature_vector)
    return float(prediction[0])


if __name__ == "__main__":
    print("=" * 80)
    print("Q-MolGen: Phase 8 Classical Machine Learning Baseline Models Training")
    print("=" * 80)
    results = train_and_evaluate_baselines()
    print("\nBenchmark Evaluation Results (Held-out Test Set):")
    print("-" * 80)
    print(f"{'Model Name':<28} | {'MAE':<8} | {'RMSE':<8} | {'R² Test':<8} | {'5-Fold CV R²':<12}")
    print("-" * 80)
    for model_name, metrics in results.items():
        print(f"{model_name:<28} | {metrics['mae']:<8.4f} | {metrics['rmse']:<8.4f} | {metrics['r2_test']:<8.4f} | {metrics['cv_r2_mean']:.4f} ± {metrics['cv_r2_std']:.4f}")
    print("-" * 80)
    print(f"Saved trained models and metrics to: {MODELS_DIR}")
