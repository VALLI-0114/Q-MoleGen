"""
QM9 Quantum Chemistry Dataset Acquisition, Unit Conversion & Auditing Pipeline.
Acquires DFT (B3LYP/6-31G(2df,p)) computed electronic and thermodynamic properties for small organic molecules:
HOMO, LUMO, HOMO-LUMO Gap, Dipole Moment, and Polarizability.
"""

import json
import logging
import os
import urllib.request
from pathlib import Path
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from rdkit import Chem

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

QM9_REMOTE_URL = "https://deepchemdata.s3-us-west-1.amazonaws.com/datasets/qm9.csv"
RAW_QM9_PATH = Path("data/raw/qm9_subset.csv")
AUDIT_QM9_PATH = Path("data/processed/qm9_audit.json")

# Physical Constants
HARTREE_TO_EV = 27.211386245988  # 1 Hartree = 27.2114 eV


def download_and_curate_qm9(
    subset_size: int = 5000,
    random_state: int = 42,
    output_raw_path: Path = RAW_QM9_PATH,
    output_audit_path: Path = AUDIT_QM9_PATH,
) -> Tuple[pd.DataFrame, Dict]:
    """
    Downloads QM9 dataset, parses SMILES with RDKit, standardizes quantum properties to eV,
    and creates a curated, validated subset.
    """
    output_raw_path.parent.mkdir(parents=True, exist_ok=True)
    output_audit_path.parent.mkdir(parents=True, exist_ok=True)

    temp_download_path = output_raw_path.parent / "qm9_full_download.csv"

    if not temp_download_path.exists():
        logger.info(f"Downloading full QM9 dataset from {QM9_REMOTE_URL} (approx 29.8 MB)...")
        urllib.request.urlretrieve(QM9_REMOTE_URL, temp_download_path)
        logger.info("Download completed successfully.")
    else:
        logger.info(f"Using cached QM9 full file at: {temp_download_path}")

    # Read dataset
    df_raw = pd.read_csv(temp_download_path)
    total_raw_count = len(df_raw)
    logger.info(f"Raw QM9 contains {total_raw_count} compounds with columns: {list(df_raw.columns)}")

    # Standardize column mapping
    # Typical QM9 columns: mol_id, smiles, A, B, C, mu, alpha, homo, lumo, gap, r2, zpve, u0, u298, h298, g298, cv
    col_mapping = {
        "smiles": "canonical_smiles",
        "homo": "homo_hartree",
        "lumo": "lumo_hartree",
        "gap": "gap_hartree",
        "mu": "dipole_moment_debye",
        "alpha": "polarizability_bohr3",
        "cv": "heat_capacity_cv",
    }
    
    # Check present columns
    rename_dict = {k: v for k, v in col_mapping.items() if k in df_raw.columns}
    df = df_raw.rename(columns=rename_dict).copy()

    # Convert Hartree to electron-Volts (eV) for standard quantum chemistry interpretation
    if "homo_hartree" in df.columns:
        df["homo_ev"] = np.round(df["homo_hartree"] * HARTREE_TO_EV, 4)
    if "lumo_hartree" in df.columns:
        df["lumo_ev"] = np.round(df["lumo_hartree"] * HARTREE_TO_EV, 4)
    if "gap_hartree" in df.columns:
        df["gap_ev"] = np.round(df["gap_hartree"] * HARTREE_TO_EV, 4)

    # Validate and canonicalize SMILES with RDKit
    logger.info("Validating and canonicalizing molecular structures with RDKit...")
    valid_records = []
    
    # Sample stratified/representative subset
    if subset_size < len(df):
        df_sample = df.sample(n=subset_size, random_state=random_state).reset_index(drop=True)
    else:
        df_sample = df.reset_index(drop=True)

    for idx, row in df_sample.iterrows():
        smi = str(row.get("canonical_smiles", "")).strip()
        if not smi:
            continue
        mol = Chem.MolFromSmiles(smi)
        if mol is None:
            continue
        
        canon_smi = Chem.MolToSmiles(mol, canonical=True)
        heavy_atoms = mol.GetNumHeavyAtoms()
        
        record = {
            "compound_id": f"QM9_{idx+1:05d}",
            "canonical_smiles": canon_smi,
            "heavy_atom_count": heavy_atoms,
            "homo_ev": float(row["homo_ev"]),
            "lumo_ev": float(row["lumo_ev"]),
            "gap_ev": float(row["gap_ev"]),
            "dipole_moment_debye": float(row["dipole_moment_debye"]),
            "polarizability_bohr3": float(row["polarizability_bohr3"]),
            "heat_capacity_cv": float(row["heat_capacity_cv"]),
        }
        valid_records.append(record)

    curated_df = pd.DataFrame(valid_records)
    logger.info(f"Curated {len(curated_df)} verified molecules for QM9 subset.")

    # Save Curated CSV
    curated_df.to_csv(output_raw_path, index=False)
    logger.info(f"Saved curated QM9 subset to: {output_raw_path}")

    # Generate Audit Metadata
    audit_data = {
        "dataset_name": "QM9 (Quantum Chemistry Electronic Properties Subset)",
        "source": QM9_REMOTE_URL,
        "methodology": "Density Functional Theory (DFT) B3LYP/6-31G(2df,p)",
        "total_molecules_curated": len(curated_df),
        "columns": list(curated_df.columns),
        "statistics": {
            "homo_ev": {
                "mean": float(curated_df["homo_ev"].mean()),
                "std": float(curated_df["homo_ev"].std()),
                "min": float(curated_df["homo_ev"].min()),
                "max": float(curated_df["homo_ev"].max()),
            },
            "lumo_ev": {
                "mean": float(curated_df["lumo_ev"].mean()),
                "std": float(curated_df["lumo_ev"].std()),
                "min": float(curated_df["lumo_ev"].min()),
                "max": float(curated_df["lumo_ev"].max()),
            },
            "gap_ev": {
                "mean": float(curated_df["gap_ev"].mean()),
                "std": float(curated_df["gap_ev"].std()),
                "min": float(curated_df["gap_ev"].min()),
                "max": float(curated_df["gap_ev"].max()),
            },
            "dipole_moment_debye": {
                "mean": float(curated_df["dipole_moment_debye"].mean()),
                "std": float(curated_df["dipole_moment_debye"].std()),
                "min": float(curated_df["dipole_moment_debye"].min()),
                "max": float(curated_df["dipole_moment_debye"].max()),
            },
        },
    }

    with open(output_audit_path, "w") as f:
        json.dump(audit_data, f, indent=2)

    logger.info(f"Saved QM9 audit metadata to: {output_audit_path}")
    return curated_df, audit_data


if __name__ == "__main__":
    df, audit = download_and_curate_qm9(subset_size=5000)
    print("\n" + "=" * 70)
    print("QM9 CURATED SUBSET AUDIT SUMMARY:")
    print("=" * 70)
    print(f"Total Verified Molecules : {len(df)}")
    print(f"Mean HOMO Energy (eV)    : {audit['statistics']['homo_ev']['mean']:.3f} ± {audit['statistics']['homo_ev']['std']:.3f}")
    print(f"Mean LUMO Energy (eV)    : {audit['statistics']['lumo_ev']['mean']:.3f} ± {audit['statistics']['lumo_ev']['std']:.3f}")
    print(f"Mean HOMO-LUMO Gap (eV)  : {audit['statistics']['gap_ev']['mean']:.3f} ± {audit['statistics']['gap_ev']['std']:.3f}")
    print(f"Mean Dipole Moment (D)   : {audit['statistics']['dipole_moment_debye']['mean']:.3f} ± {audit['statistics']['dipole_moment_debye']['std']:.3f}")
    print("=" * 70)
