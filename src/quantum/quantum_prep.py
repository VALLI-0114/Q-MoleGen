"""
Quantum Data Preparation & Feature Scaling Pipeline for Q-MolGen.
Prepares continuous molecular physicochemical descriptors for Quantum Machine Learning (QSVC),
scaling dimensions into quantum rotation angles [0, pi] and defining binary solubility labels.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Default 4 primary features for 4-qubit quantum state encoding
DEFAULT_QUANTUM_FEATURES = [
    "logp",
    "molecular_weight",
    "tpsa",
    "molar_refractivity",
]

SOLUBILITY_BINARY_THRESHOLD = -3.0  # LogS > -3.0 is classified as Soluble (1), <= -3.0 as Insoluble (0)


def load_and_preprocess_quantum_data(
    features_csv_path: str = "data/processed/esol_features.csv",
    feature_columns: Optional[List[str]] = None,
    use_pca: bool = False,
    n_qubits: int = 4,
    angle_range: Tuple[float, float] = (0.0, np.pi),
    subsample_size: int = 200,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Dict[str, np.ndarray]:
    """
    Loads Delaney ESOL features, creates binary classification labels,
    scales features to quantum rotation angles [0, pi], and generates
    both full and stratified subsampled splits for quantum circuit execution.

    Parameters
    ----------
    features_csv_path : str
        Path to processed ESOL features CSV.
    feature_columns : list of str, optional
        List of descriptor column names to extract (defaults to top-4 descriptors).
    use_pca : bool
        If True, applies PCA reduction across all numerical descriptors to n_qubits.
    n_qubits : int
        Number of qubits / features (default: 4).
    angle_range : tuple of (float, float)
        Target range for quantum angle embedding (default: (0, pi)).
    subsample_size : int
        Number of stratified samples for exact NISQ quantum simulation benchmark (default: 200).
    test_size : float
        Fraction of data reserved for testing (default: 0.2).
    random_state : int
        Random seed for reproducibility.

    Returns
    -------
    dict
        Dictionary containing scaled arrays, labels, feature metadata, and statistics.
    """
    csv_file = Path(features_csv_path)
    if not csv_file.exists():
        raise FileNotFoundError(f"ESOL features file not found at: {features_csv_path}")

    df = pd.read_csv(csv_file)
    logger.info(f"Loaded {len(df)} molecules from {features_csv_path}")

    # 1. Construct binary solubility ground truth label
    # High Solubility (1): LogS > -3.0 (Soluble in water >= 1 mM)
    # Low Solubility (0): LogS <= -3.0 (Poorly soluble)
    y_binary = (df["measured_solubility_logs"] > SOLUBILITY_BINARY_THRESHOLD).astype(int).values
    pos_count = int(np.sum(y_binary == 1))
    neg_count = int(np.sum(y_binary == 0))
    logger.info(
        f"Binary target distribution (threshold={SOLUBILITY_BINARY_THRESHOLD} LogS): "
        f"Soluble (1) = {pos_count} ({pos_count/len(df)*100:.1f}%), "
        f"Insoluble (0) = {neg_count} ({neg_count/len(df)*100:.1f}%)"
    )

    # 2. Select or Reduce Feature Space
    if feature_columns is None:
        feature_columns = DEFAULT_QUANTUM_FEATURES

    if use_pca:
        # Collect all numeric descriptors
        numeric_cols = [
            "molecular_weight", "logp", "tpsa", "hbd", "hba",
            "rotatable_bonds", "ring_count", "heavy_atom_count",
            "num_aromatic_rings", "num_aliphatic_rings", "num_heteroatoms",
            "fraction_csp3", "molar_refractivity"
        ]
        raw_X = df[numeric_cols].values
        pca = PCA(n_components=n_qubits, random_state=random_state)
        X_selected = pca.fit_transform(raw_X)
        selected_feature_names = [f"PCA_Comp_{i+1}" for i in range(n_qubits)]
        explained_var = float(np.sum(pca.explained_variance_ratio_))
        logger.info(f"Applied PCA reduction to {n_qubits} components (Explained Var: {explained_var:.4f})")
    else:
        # Validate requested features exist
        for col in feature_columns[:n_qubits]:
            if col not in df.columns:
                raise ValueError(f"Feature column '{col}' not found in dataset.")
        selected_feature_names = feature_columns[:n_qubits]
        X_selected = df[selected_feature_names].values
        logger.info(f"Selected {len(selected_feature_names)} features: {selected_feature_names}")

    # 3. Stratified Train / Test Split (Full Dataset)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_selected,
        y_binary,
        test_size=test_size,
        random_state=random_state,
        stratify=y_binary,
    )

    # 4. Quantum Angle Scaling to [0, pi]
    scaler = MinMaxScaler(feature_range=angle_range)
    X_train_scaled = np.clip(scaler.fit_transform(X_train_raw), angle_range[0], angle_range[1])
    X_test_scaled = np.clip(scaler.transform(X_test_raw), angle_range[0], angle_range[1])

    # 5. Stratified Subsampling for Quantum Kernel Simulation Benchmarks
    # Quantum kernel evaluation scales as O(N^2) circuit executions.
    # A stratified subset of 200 samples (160 train, 40 test) executes in ~3-5 seconds.
    if subsample_size < len(df):
        sub_indices, _ = train_test_split(
            np.arange(len(df)),
            train_size=subsample_size,
            random_state=random_state,
            stratify=y_binary,
        )
        sub_mask_train = np.isin(np.arange(len(df))[X_selected.shape[0]:], sub_indices)
        
        # Subsample from train and test splits proportionally
        n_train_sub = int(subsample_size * (1 - test_size))
        n_test_sub = subsample_size - n_train_sub

        train_sub_idx, _ = train_test_split(
            np.arange(len(X_train_scaled)),
            train_size=n_train_sub,
            random_state=random_state,
            stratify=y_train,
        )
        test_sub_idx, _ = train_test_split(
            np.arange(len(X_test_scaled)),
            train_size=n_test_sub,
            random_state=random_state,
            stratify=y_test,
        )

        X_train_sub = X_train_scaled[train_sub_idx]
        y_train_sub = y_train[train_sub_idx]
        X_test_sub = X_test_scaled[test_sub_idx]
        y_test_sub = y_test[test_sub_idx]
    else:
        X_train_sub = X_train_scaled
        y_train_sub = y_train
        X_test_sub = X_test_scaled
        y_test_sub = y_test

    logger.info(
        f"Prepared Quantum Dataset: "
        f"Full (Train: {len(X_train_scaled)}, Test: {len(X_test_scaled)}), "
        f"Subsampled (Train: {len(X_train_sub)}, Test: {len(X_test_sub)})"
    )

    data_payload = {
        "X_train_full": X_train_scaled,
        "y_train_full": y_train,
        "X_test_full": X_test_scaled,
        "y_test_full": y_test,
        "X_train_sub": X_train_sub,
        "y_train_sub": y_train_sub,
        "X_test_sub": X_test_sub,
        "y_test_sub": y_test_sub,
        "feature_names": selected_feature_names,
        "angle_min": angle_range[0],
        "angle_max": angle_range[1],
        "threshold": SOLUBILITY_BINARY_THRESHOLD,
    }

    return data_payload, scaler


def save_quantum_dataset(
    data_payload: Dict,
    output_npz_path: str = "data/processed/quantum_esol_4q.npz",
    output_meta_path: str = "data/processed/quantum_prep_metadata.json",
):
    """
    Serializes preprocessed quantum data and metadata to disk.
    """
    npz_path = Path(output_npz_path)
    meta_path = Path(output_meta_path)
    npz_path.parent.mkdir(parents=True, exist_ok=True)

    np.savez_compressed(
        npz_path,
        X_train_full=data_payload["X_train_full"],
        y_train_full=data_payload["y_train_full"],
        X_test_full=data_payload["X_test_full"],
        y_test_full=data_payload["y_test_full"],
        X_train_sub=data_payload["X_train_sub"],
        y_train_sub=data_payload["y_train_sub"],
        X_test_sub=data_payload["X_test_sub"],
        y_test_sub=data_payload["y_test_sub"],
    )

    metadata = {
        "dataset_name": "Delaney ESOL (Quantum 4-Qubit Scaled)",
        "num_qubits": len(data_payload["feature_names"]),
        "features": data_payload["feature_names"],
        "angle_bounds": [float(data_payload["angle_min"]), float(data_payload["angle_max"])],
        "solubility_threshold_logs": float(data_payload["threshold"]),
        "full_samples": {
            "train": int(len(data_payload["X_train_full"])),
            "test": int(len(data_payload["X_test_full"])),
        },
        "subsample_samples": {
            "train": int(len(data_payload["X_train_sub"])),
            "test": int(len(data_payload["X_test_sub"])),
        },
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Saved quantum dataset to: {output_npz_path}")
    logger.info(f"Saved quantum metadata to: {output_meta_path}")


if __name__ == "__main__":
    payload, scaler = load_and_preprocess_quantum_data()
    save_quantum_dataset(payload)
