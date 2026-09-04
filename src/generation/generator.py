"""
Molecular Generative AI Engine for De Novo Candidate Design in Q-MolGen.
Implements fragment-based mutation, bioisosteric functional group substitution,
and scaffold decoration using RDKit chemical transformations.
"""

import logging
import random
import sys
from pathlib import Path
from typing import List, Optional, Set, Tuple

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, Lipinski, QED, rdChemReactions

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Representative Seed Core Scaffolds for Medicinal Chemistry
DEFAULT_SEED_SCAFFOLDS = [
    "c1ccccc1",                        # Benzene
    "c1ccncc1",                        # Pyridine
    "c1ccc2[nH]ccc2c1",                # Indole
    "c1cnc2nc[nH]c2n1",                # Purine
    "CC(=O)Oc1ccccc1C(=O)O",           # Aspirin (Acetylsalicylic acid)
    "CC(C)Cc1ccc(cc1)C(C)C(=O)O",      # Ibuprofen
    "CC(=O)Nc1ccc(O)cc1",              # Paracetamol
    "c1ccc2c(c1)Cc1ccccc1-2",          # Fluorene
    "c1ccc(cc1)c1ccccc1",              # Biphenyl
    "OC(=O)c1ccccc1O",                 # Salicylic acid
]

# Chemical Transformation Reaction SMARTS (Bioisosteric Replacements & Functionalization)
MUTATION_REACTIONS = [
    # 1. Aromatic Hydrogen -> Hydroxyl (-OH, increases aqueous solubility & HBD)
    ("[c:1][H:2]>>[c:1][OH]", "Aromatic Hydroxylation"),
    # 2. Aromatic Hydrogen -> Fluorine (-F, metabolic stability bioisostere)
    ("[c:1][H:2]>>[c:1]F", "Fluorination"),
    # 3. Aromatic Hydrogen -> Methyl (-CH3, lipophilicity modulation)
    ("[c:1][H:2]>>[c:1]C", "Methylation"),
    # 4. Aromatic Hydrogen -> Carboxylic Acid (-COOH, high aqueous solubility)
    ("[c:1][H:2]>>[c:1]C(=O)O", "Carboxylation"),
    # 5. Aromatic Hydrogen -> Amine (-NH2, basic pKa & H-bonding)
    ("[c:1][H:2]>>[c:1]N", "Amination"),
    # 6. Aromatic Hydrogen -> Methoxy (-OCH3, hydrogen bond acceptor)
    ("[c:1][H:2]>>[c:1]OC", "Methoxylation"),
    # 7. Aromatic Hydrogen -> Trifluoromethyl (-CF3, lipophilic electron withdrawer)
    ("[c:1][H:2]>>[c:1]C(F)(F)F", "Trifluoromethylation"),
    # 8. Aliphatic Carbon -> Carbonyl (Oxidation)
    ("[C:1][H:2]>>[C:1]=O", "Carbonyl Insertion"),
    # 9. Hydroxyl -> Ether
    ("[c:1][OH]>>[c:1]OCC", "Etherification"),
    # 10. Carboxylic Acid -> Ester
    ("[C:1](=O)[OH]>>[C:1](=O)OC", "Esterification"),
]


class MoleculeGenerator:
    """
    Stochastic & Bioisosteric De Novo Molecular Generator.
    Generates chemically valid, novel candidate molecules from seed scaffolds.
    """

    def __init__(self, seed_smiles: Optional[List[str]] = None, random_state: int = 42):
        self.seed_smiles = seed_smiles if seed_smiles is not None else DEFAULT_SEED_SCAFFOLDS
        self.random_state = random_state
        random.seed(random_state)
        np.random.seed(random_state)

        # Pre-compile RDKit chemical reaction operators
        self.reactions = []
        for rxn_smarts, name in MUTATION_REACTIONS:
            try:
                rxn = rdChemReactions.ReactionFromSmarts(rxn_smarts)
                if rxn:
                    self.reactions.append((rxn, name))
            except Exception as e:
                logger.warning(f"Failed to compile SMARTS '{rxn_smarts}': {e}")

        logger.info(f"Initialized MoleculeGenerator with {len(self.seed_smiles)} seeds and {len(self.reactions)} chemical reactions.")

    def mutate_molecule(self, mol: Chem.Mol, max_attempts: int = 10) -> Optional[Chem.Mol]:
        """
        Applies a random valid chemical reaction to a parent molecule.
        """
        # Add explicit hydrogens to allow substitution reactions on C-H bonds
        mol_with_h = Chem.AddHs(mol)
        
        # Shuffle reactions for variety
        rxn_indices = list(range(len(self.reactions)))
        random.shuffle(rxn_indices)

        for idx in rxn_indices:
            rxn, rxn_name = self.reactions[idx]
            try:
                products = rxn.RunReactants((mol_with_h,))
                if products and len(products) > 0 and len(products[0]) > 0:
                    raw_product = products[0][0]
                    # Remove explicit hydrogens and sanitize
                    clean_mol = Chem.RemoveHs(raw_product)
                    Chem.SanitizeMol(clean_mol)
                    return clean_mol
            except Exception:
                continue

        # Fallback: simple atom-level edit (e.g. replace an atom or attach group)
        return None

    def generate_candidate_population(
        self,
        target_count: int = 50,
        max_mutations_per_mol: int = 3,
        seed_pool: Optional[List[str]] = None,
    ) -> List[str]:
        """
        Generates a diverse population of unique, valid SMILES strings.
        
        Parameters
        ----------
        target_count : int
            Desired number of novel candidate molecules.
        max_mutations_per_mol : int
            Maximum number of sequential chemical transformations applied to each parent.
        seed_pool : list of str, optional
            Custom seed pool to start generative search.

        Returns
        -------
        list of str
            List of canonical SMILES strings.
        """
        seeds = seed_pool if seed_pool is not None else self.seed_smiles
        generated_smiles_set: Set[str] = set()
        
        # Include canonical seed SMILES
        for s in seeds:
            m = Chem.MolFromSmiles(s)
            if m:
                generated_smiles_set.add(Chem.MolToSmiles(m, canonical=True))

        attempts = 0
        max_total_attempts = target_count * 40

        while len(generated_smiles_set) < target_count + len(seeds) and attempts < max_total_attempts:
            attempts += 1
            # Pick a parent from the current generated pool or seeds
            parent_smi = random.choice(list(generated_smiles_set))
            parent_mol = Chem.MolFromSmiles(parent_smi)
            if parent_mol is None:
                continue

            current_mol = Chem.Mol(parent_mol)
            num_steps = random.randint(1, max_mutations_per_mol)

            for _ in range(num_steps):
                mutated = self.mutate_molecule(current_mol)
                if mutated is not None:
                    current_mol = mutated

            try:
                # Sanitize and check molecular size constraints (MW between 80 and 550 Da)
                Chem.SanitizeMol(current_mol)
                canon_smi = Chem.MolToSmiles(current_mol, canonical=True)
                mw = Descriptors.MolWt(current_mol)
                heavy_atoms = current_mol.GetNumHeavyAtoms()

                if 80.0 <= mw <= 550.0 and 5 <= heavy_atoms <= 35 and "." not in canon_smi:
                    generated_smiles_set.add(canon_smi)
            except Exception:
                continue

        logger.info(f"Generated {len(generated_smiles_set)} unique candidate molecules across {attempts} iterations.")
        return sorted(list(generated_smiles_set))


if __name__ == "__main__":
    generator = MoleculeGenerator()
    candidates = generator.generate_candidate_population(target_count=30)
    print("\n" + "=" * 70)
    print(f"GENERATED {len(candidates)} DE NOVO CANDIDATE MOLECULES:")
    print("=" * 70)
    for i, smi in enumerate(candidates[:15], 1):
        m = Chem.MolFromSmiles(smi)
        mw = Descriptors.MolWt(m)
        logp = Descriptors.MolLogP(m)
        qed_val = QED.qed(m)
        print(f"{i:02d}. SMILES: {smi:<38} | MW: {mw:>6.1f} | LogP: {logp:>5.2f} | QED: {qed_val:.3f}")
    print("=" * 70)
