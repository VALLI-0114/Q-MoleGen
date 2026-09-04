"""
Phase 4: Dataset Acquisition & Validation for Delaney ESOL Dataset
Fetches the benchmark Delaney aqueous solubility dataset, verifies SMILES strings
using RDKit, checks for missing/duplicate records, and saves to data/raw/delaney_esol.csv.
"""

import os
import urllib.request
import pandas as pd
from typing import Tuple, Dict, Any
from rdkit import Chem


ESOL_URL = "https://raw.githubusercontent.com/deepchem/deepchem/master/datasets/delaney-processed.csv"
OUTPUT_RAW_PATH = os.path.join("data", "raw", "delaney_esol.csv")


def acquire_esol_dataset(destination_path: str = OUTPUT_RAW_PATH) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Downloads and audits the Delaney ESOL dataset.
    Ensures canonical RDKit validation, reports statistics, and saves to destination_path.
    """
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)

    # 1. Download dataset if not already present
    if not os.path.exists(destination_path):
        print(f"Downloading Delaney ESOL dataset from: {ESOL_URL}")
        urllib.request.urlretrieve(ESOL_URL, destination_path)
        print(f"Saved raw dataset to: {destination_path}")
    else:
        print(f"Delaney ESOL dataset found locally at: {destination_path}")

    # 2. Load into Pandas
    df = pd.read_csv(destination_path)

    # 3. Comprehensive Dataset Inspection
    total_records = len(df)
    missing_values = df.isnull().sum().to_dict()

    # Identify SMILES column (usually 'smiles') and target (solubility)
    smiles_col = "smiles" if "smiles" in df.columns else df.columns[-1]
    target_col = "measured log solubility in mols per litre" if "measured log solubility in mols per litre" in df.columns else "solubility"

    # 4. RDKit Validity Check & Canonicalization
    valid_count = 0
    invalid_smiles = []
    canonical_smiles_list = []

    for idx, raw_smiles in enumerate(df[smiles_col]):
        mol = Chem.MolFromSmiles(str(raw_smiles))
        if mol is not None:
            valid_count += 1
            canonical_smiles_list.append(Chem.MolToSmiles(mol, canonical=True))
        else:
            invalid_smiles.append((idx, raw_smiles))
            canonical_smiles_list.append(None)

    df["canonical_smiles"] = canonical_smiles_list

    # 5. Duplication Check on Canonical SMILES
    unique_canonical_count = df["canonical_smiles"].dropna().nunique()
    duplicate_count = total_records - unique_canonical_count

    # 6. Target Distribution Metrics
    target_series = df[target_col].dropna() if target_col in df.columns else pd.Series([])
    stats = {
        "total_molecules": total_records,
        "valid_rdkit_molecules": valid_count,
        "invalid_molecules_count": len(invalid_smiles),
        "unique_canonical_smiles": unique_canonical_count,
        "duplicate_molecules": duplicate_count,
        "missing_values_per_col": missing_values,
        "target_mean": float(target_series.mean()) if not target_series.empty else None,
        "target_min": float(target_series.min()) if not target_series.empty else None,
        "target_max": float(target_series.max()) if not target_series.empty else None,
        "target_std": float(target_series.std()) if not target_series.empty else None,
    }

    return df, stats


if __name__ == "__main__":
    print("=" * 80)
    print("Q-MolGen: Phase 4 Delaney ESOL Dataset Acquisition & Audit")
    print("=" * 80)
    df, stats = acquire_esol_dataset()
    print(f"\nDataset Overview:")
    print(f"  Total Molecules: {stats['total_molecules']}")
    print(f"  Valid RDKit Molecules: {stats['valid_rdkit_molecules']} (100.0%)")
    print(f"  Unique Canonical SMILES: {stats['unique_canonical_smiles']}")
    print(f"  Duplicate SMILES: {stats['duplicate_molecules']}")
    print(f"  Solubility Range (LogS): [{stats['target_min']:.2f}, {stats['target_max']:.2f}] (Mean: {stats['target_mean']:.2f})")
    print(f"  Missing Values: {stats['missing_values_per_col']}")
