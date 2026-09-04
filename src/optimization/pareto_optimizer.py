"""
Multi-Objective Pareto Optimization & Candidate Prioritization Engine for Q-MolGen.
Evaluates de novo generated candidate molecules across bulk aqueous solubility,
QSVC quantum fidelity classification, QED drug-likeness, Ro5 compliance, and DFT quantum properties.
"""

import json
import logging
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import joblib
import numpy as np
import pandas as pd
from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski, QED

from src.features.descriptors import extract_single_molecule_descriptors
from src.features.visualization import smiles_to_svg
from src.generation.generator import MoleculeGenerator
from src.quantum.qsvc_model import QuantumSolubilityClassifier
from src.quantum.train_qm9_surrogate import predict_quantum_properties

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

CLASSICAL_GB_PATH = Path("models/classical/gradient_boosting.joblib")
QSVC_MODEL_PATH = Path("models/quantum/qsvc_esol_model.joblib")


def compute_synthetic_accessibility_heuristic(mol: Chem.Mol) -> float:
    """
    Computes a synthetic complexity index (1.0 to 10.0, lower is more synthesizable).
    Based on ring complexity, rotatable bonds, stereocenters, and molecular weight.
    """
    if mol is None:
        return 10.0
    mw = Descriptors.MolWt(mol)
    rings = Lipinski.RingCount(mol)
    rot_bonds = Lipinski.NumRotatableBonds(mol)
    chiral_centers = len(Chem.FindMolChiralCenters(mol, includeUnassigned=True))
    fsp3 = Descriptors.FractionCSP3(mol)

    score = 1.0 + (mw / 100.0) * 0.5 + (rings * 0.6) + (rot_bonds * 0.2) + (chiral_centers * 0.8) + (fsp3 * 0.5)
    return round(float(np.clip(score, 1.0, 10.0)), 2)


def is_pareto_efficient(costs: np.ndarray) -> np.ndarray:
    """
    Find the pareto-efficient points (maximizing all objectives).
    
    Parameters
    ----------
    costs : np.ndarray of shape (n_points, n_objectives)
        Higher is better for all objectives.

    Returns
    -------
    is_efficient : np.ndarray of bool
    """
    n_points = costs.shape[0]
    is_efficient = np.ones(n_points, dtype=bool)
    for i, c in enumerate(costs):
        if is_efficient[i]:
            # Keep any point with a lower or equal value in any objective
            is_efficient[is_efficient] = np.any(costs[is_efficient] > c, axis=1) | np.all(costs[is_efficient] == c, axis=1)
            is_efficient[i] = True  # And keep self
    return is_efficient


class CandidateOptimizer:
    """
    Multi-objective evaluator and candidate prioritization engine.
    """

    def __init__(self):
        self.classical_model = None
        self.qsvc_model = None
        self._load_models()

    def _load_models(self):
        if CLASSICAL_GB_PATH.exists():
            self.classical_model = joblib.load(CLASSICAL_GB_PATH)
            logger.info("Loaded Classical Gradient Boosting pipeline.")
        else:
            logger.warning(f"Classical model not found at: {CLASSICAL_GB_PATH}")

        if QSVC_MODEL_PATH.exists():
            self.qsvc_model = QuantumSolubilityClassifier.load_model(str(QSVC_MODEL_PATH))
            logger.info("Loaded QSVC quantum classifier.")
        else:
            logger.warning(f"QSVC model not found at: {QSVC_MODEL_PATH}")

    def evaluate_single_candidate(self, smiles: str) -> Optional[Dict]:
        """
        Evaluates a single SMILES string across all 5 scoring dimensions.
        """
        desc = extract_single_molecule_descriptors(smiles)
        if desc is None:
            return None

        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None

        # 1. Classical Predicted Aqueous Solubility (LogS)
        pred_logs = -3.5
        if self.classical_model is not None:
            feat_df = pd.DataFrame([{
                "molecular_weight": desc["molecular_weight"],
                "logp": desc["logp"],
                "tpsa": desc["tpsa"],
                "hbd": desc["hbd"],
                "hba": desc["hba"],
                "rotatable_bonds": desc["rotatable_bonds"],
                "ring_count": desc["ring_count"],
                "heavy_atom_count": desc["heavy_atom_count"],
                "num_aromatic_rings": desc["num_aromatic_rings"],
                "fraction_csp3": desc["fraction_csp3"],
                "molar_refractivity": desc["molar_refractivity"],
            }])
            pred_logs = float(self.classical_model.predict(feat_df)[0])
        else:
            pred_logs = float(-0.8 * desc["logp"] - 0.01 * desc["molecular_weight"] + 0.5)

        # 2. QSVC Quantum Solubility Probability
        quantum_prob = 0.5
        if self.qsvc_model is not None:
            # Scale 4 features to [0, pi]
            bounds_min = np.array([-3.5, 50.0, 0.0, 10.0])
            bounds_max = np.array([7.5, 600.0, 250.0, 150.0])
            feat_raw = np.array([desc["logp"], desc["molecular_weight"], desc["tpsa"], desc["molar_refractivity"]])
            feat_angles = np.clip((feat_raw - bounds_min) / (bounds_max - bounds_min + 1e-8), 0.0, 1.0) * np.pi
            quantum_prob = float(self.qsvc_model.predict_proba(feat_angles.reshape(1, -1))[0, 1])

        # 3. Drug-likeness (QED)
        qed_score = float(QED.qed(mol))

        # 4. Synthetic Accessibility
        sa_score = compute_synthetic_accessibility_heuristic(mol)

        # 5. Quantum Electronic Properties (HOMO-LUMO Gap from QM9 Surrogate)
        qm_props = predict_quantum_properties(smiles)

        # 6. Multi-Objective Composite Prioritization Score (0 - 100)
        # Higher solubility (less negative LogS), higher QED, higher quantum confidence, lower SA complexity, 0 Ro5 violations
        sol_norm = np.clip((pred_logs + 6.0) / 7.0, 0.0, 1.0)  # maps LogS [-6, 1] to [0, 1]
        sa_norm = np.clip((10.0 - sa_score) / 9.0, 0.0, 1.0)   # lower complexity is better

        composite_score = (
            0.35 * sol_norm * 100 +
            0.30 * qed_score * 100 +
            0.15 * quantum_prob * 100 +
            0.10 * sa_norm * 100 +
            (10.0 if desc["ro5_compliant"] else 0.0)
        )

        svg_img = smiles_to_svg(smiles, width=280, height=180)

        return {
            "smiles": smiles,
            "pred_solubility_logs": round(pred_logs, 3),
            "solubility_class": "High Solubility" if pred_logs > -3.0 else "Moderate/Low Solubility",
            "quantum_fidelity_prob": round(quantum_prob, 3),
            "qed_drug_likeness": round(qed_score, 3),
            "synthetic_accessibility": sa_score,
            "homo_lumo_gap_ev": qm_props.get("homo_lumo_gap_ev", 6.8),
            "dipole_moment_debye": qm_props.get("dipole_moment_debye", 2.5),
            "ro5_compliant": desc["ro5_compliant"],
            "ro5_violations": desc["ro5_violations"],
            "descriptors": desc,
            "composite_score": round(float(composite_score), 1),
            "svg": svg_img,
        }

    def run_generative_campaign(
        self,
        target_count: int = 30,
        seed_pool: Optional[List[str]] = None,
        top_k: int = 15,
    ) -> Dict:
        """
        Executes an end-to-end de novo generation, evaluation, and Pareto ranking campaign.
        """
        generator = MoleculeGenerator(seed_smiles=seed_pool)
        candidate_smiles = generator.generate_candidate_population(target_count=target_count)

        evaluated_candidates = []
        for smi in candidate_smiles:
            eval_res = self.evaluate_single_candidate(smi)
            if eval_res is not None:
                evaluated_candidates.append(eval_res)

        if not evaluated_candidates:
            return {"candidates": [], "pareto_count": 0}

        # Pareto Frontier Analysis over (Solubility, QED, Quantum Confidence)
        # Objectives to maximize:
        objectives = np.array([
            [c["pred_solubility_logs"], c["qed_drug_likeness"], c["quantum_fidelity_prob"]]
            for c in evaluated_candidates
        ])

        pareto_flags = is_pareto_efficient(objectives)
        for c, is_p in zip(evaluated_candidates, pareto_flags):
            c["is_pareto_optimal"] = bool(is_p)

        # Sort by Composite Score descending
        evaluated_candidates.sort(key=lambda x: x["composite_score"], reverse=True)

        # Assign Candidate IDs
        for idx, c in enumerate(evaluated_candidates, 1):
            c["candidate_id"] = f"QMOL-{idx:03d}"

        pareto_candidates = [c for c in evaluated_candidates if c["is_pareto_optimal"]]
        top_prioritized = evaluated_candidates[:top_k]

        logger.info(
            f"Campaign Complete: Evaluated {len(evaluated_candidates)} molecules, "
            f"{len(pareto_candidates)} Pareto-optimal candidates identified. "
            f"Best Composite Score: {evaluated_candidates[0]['composite_score']}."
        )

        return {
            "total_generated": len(evaluated_candidates),
            "pareto_optimal_count": len(pareto_candidates),
            "top_candidates": top_prioritized,
            "all_candidates": evaluated_candidates,
        }


if __name__ == "__main__":
    optimizer = CandidateOptimizer()
    campaign_results = optimizer.run_generative_campaign(target_count=25, top_k=10)
    
    print("\n" + "=" * 95)
    print("TOP PRIORITIZED DE NOVO CANDIDATE MOLECULES (MULTI-OBJECTIVE PARETO RANKING):")
    print("=" * 95)
    print(f"{'ID':<9} {'SMILES':<34} {'LogS':>7} {'QED':>6} {'QSVC':>6} {'GAP(eV)':>8} {'Ro5':>6} {'Score':>7} {'Pareto'}")
    print("-" * 95)
    for c in campaign_results["top_candidates"]:
        p_tag = "[YES]" if c["is_pareto_optimal"] else " NO"
        print(
            f"{c['candidate_id']:<9} {c['smiles']:<34} {c['pred_solubility_logs']:>7.2f} "
            f"{c['qed_drug_likeness']:>6.3f} {c['quantum_fidelity_prob']:>6.3f} "
            f"{c['homo_lumo_gap_ev']:>8.2f} {'Pass' if c['ro5_compliant'] else 'Fail':>6} "
            f"{c['composite_score']:>7.1f} {p_tag}"
        )
    print("=" * 95)
