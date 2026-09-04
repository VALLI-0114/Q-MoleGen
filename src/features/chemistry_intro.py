"""
Phase 1: Minimum Chemistry & Cheminformatics Demonstration
Computes all core molecular descriptors, tests Lipinski's Rule of 5,
and demonstrates canonicalization and Morgan fingerprinting.
"""

from typing import Dict, Any, Optional
from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski, rdMolDescriptors
import numpy as np


def compute_all_descriptors(smiles: str) -> Optional[Dict[str, Any]]:
    """
    Parses a SMILES string and calculates key physicochemical descriptors
    along with Lipinski Rule of 5 compliance.
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None

    # Canonical SMILES
    canonical_smiles = Chem.MolToSmiles(mol, canonical=True)

    # Physicochemical Descriptors
    mw = Descriptors.MolWt(mol)
    logp = Descriptors.MolLogP(mol)
    tpsa = Descriptors.TPSA(mol)
    hbd = Lipinski.NumHDonors(mol)
    hba = Lipinski.NumHAcceptors(mol)
    rotatable_bonds = Lipinski.NumRotatableBonds(mol)
    ring_count = Lipinski.RingCount(mol)
    heavy_atom_count = mol.GetNumHeavyAtoms()

    # Lipinski Rule of 5 Evaluation (Max 1 violation allowed)
    ro5_violations = 0
    if mw > 500:
        ro5_violations += 1
    if logp > 5.0:
        ro5_violations += 1
    if hbd > 5:
        ro5_violations += 1
    if hba > 10:
        ro5_violations += 1

    is_ro5_compliant = ro5_violations <= 1

    # Morgan Fingerprint (radius=2, 1024 bits using modern rdFingerprintGenerator)
    try:
        from rdkit.Chem import rdFingerprintGenerator
        mfp_gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=1024)
        fp = mfp_gen.GetFingerprint(mol)
    except (ImportError, AttributeError):
        fp = rdMolDescriptors.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=1024)

    fp_array = np.zeros((1024,), dtype=int)
    for bit_idx in fp.GetOnBits():
        fp_array[bit_idx] = 1

    return {
        "input_smiles": smiles,
        "canonical_smiles": canonical_smiles,
        "molecular_weight": round(mw, 3),
        "logp": round(logp, 3),
        "tpsa": round(tpsa, 3),
        "hbd": hbd,
        "hba": hba,
        "rotatable_bonds": rotatable_bonds,
        "ring_count": ring_count,
        "heavy_atom_count": heavy_atom_count,
        "ro5_violations": ro5_violations,
        "ro5_compliant": is_ro5_compliant,
        "fp_on_bits_count": len(fp.GetOnBits()),
    }


def demo_chemistry_knowledge():
    """Runs a quick demonstration on canonical drug candidates."""
    benchmark_molecules = {
        "Aspirin": "CC(=O)Oc1ccccc1C(=O)O",
        "Caffeine": "Cn1cnc2c1c(=O)n(c(=O)n2C)C",
        "Paracetamol": "CC(=O)Nc1ccc(O)cc1",
        "Ibuprofen": "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
        "Ethanol (Small Molecule)": "CCO",
    }

    print("=" * 80)
    print("Q-MolGen: Phase 1 Chemistry & Cheminformatics Feature Demonstration")
    print("=" * 80)

    for name, smiles in benchmark_molecules.items():
        data = compute_all_descriptors(smiles)
        if data:
            print(f"\nMolecule: {name}")
            print(f"  SMILES: {data['canonical_smiles']}")
            print(f"  MW: {data['molecular_weight']} Da | LogP: {data['logp']} | TPSA: {data['tpsa']} Å²")
            print(f"  HBD: {data['hbd']} | HBA: {data['hba']} | RotBonds: {data['rotatable_bonds']} | Rings: {data['ring_count']}")
            print(f"  Lipinski Ro5 Compliant: {data['ro5_compliant']} (Violations: {data['ro5_violations']})")
            print(f"  Morgan FP Active Bits: {data['fp_on_bits_count']} / 1024")


if __name__ == "__main__":
    demo_chemistry_knowledge()
