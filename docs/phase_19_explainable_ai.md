# Q-MolGen — Phase 19: Explainable AI (XAI) & Atom-Level Molecular Substructure Attribution

## 1. Motivation & Scientific Significance
In computational drug discovery, machine learning models that function as "black boxes" face skepticism from medicinal and synthetic chemists. To establish trust, models must provide **interpretable chemical rationales**:
1. *Why* was a generated molecule predicted to have high aqueous solubility?
2. *Which* specific functional groups or atomic centers drive favorable or unfavorable ADMET profiles?
3. *How* can synthetic chemists modify specific atoms to fine-tune lipophilicity while retaining target binding affinity?

Phase 19 provides atom-resolved substructure attribution mapping Wildman-Crippen atomic lipophilicity contributions, molar refractivity polarizability, and Gasteiger partial atomic charges directly onto molecular vector diagrams.

---

## 2. Mathematical & Algorithmic Formulation

### 2.1. Wildman-Crippen Atomic LogP Decomposition
The continuous molecular $\text{LogP}$ is decomposed as the linear sum of localized atomic fragment contributions $a_i$:

$$\text{LogP}(M) = \sum_{i=1}^{N_{\text{atoms}}} a_i(T_i)$$

Where $T_i$ is the structural environment classification of atom $i$ (hybridization, aromaticity, neighboring heteroatoms, and formal charge).

- **Negative $a_i$ values**: Indicate polar, hydrophilic, hydrogen-bonding centers (e.g., carboxyl oxygen $-0.419$, hydroxyl oxygen $-0.289$, phenolic oxygen $-0.153$) that increase aqueous solubility.
- **Positive $a_i$ values**: Indicate hydrophobic aromatic/aliphatic carbon centers ($+0.144$ to $+0.544$) that increase lipophilicity and membrane permeability.

### 2.2. Gasteiger-Marsili Partial Atomic Charges
Iteratively computes partial charges $q_i$ via electronegativity equalization over $\sigma$-bonds:

$$q_i^{(k+1)} = q_i^{(k)} + \sum_{j \in \text{neighbors}(i)} \frac{\chi_j - \chi_i}{\chi_i + \chi_j + 2\chi_0} \cdot \left(\frac{1}{2}\right)^k$$

Partial charges highlight electron-rich nucleophilic centers ($\delta^-$ on carbonyl/hydroxyl oxygens $\approx -0.42$) and electron-deficient electrophilic carbons ($\delta^+ \approx +0.34$).

---

## 3. Empirical Case Studies & Substructure Attribution

### Case Study 1: Salicylic Acid Derivative (`QMOL-001`) — High Aqueous Solubility ($\text{LogS} = -0.63$)
- **Key Solubilizing Drivers**: Carboxylic acid group ($\text{C10}=\text{O11}-\text{O12}\text{H}$) and ortho-hydroxyl oxygen ($\text{O3}\text{H}$).
- **Net Contribution**: Hydrophilic atom contributions overcome the aromatic benzene ring core, yielding rapid aqueous dissolution.

### Case Study 2: Biphenyl Core — Hydrophobic Scaffold ($\text{LogS} = -3.85$)
- **Key Insoluble Drivers**: Uniform array of $12$ aromatic $sp^2$ carbons ($a_i \approx +0.158$) with zero hydrogen-bond donors or acceptors.
- **Net Contribution**: High cavity formation energy in water; prone to precipitation and poor oral absorption.

---

## 4. Visual Substructure Maps & Publication Artifacts
- **Figure 15**: `docs/figures/15_substructure_attribution.png`  
  Atom-by-atom attribution bar charts comparing high-solubility (Salicylic acid) vs hydrophobic (Biphenyl) candidate molecules.
- **Interactive SVG Vector Rendering**: Supported dynamically via `generate_atom_attribution_svg()` for UI integration.
