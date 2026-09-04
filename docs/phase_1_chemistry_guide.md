# Q-MolGen — Phase 1: Minimum Chemistry & Cheminformatics Foundation

## 1. Introduction: Chemistry for AI & QML Engineers
In computational molecular design, we represent chemical entities not as physical test-tube solutions, but as discrete mathematical graphs and multidimensional vector spaces. This document provides the exact chemical foundation needed to build feature extractors, machine learning regressors, and quantum kernels.

---

## 2. Core Chemical Building Blocks

| Concept | Chemical Meaning | AI / ML Representation | Example |
| :--- | :--- | :--- | :--- |
| **Atom** | Fundamental chemical element (C, H, O, N, S, P, halogens). | Graph Node with atomic number, valence, and hybridization. | Carbon ($C, Z=6$), Oxygen ($O, Z=8$) |
| **Bond** | Covalent sharing of electron pairs (single, double, triple, aromatic). | Graph Edge with bond order type ($1.0, 2.0, 3.0, 1.5$). | $C-C$, $C=O$, $C\equiv N$, $C\because C$ |
| **Molecule** | Electrically neutral group of atoms held together by covalent bonds. | Attributed Molecular Graph $G = (V, E)$ or SMILES string. | Aspirin ($\text{C}_9\text{H}_8\text{O}_4$), Ethanol ($\text{C}_2\text{H}_6\text{O}$) |
| **Functional Group** | Specific cluster of atoms responsible for characteristic chemical reactions. | Subgraph pattern / SMARTS query. | Hydroxyl ($-\text{OH}$), Carboxylic Acid ($-\text{COOH}$) |

---

## 3. SMILES Notation (Simplified Molecular Input Line Entry System)
SMILES is a 1D ASCII string notation that encodes the 2D topology and stereochemistry of a molecule.

### Basic Syntax Rules:
1. **Atoms**: Represented by elemental symbols (e.g., `C`, `N`, `O`, `P`, `S`, `F`, `Cl`, `Br`, `I`). Hydrogen atoms are usually implicit.
2. **Bonds**:
   - Single bond: Implicit (e.g., `CC` = Ethane)
   - Double bond: `=` (e.g., `C=C` = Ethene)
   - Triple bond: `#` (e.g., `C#C` = Ethyne)
   - Aromatic bond: Lowercase letters (e.g., `c1ccccc1` = Benzene)
3. **Branches**: Enclosed in parentheses `( )` (e.g., `CC(=O)O` = Acetic Acid).
4. **Rings**: Numbered closures (e.g., `C1CCCCC1` = Cyclohexane).

### Canonical SMILES vs. Non-Canonical SMILES:
A single molecule can be written with multiple valid SMILES strings (e.g., Ethanol can be `CCO`, `OCC`, or `C(O)C`).  
**Canonicalization** (via RDKit) ensures that every unique molecule maps to exactly one standard deterministic SMILES string—crucial for eliminating duplicates in ML datasets.

---

## 4. Key Molecular Descriptors (ML Features)

These physicochemical properties describe the size, polarity, and flexibility of a molecule and serve as numerical features ($X$) for machine learning.

```
                    ┌────────────────────────┐
                    │ Molecular SMILES String│
                    └───────────┬────────────┘
                                │ (RDKit Parsing)
                                ▼
                    ┌────────────────────────┐
                    │    2D Molecular Graph  │
                    └───────────┬────────────┘
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Molecular Wt │         │    LogP      │         │     TPSA     │
│ (Size/Mass)  │         │(Lipophilicity│         │  (Polarity)  │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  HBD / HBA   │         │RotatableBonds│         │ Ring Count   │
│(H-Bond Count)│         │(Flexibility) │         │ (Rigidity)   │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                ▼
           ┌─────────────────────────────────────────┐
           │ Feature Vector: X = [MW, LogP, TPSA...] │
           └─────────────────────────────────────────┘
```

### 1. Molecular Weight (MW)
- **Definition**: Sum of atomic weights of all atoms in the molecule (measured in Daltons / $\text{g/mol}$).
- **ML Role**: Continuous numerical feature reflecting molecular size. Larger molecules usually have lower solubility and membrane permeability.

### 2. LogP (Partition Coefficient / Lipophilicity)
- **Definition**: Logarithm of the ratio of compound concentrations in octanol (fat-like) vs. water.
  $$\text{LogP} = \log_{10}\left(\frac{[\text{Solute}]_{\text{octanol}}}{[\text{Solute}]_{\text{water}}}\right)$$
- **Interpretation**:
  - $\text{LogP} > 0$: Hydrophobic / Lipophilic (prefers lipid membranes, low water solubility).
  - $\text{LogP} < 0$: Hydrophilic (prefers water, high water solubility).
- **ML Role**: Fundamental descriptor for predicting solubility ($\text{LogS}$) and passive cellular diffusion.

### 3. TPSA (Topological Polar Surface Area)
- **Definition**: Surface sum over all polar atoms (primarily Oxygen, Nitrogen, and attached Hydrogens) in $\text{Å}^2$.
- **Interpretation**: Measures how polar a molecule is. Molecules with $\text{TPSA} < 140\text{ Å}^2$ generally exhibit good cell membrane permeability; $\text{TPSA} < 90\text{ Å}^2$ is necessary to cross the Blood-Brain Barrier (BBB).

### 4. Hydrogen Bond Donors (HBD) & Acceptors (HBA)
- **HBD**: Number of heteroatoms with at least one hydrogen atom attached (typically $-\text{OH}$ and $-\text{NH}$).
- **HBA**: Number of electronegative atoms with lone pairs capable of accepting an H-bond (typically $\text{O}$ and $\text{N}$).
- **ML Role**: Governs binding affinity with target protein pockets and water solvation energy.

### 5. Rotatable Bonds & Ring Count
- **Rotatable Bonds**: Single, non-ring bonds attached to non-hydrogen atoms with free $360^\circ$ rotation. Measures conformational flexibility.
- **Ring Count**: Number of aromatic, heteroaromatic, and aliphatic rings. Imparts structural rigidity.

---

## 5. Pharmacokinetics & Lipinski's "Rule of Five" (Ro5)

For a candidate molecule to become an orally active drug, Christopher Lipinski formulated the **Rule of Five**:

| Rule Property | Oral Bioavailability Threshold | Reason |
| :--- | :--- | :--- |
| **Molecular Weight** | $\le 500\text{ Da}$ | Large molecules struggle to pass intestinal epithelial walls. |
| **Lipophilicity (LogP)** | $\le 5$ | Excessively greasy molecules get trapped in lipid bilayers. |
| **H-Bond Donors (HBD)** | $\le 5$ | Too many donors require high desolvation energy. |
| **H-Bond Acceptors (HBA)** | $\le 10$ | Excess acceptors hinder passive membrane permeation. |

> **Q-MolGen Integration**: We use Lipinski's Rule of 5 as an automated multi-objective penalty/scoring filter in our optimization pipeline.

---

## 6. Target Properties: Solubility, ADME & Bioactivity
- **Aqueous Solubility ($\text{LogS}$)**: Measured as $\log_{10}(\text{Solubility in mol/L})$. A drug must dissolve in aqueous body fluids to reach its biological target. (Target of the ESOL Delaney dataset).
- **ADME**: **A**bsorption (gut intake), **D**istribution (bloodstream delivery), **M**etabolism (liver transformation), and **E**xcretion (kidney clearance).
- **Toxicity**: Undesirable biological interference (e.g., hERG channel blockage causing cardiotoxicity, Ames mutagenicity).

---

## 7. Molecular Fingerprints (Circular / Morgan Fingerprints)
While physicochemical descriptors yield continuous scalars (e.g., $[180.15, 1.31, 63.6]$), **Morgan Circular Fingerprints** (Extended-Connectivity Fingerprints / ECFP) decompose a molecule into concentric circular atom neighborhoods up to radius $R$ (typically $R=2$, equivalent to ECFP4) and hash them into a fixed-length bit vector (e.g., 1024 or 2048 bits: `[0, 1, 0, 0, 1, ...]`).

- **Descriptors**: General bulk physicochemical profile.
- **Fingerprints**: Specific 2D substructural motif patterns.

In later phases, we will systematically benchmark both representations across classical and quantum models.
