"""
Phase 10: Molecular Fingerprint Generation Module
Generates Extended-Connectivity Circular Fingerprints (ECFP4 / Morgan Fingerprints)
for individual SMILES strings and processes entire datasets.
"""

import os
import numpy as np
import pandas as pd
from typing import Optional, List, Tuple
from rdkit import Chem
from rdkit.Chem import rdFingerprintGenerator, rdMolDescriptors

RAW_DATA_PATH = os.path.join("data", "raw", "delaney_esol.csv")
FP_OUTPUT_PATH = os.path.join("data", "processed", "esol_fingerprints.npz")


def smiles_to_morgan_fingerprint(
    smiles: str,
    radius: int = 2,
    n_bits: int = 1024
) -> Optional[np.ndarray]:
    """
    Converts a single SMILES string into a 1D Morgan Circular Fingerprint (ECFP4) bit array.
    """
    if not isinstance(smiles, str) or not smiles.strip():
        return None

    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None

        try:
            gen = rdFingerprintGenerator.GetMorganGenerator(radius=radius, fpSize=n_bits)
            fp = gen.GetFingerprint(mol)
        except (ImportError, AttributeError):
            fp = rdMolDescriptors.GetMorganFingerprintAsBitVect(mol, radius=radius, nBits=n_bits)

        arr = np.zeros((n_bits,), dtype=np.int8)
        for on_bit in fp.GetOnBits():
            arr[on_bit] = 1
        return arr
    except Exception:
        return None


def generate_dataset_fingerprints(
    input_csv: str = RAW_DATA_PATH,
    output_npz: str = FP_OUTPUT_PATH,
    n_bits: int = 1024
) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Generates Morgan Fingerprints for all molecules in the dataset,
    saves the feature matrix X and target y to compressed .npz format.
    """
    os.makedirs(os.path.dirname(output_npz), exist_ok=True)

    if not os.path.exists(input_csv):
        from src.preprocessing.download_esol import acquire_esol_dataset
        df, _ = acquire_esol_dataset()
    else:
        df = pd.read_csv(input_csv)

    smiles_col = "smiles"
    target_col = "measured log solubility in mols per litre"

    X_list = []
    y_list = []
    valid_smiles = []

    for idx, row in df.iterrows():
        s = row[smiles_col]
        fp = smiles_to_morgan_fingerprint(s, radius=2, n_bits=n_bits)
        if fp is not None:
            X_list.append(fp)
            y_list.append(float(row[target_col]))
            valid_smiles.append(s)

    X = np.array(X_list, dtype=np.int8)
    y = np.array(y_list, dtype=np.float32)

    np.savez_compressed(output_npz, X=X, y=y, smiles=valid_smiles)
    print(f"Generated Morgan Fingerprint matrix: {X.shape} -> Saved to {output_npz}")
    return X, y, valid_smiles


if __name__ == "__main__":
    print("=" * 80)
    print("Q-MolGen: Phase 10 Morgan Circular Fingerprint (ECFP4) Generation")
    print("=" * 80)
    X, y, smiles = generate_dataset_fingerprints()
    print(f"Fingerprint Matrix Shape: {X.shape} (Density: {np.mean(X)*100:.2f}% active bits)")
    print(f"Target Array Shape: {y.shape}")
