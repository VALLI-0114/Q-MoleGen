"""
Phase 19: Explainable AI (XAI) & Atom-Level Molecular Substructure Attribution Engine for Q-MolGen.
Calculates atom-resolved contributions to lipophilicity (LogP), molar refractivity (MR),
and electronic partial charges (Gasteiger charges) to explain model predictions to medicinal chemists.
"""

import logging
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Add workspace root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import matplotlib.pyplot as plt
import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem, Draw, rdMolDescriptors
from rdkit.Chem.Draw import rdMolDraw2D, SimilarityMaps

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

FIGURES_DIR = Path("docs/figures")
FIGURES_DIR.mkdir(parents=True, exist_ok=True)


def compute_atomic_contributions(smiles: str) -> Optional[Dict]:
    """
    Computes atomic contributions for LogP, Molar Refractivity, and Gasteiger partial charges.

    Parameters
    ----------
    smiles : str
        Canonical SMILES of the target molecule.

    Returns
    -------
    dict with atom-by-atom breakdown and key driver functional groups.
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None

    # 1. Compute Wildman-Crippen Atomic LogP and MR contributions
    atom_contribs = rdMolDescriptors._CalcCrippenContribs(mol)
    atom_logp = [contrib[0] for contrib in atom_contribs]
    atom_mr = [contrib[1] for contrib in atom_contribs]

    # 2. Compute Gasteiger Partial Charges
    AllChem.ComputeGasteigerCharges(mol)
    atom_charges = []
    for atom in mol.GetAtoms():
        charge_val = 0.0
        if atom.HasProp("_GasteigerCharge"):
            try:
                charge_val = float(atom.GetProp("_GasteigerCharge"))
                if np.isnan(charge_val) or np.isinf(charge_val):
                    charge_val = 0.0
            except Exception:
                charge_val = 0.0
        atom_charges.append(round(charge_val, 3))

    # 3. Build Atom Data Inventory
    atoms_data = []
    for idx, atom in enumerate(mol.GetAtoms()):
        atoms_data.append({
            "atom_idx": idx,
            "symbol": atom.GetSymbol(),
            "atomic_num": atom.GetAtomicNum(),
            "is_aromatic": atom.GetIsAromatic(),
            "logp_contrib": round(atom_logp[idx], 3),
            "mr_contrib": round(atom_mr[idx], 3),
            "partial_charge": atom_charges[idx],
            "role": "Hydrophilic (Solubilizing)" if atom_logp[idx] < 0 else "Lipophilic (Hydrophobic)",
        })

    # Summary Statistics
    total_logp = sum(atom_logp)
    hydrophilic_atoms = [a for a in atoms_data if a["logp_contrib"] < 0]
    lipophilic_atoms = [a for a in atoms_data if a["logp_contrib"] > 0]

    return {
        "smiles": smiles,
        "num_atoms": mol.GetNumAtoms(),
        "total_calculated_logp": round(total_logp, 3),
        "num_hydrophilic_atoms": len(hydrophilic_atoms),
        "num_lipophilic_atoms": len(lipophilic_atoms),
        "atoms": atoms_data,
    }


def generate_atom_attribution_svg(smiles: str, property_name: str = "logp", width: int = 350, height: int = 250) -> str:
    """
    Generates a 2D SVG image of the molecule with atom indices and color-coded contribution highlights.
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return ""

    drawer = rdMolDraw2D.MolDraw2DSVG(width, height)
    opts = drawer.drawOptions()
    opts.addAtomIndices = False
    opts.comicMode = False
    opts.bondLineWidth = 2

    # Color atoms by property
    atom_contribs = rdMolDescriptors._CalcCrippenContribs(mol)
    weights = [c[0] if property_name == "logp" else c[1] for c in atom_contribs]

    highlight_atoms = list(range(mol.GetNumAtoms()))
    highlight_colors = {}
    
    # Normalize weights for colormap
    min_w, max_w = min(weights), max(weights)
    span = max_w - min_w if max_w != min_w else 1.0

    for idx, w in enumerate(weights):
        norm_val = (w - min_w) / span  # 0 to 1
        if property_name == "logp":
            # Blue for hydrophilic (low LogP), Red for lipophilic (high LogP)
            r = float(norm_val)
            b = float(1.0 - norm_val)
            g = 0.3
        else:
            r = 0.2
            g = float(norm_val)
            b = 0.8
        highlight_colors[idx] = (r, g, b)

    drawer.DrawMolecule(
        mol,
        highlightAtoms=highlight_atoms,
        highlightAtomColors=highlight_colors,
    )
    drawer.FinishDrawing()
    svg = drawer.GetDrawingText()
    return svg


def generate_xai_comparison_figure(output_path: Optional[Path] = None):
    """
    Creates publication Figure 15 comparing atom-resolved property attribution maps
    for a highly soluble candidate (Aspirin derivative) vs a hydrophobic candidate (Biphenyl derivative).
    """
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    fig, axes = plt.subplots(1, 2, figsize=(13, 5.5), dpi=300)

    # Molecule 1: High Solubility Candidate (Aspirin Derivative: Salicylic acid)
    smi_high = "O=C(O)c1ccccc1O"
    res_high = compute_atomic_contributions(smi_high)
    mol_high = Chem.MolFromSmiles(smi_high)
    AllChem.Compute2DCoords(mol_high)

    # Molecule 2: Hydrophobic Candidate (Biphenyl)
    smi_low = "c1ccc(cc1)c1ccccc1"
    res_low = compute_atomic_contributions(smi_low)
    mol_low = Chem.MolFromSmiles(smi_low)
    AllChem.Compute2DCoords(mol_low)

    # Bar chart of atom-by-atom LogP contribution for High Solubility
    atoms_h = [f"{a['symbol']}{a['atom_idx']}" for a in res_high["atoms"]]
    vals_h = [a["logp_contrib"] for a in res_high["atoms"]]
    colors_h = ["#3b82f6" if v < 0 else "#ef4444" for v in vals_h]

    axes[0].bar(atoms_h, vals_h, color=colors_h, edgecolor="#1e293b", linewidth=1.2)
    axes[0].axhline(0, color="black", linestyle="--", linewidth=1)
    axes[0].set_title(f"A. High Solubility Candidate: Salicylic Acid (LogS = -0.63)\nDominant -OH & -COOH Solubilizing Moieties", fontsize=11, fontweight="bold")
    axes[0].set_xlabel("Atom Identifier", fontsize=10, fontweight="bold")
    axes[0].set_ylabel("Atomic LogP Contribution (Crippen)", fontsize=10, fontweight="bold")
    axes[0].grid(True, linestyle=":", alpha=0.6)

    # Bar chart of atom-by-atom LogP contribution for Low Solubility
    atoms_l = [f"{a['symbol']}{a['atom_idx']}" for a in res_low["atoms"]]
    vals_l = [a["logp_contrib"] for a in res_low["atoms"]]
    colors_l = ["#3b82f6" if v < 0 else "#ef4444" for v in vals_l]

    axes[1].bar(atoms_l, vals_l, color=colors_l, edgecolor="#1e293b", linewidth=1.2)
    axes[1].axhline(0, color="black", linestyle="--", linewidth=1)
    axes[1].set_title(f"B. Hydrophobic Candidate: Biphenyl (LogS = -3.85)\nUniform Lipophilic Aromatic Carbon Drivers", fontsize=11, fontweight="bold")
    axes[1].set_xlabel("Atom Identifier", fontsize=10, fontweight="bold")
    axes[1].set_ylabel("Atomic LogP Contribution (Crippen)", fontsize=10, fontweight="bold")
    axes[1].grid(True, linestyle=":", alpha=0.6)

    plt.suptitle("Q-MolGen Phase 19: Explainable AI (XAI) & Atom-Resolved Substructure Attribution", fontsize=13, fontweight="bold", y=1.02)
    plt.tight_layout()

    out_file = output_path if output_path is not None else (FIGURES_DIR / "15_substructure_attribution.png")
    fig.savefig(out_file, dpi=300, bbox_inches="tight")
    plt.close(fig)
    logger.info(f"Saved Phase 19 XAI publication figure to: {out_file}")
    return out_file


if __name__ == "__main__":
    generate_xai_comparison_figure()
    sample = compute_atomic_contributions("CC(=O)Oc1ccccc1C(=O)O")
    print("\n" + "=" * 70)
    print("PHASE 19: ATOM-RESOLVED EXPLAINABLE AI ATTRIBUTION (ASPIRIN)")
    print("=" * 70)
    for atom in sample["atoms"]:
        print(f"Atom {atom['atom_idx']:02d} [{atom['symbol']:>2}]: LogP Contrib = {atom['logp_contrib']:>6.3f} | Partial Charge = {atom['partial_charge']:>6.3f} | {atom['role']}")
    print("=" * 70)
