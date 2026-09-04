"""
Quantum Chemical Property Surrogate Models trained on QM9 DFT Data.
Trains gradient boosted regressors to predict HOMO-LUMO energy gap (eV) and dipole moment (Debye)
for candidate molecules generated during de novo design campaigns.
"""

import json
import logging
import sys
from pathlib import Path
from typing import Dict, Tuple

# Add workspace root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from src.features.descriptors import extract_single_molecule_descriptors

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

QM9_CSV_PATH = Path("data/raw/qm9_subset.csv")
MODEL_OUTPUT_PATH = Path("models/quantum/qm9_gap_surrogate.joblib")
METRICS_OUTPUT_PATH = Path("models/quantum/qm9_surrogate_metrics.json")


def extract_features_for_qm9(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, list]:
    """
    Extracts continuous physicochemical descriptor vectors for all QM9 molecules.
    """
    feature_rows = []
    gap_targets = []
    dipole_targets = []
    valid_indices = []

    for idx, row in df.iterrows():
        smi = row["canonical_smiles"]
        desc = extract_single_molecule_descriptors(smi)
        if desc is None:
            continue
        
        # 8-dimensional feature vector
        feat = [
            desc["molecular_weight"],
            desc["logp"],
            desc["tpsa"],
            desc["hbd"],
            desc["hba"],
            desc["rotatable_bonds"],
            desc["molar_refractivity"],
            desc["fraction_csp3"],
        ]
        feature_rows.append(feat)
        gap_targets.append(row["gap_ev"])
        dipole_targets.append(row["dipole_moment_debye"])
        valid_indices.append(idx)

    feature_names = [
        "molecular_weight", "logp", "tpsa", "hbd", "hba",
        "rotatable_bonds", "molar_refractivity", "fraction_csp3"
    ]
    return np.array(feature_rows), np.array(gap_targets), np.array(dipole_targets), feature_names


def train_qm9_surrogates():
    """
    Trains and serializes surrogate quantum chemistry property predictors.
    """
    if not QM9_CSV_PATH.exists():
        raise FileNotFoundError(f"QM9 subset not found at: {QM9_CSV_PATH}")

    df = pd.read_csv(QM9_CSV_PATH)
    logger.info(f"Loaded {len(df)} QM9 molecules from {QM9_CSV_PATH}")

    X, y_gap, y_dipole, feat_names = extract_features_for_qm9(df)
    logger.info(f"Extracted feature matrix: {X.shape}")

    # Split
    X_tr, X_te, y_gap_tr, y_gap_te, y_dip_tr, y_dip_te = train_test_split(
        X, y_gap, y_dipole, test_size=0.2, random_state=42
    )

    # 1. Train HOMO-LUMO Gap Surrogate
    logger.info("Training HOMO-LUMO Gap Surrogate Regressor...")
    gap_model = GradientBoostingRegressor(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42)
    gap_model.fit(X_tr, y_gap_tr)
    gap_preds = gap_model.predict(X_te)
    gap_r2 = float(r2_score(y_gap_te, gap_preds))
    gap_mae = float(mean_absolute_error(y_gap_te, gap_preds))
    logger.info(f"HOMO-LUMO Gap Surrogate - Test R2: {gap_r2:.4f} | Test MAE: {gap_mae:.4f} eV")

    # 2. Train Dipole Moment Surrogate
    logger.info("Training Dipole Moment Surrogate Regressor...")
    dip_model = GradientBoostingRegressor(n_estimators=120, max_depth=5, learning_rate=0.08, random_state=42)
    dip_model.fit(X_tr, y_dip_tr)
    dip_preds = dip_model.predict(X_te)
    dip_r2 = float(r2_score(y_dip_te, dip_preds))
    dip_mae = float(mean_absolute_error(y_dip_te, dip_preds))
    logger.info(f"Dipole Moment Surrogate - Test R2: {dip_r2:.4f} | Test MAE: {dip_mae:.4f} Debye")

    # Bundle and Save
    MODEL_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    bundle = {
        "gap_model": gap_model,
        "dipole_model": dip_model,
        "feature_names": feat_names,
        "gap_r2": gap_r2,
        "gap_mae": gap_mae,
        "dipole_r2": dip_r2,
        "dipole_mae": dip_mae,
    }
    joblib.dump(bundle, MODEL_OUTPUT_PATH)
    logger.info(f"Saved QM9 surrogate model bundle to: {MODEL_OUTPUT_PATH}")

    metrics = {
        "homo_lumo_gap_ev": {"r2": gap_r2, "mae": gap_mae, "rmse": float(np.sqrt(mean_squared_error(y_gap_te, gap_preds)))},
        "dipole_moment_debye": {"r2": dip_r2, "mae": dip_mae, "rmse": float(np.sqrt(mean_squared_error(y_dip_te, dip_preds)))},
        "features": feat_names,
        "n_train": len(X_tr),
        "n_test": len(X_te),
    }
    with open(METRICS_OUTPUT_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    return bundle, metrics


def predict_quantum_properties(smiles: str) -> Dict[str, float]:
    """
    Predicts HOMO-LUMO gap and dipole moment for any arbitrary candidate SMILES string.
    """
    if not MODEL_OUTPUT_PATH.exists():
        train_qm9_surrogates()

    bundle = joblib.load(MODEL_OUTPUT_PATH)
    desc = extract_single_molecule_descriptors(smiles)
    if desc is None:
        return {"homo_lumo_gap_ev": None, "dipole_moment_debye": None}

    feat = np.array([[
        desc["molecular_weight"],
        desc["logp"],
        desc["tpsa"],
        desc["hbd"],
        desc["hba"],
        desc["rotatable_bonds"],
        desc["molar_refractivity"],
        desc["fraction_csp3"],
    ]])

    gap = float(bundle["gap_model"].predict(feat)[0])
    dip = float(bundle["dipole_model"].predict(feat)[0])
    return {
        "homo_lumo_gap_ev": round(gap, 3),
        "dipole_moment_debye": round(dip, 3),
    }


if __name__ == "__main__":
    train_qm9_surrogates()
