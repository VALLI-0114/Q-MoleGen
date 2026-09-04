"""
Phase 6: RDKit Molecular Descriptor Extraction Pipeline
Converts raw SMILES strings into comprehensive physicochemical descriptor feature vectors,
evaluates Lipinski's Rule of 5, and generates data/processed/esol_features.csv.
"""

import os
import pandas as pd
import numpy as np
from typing import Optional, Dict, Any
from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski, Crippen, MolSurf

RAW_DATA_PATH = os.path.join("data", "raw", "delaney_esol.csv")
PROCESSED_DATA_PATH = os.path.join("data", "processed", "esol_features.csv")


def extract_single_molecule_descriptors(smiles: str) -> Optional[Dict[str, Any]]:
    """
    Parses a single SMILES string with RDKit and computes core 1D & 2D descriptors.
    Returns None safely if SMILES parsing fails.
    """
    if not isinstance(smiles, str) or not smiles.strip():
        return None

    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None

        # Canonicalize SMILES
        canonical_smiles = Chem.MolToSmiles(mol, canonical=True)

        # Primary Physicochemical Descriptors
        mw = float(Descriptors.MolWt(mol))
        logp = float(Crippen.MolLogP(mol))
        tpsa = float(MolSurf.TPSA(mol))
        hbd = int(Lipinski.NumHDonors(mol))
        hba = int(Lipinski.NumHAcceptors(mol))
        rotatable_bonds = int(Lipinski.NumRotatableBonds(mol))
        ring_count = int(Lipinski.RingCount(mol))
        heavy_atom_count = int(mol.GetNumHeavyAtoms())
        
        # Extended Structural Descriptors
        num_aromatic_rings = int(Lipinski.NumAromaticRings(mol))
        num_aliphatic_rings = int(Lipinski.NumAliphaticRings(mol))
        num_heteroatoms = int(Lipinski.NumHeteroatoms(mol))
        fraction_csp3 = float(Descriptors.FractionCSP3(mol))
        molar_refractivity = float(Crippen.MolMR(mol))

        # Lipinski Rule of 5 Evaluation
        ro5_violations = 0
        if mw > 500.0:
            ro5_violations += 1
        if logp > 5.0:
            ro5_violations += 1
        if hbd > 5:
            ro5_violations += 1
        if hba > 10:
            ro5_violations += 1

        is_ro5_compliant = ro5_violations <= 1

        return {
            "canonical_smiles": canonical_smiles,
            "molecular_weight": round(mw, 4),
            "logp": round(logp, 4),
            "tpsa": round(tpsa, 4),
            "hbd": hbd,
            "hba": hba,
            "rotatable_bonds": rotatable_bonds,
            "ring_count": ring_count,
            "heavy_atom_count": heavy_atom_count,
            "num_aromatic_rings": num_aromatic_rings,
            "num_aliphatic_rings": num_aliphatic_rings,
            "num_heteroatoms": num_heteroatoms,
            "fraction_csp3": round(fraction_csp3, 4),
            "molar_refractivity": round(molar_refractivity, 4),
            "ro5_violations": ro5_violations,
            "ro5_compliant": is_ro5_compliant,
        }
    except Exception:
        return None


def process_esol_features(
    input_csv: str = RAW_DATA_PATH,
    output_csv: str = PROCESSED_DATA_PATH
) -> pd.DataFrame:
    """
    Processes the raw Delaney ESOL dataset, computes full descriptor profiles,
    merges target aqueous solubility values, and saves the output to data/processed/.
    """
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)

    if not os.path.exists(input_csv):
        from src.preprocessing.download_esol import acquire_esol_dataset
        df_raw, _ = acquire_esol_dataset()
    else:
        df_raw = pd.read_csv(input_csv)

    smiles_col = "smiles"
    target_col = "measured log solubility in mols per litre"
    id_col = "Compound ID"

    feature_rows = []
    failed_rows = []

    for idx, row in df_raw.iterrows():
        smiles = row[smiles_col]
        desc = extract_single_molecule_descriptors(smiles)

        if desc is not None:
            desc["compound_id"] = row.get(id_col, f"MOL_{idx}")
            desc["measured_solubility_logs"] = float(row[target_col])
            feature_rows.append(desc)
        else:
            failed_rows.append((idx, smiles))

    df_features = pd.DataFrame(feature_rows)

    # Reorder columns logically: Identifiers -> Target -> Descriptors
    lead_cols = ["compound_id", "canonical_smiles", "measured_solubility_logs"]
    other_cols = [c for c in df_features.columns if c not in lead_cols]
    df_features = df_features[lead_cols + other_cols]

    # Save to disk
    df_features.to_csv(output_csv, index=False)
    print(f"Processed {len(df_features)} molecules successfully -> Saved to {output_csv}")
    if failed_rows:
        print(f"Warning: Failed to parse {len(failed_rows)} molecules: {failed_rows}")

    return df_features


if __name__ == "__main__":
    print("=" * 80)
    print("Q-MolGen: Phase 6 RDKit Molecular Descriptor Feature Processing")
    print("=" * 80)
    df_feat = process_esol_features()
    print("\nProcessed Feature Matrix Sample:")
    print(df_feat.head(3).T)
    print(f"\nFinal Matrix Dimensions: {df_feat.shape[0]} rows x {df_feat.shape[1]} feature columns")
