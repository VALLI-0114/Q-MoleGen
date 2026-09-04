# Q-MolGen: Quantum-Enhanced Generative AI for De Novo Molecule Design
## Final Capstone Project Report & Comprehensive Research Thesis

---

### **Project Metadata**
* **Project Title**: Q-MolGen: Quantum-Enhanced Generative AI for De Novo Molecule Design
* **Project Type**: B.Tech Final-Year Capstone Project / Computational Cheminformatics & Quantum Machine Learning Research
* **Authors / Project Team**: Pravallika & Q-MolGen Project Team
* **Academic Discipline**: Computer Science & Engineering / Applied AI / Computational Cheminformatics
* **Implementation Architecture**: React (Vite) Single Page Application + Django REST Framework + RDKit Cheminformatics + Qiskit Quantum Machine Learning + Scikit-Learn Classical Baselines

---

## Executive Abstract
The discovery of novel therapeutic small molecules represents a search across an intractable chemical space estimated at over $10^{60}$ drug-like compounds. Traditional high-throughput wet-lab screening suffers from high attrition rates (>90%), multi-billion-dollar costs, and decade-long development cycles. 

**Q-MolGen** delivers an end-to-end, reproducible computational discovery and optimization platform that unites:
1. **RDKit Cheminformatics**: 18 continuous physicochemical descriptors and 1024-bit Morgan circular fingerprints.
2. **Classical Machine Learning**: Multi-model regression baselines for aqueous solubility prediction (Gradient Boosting achieving $R^2 = 0.8747$).
3. **Quantum Machine Learning (QML)**: 4-qubit Parameterized Quantum Circuits using $ZZ\text{FeatureMap}$ and Quantum Kernel Estimators ($K(x_i, x_j) = |\langle\Phi(x_i)|\Phi(x_j)\rangle|^2$) powering Quantum Support Vector Classifiers (QSVC).
4. **Quantum Chemistry (DFT) Surrogates**: Trained on QM9 to predict electronic HOMO-LUMO energy gaps and dipole moments.
5. **De Novo Generative AI & Multi-Objective Pareto Optimization**: Bioisosteric chemical grammar transformations coupled with non-dominated Pareto frontier sorting across solubility ($\text{LogS}$), drug-likeness ($\text{QED}$), synthetic accessibility ($\text{SA}$), and quantum fidelity.
6. **Explainable AI (XAI)**: Atom-level substructure attribution maps identifying key solubilizing and lipophilic functional groups.
7. **Full-Stack Role-Based Platform**: A React 18 interface with dedicated dashboards for Administrators, Researchers, and Students, backed by Django REST APIs.

Across automated empirical testing, the generative pipeline achieves **100% chemical validity**, **100% uniqueness**, **86.0% novelty** against training libraries, and **0.832 internal structural diversity**.

---

## Chapter 1: Introduction & Research Motivation

### 1.1 The Molecular Search Space Paradox
The primary challenge of drug discovery is the discrete, combinatorial nature of chemical graph space. Minor atomic modifications (e.g., adding a single fluorine or hydroxyl moiety) can drastically alter pharmacokinetics, metabolic stability, and target affinity.

### 1.2 Research Questions
* **RQ1**: How do continuous physicochemical descriptors compare against high-dimensional circular fingerprints in predicting bulk aqueous solubility?
  * *Empirical Finding*: Continuous physicochemical descriptors (LogP, MW, TPSA, Molar Refractivity) achieve significantly higher regression accuracy ($R^2 = 0.875$) than 1024-bit Morgan circular fingerprints ($R^2 = 0.677 - 0.756$).
* **RQ2**: Can low-qubit quantum kernels ($N=4$ qubits) achieve competitive classification performance against classical linear and kernel SVMs on reduced molecular feature spaces?
  * *Empirical Finding*: QSVC on a 4-qubit $ZZ\text{FeatureMap}$ achieves $75.0\%$ test accuracy, competitive with Classical RBF SVM ($76.7\%$), while exhibiting higher recall ($0.867$) on high-solubility candidates.
* **RQ3**: Does a multi-objective Pareto optimization loop effectively balance solubility and drug-likeness without collapsing candidate diversity?
  * *Empirical Finding*: Pareto non-dominated sorting identifies $18.0\% - 30.0\%$ optimal candidates with a mean structural diversity of $0.832$ and zero synthetic collapse.

### 1.3 Strict Academic Terminology & Disclaimers
In compliance with scientific integrity, Q-MolGen enforces:
- **Mandatory Terms**: `candidate molecules`, `computational molecular design`, `predicted properties`, `candidate prioritization`.
- **Prohibited Claims**: No claims of approved drugs, clinical safety, or unproven quantum supremacy.

---

## Chapter 2: Theoretical & Mathematical Foundations

### 2.1 Molecular Physicochemical Descriptors
- **Wildman-Crippen Lipophilicity ($\text{LogP}$)**: $\text{LogP} = \sum_i a_i$
- **Topological Polar Surface Area ($\text{TPSA}$)**: Sum of polar oxygen/nitrogen surfaces.
- **Lipinski's Rule of 5 (Ro5)**: $\text{MW} \le 500\,\text{Da}$, $\text{LogP} \le 5.0$, $\text{HBD} \le 5$, $\text{HBA} \le 10$.
- **Quantitative Estimate of Drug-Likeness ($\text{QED}$)**:
  $$\text{QED} = \exp\left( \frac{1}{\sum w_i} \sum_{i=1}^k w_i \ln d_i \right)$$

### 2.2 Quantum Machine Learning & Quantum Kernels
- **Quantum Feature Map ($ZZ\text{FeatureMap}$)**:
  $$|\Phi(\mathbf{x})\rangle = \mathcal{U}_{\Phi}(\mathbf{x}) |0\rangle^{\otimes n} = \left( \prod_{i=1}^n H_i \right) \exp\left( i \sum_{i=1}^n x_i Z_i + i \sum_{i < j} (\pi - x_i)(\pi - x_j) Z_i Z_j \right) \left( \prod_{i=1}^n H_i \right) |0\rangle^{\otimes n}$$
- **Quantum Kernel Matrix**:
  $$K_{ij} = K(\mathbf{x}_i, \mathbf{x}_j) = \big| \langle \Phi(\mathbf{x}_i) \mid \Phi(\mathbf{x}_j) \rangle \big|^2 = \text{Tr}\left( \rho(\mathbf{x}_i) \rho(\mathbf{x}_j) \right)$$
- **QSVC Dual Optimization Problem**:
  $$\max_{\alpha} \sum_{i=1}^N \alpha_i - \frac{1}{2} \sum_{i=1}^N \sum_{j=1}^N \alpha_i \alpha_j y_i y_j K(\mathbf{x}_i, \mathbf{x}_j) \quad \text{s.t.} \quad 0 \le \alpha_i \le C, \; \sum_{i=1}^N \alpha_i y_i = 0$$

### 2.3 Pareto Non-Dominated Sorting & Desirability Scoring
- **Dominance**: $A \succ B \iff \forall k, f_k(A) \ge f_k(B) \land \exists j, f_j(A) > f_j(B)$
- **Desirability Function**:
  $$\text{Composite Score} = 0.35 \cdot \widetilde{f}_{\text{sol}} + 0.30 \cdot f_{\text{qed}} + 0.15 \cdot f_{\text{qsvc}} + 0.10 \cdot (1 - \widetilde{f}_{\text{sa}}) + 10 \cdot \mathbb{I}_{\text{Ro5}}$$

---

## Chapter 3: System Architecture & End-to-End Pipeline

```
                                  [ USER INTERACTION ]
                                React 18 Single Page App
             (Role Switcher: 🔐 Admin | 🔬 Researcher | 👤 Student)
                                         │
                                         ▼
                            [ DJANGO REST FRAMEWORK API ]
                    (CORS Enabled, JSON Endpoints, RBAC Controls)
                                         │
                                         ▼
                   [ DE NOVO MOLECULAR GENERATION ENGINE ]
                     (Bioisosteric Chemical Transformations)
                                         │
                                         ▼
                       [ RDKIT CHEMINFORMATICS PIPELINE ]
                     (SMILES Sanitization, Descriptors, 2D SVG)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [ CLASSICAL ML BASELINES ]                    [ QUANTUM MACHINE LEARNING ]
   Gradient Boosting / Random Forest              Qiskit ZZFeatureMap (4-Qubit PQC)
       (Bulk LogS Solubility)                     (Quantum Kernel Matrix & QSVC)
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                         [ QM9 DFT SURROGATE REGRESSOR ]
                         (HOMO-LUMO Energy Gap & Dipole)
                                         │
                                         ▼
                     [ MULTI-OBJECTIVE PARETO OPTIMIZER ]
                  (Non-Dominated Sorting & Desirability Rank)
                                         │
                                         ▼
                      [ EXPLAINABLE AI ATOM ATTRIBUTION ]
                      (Crippen LogP / Gasteiger Partial Charges)
```

---

## Chapter 4: Empirical Experimental Results & Leaderboards

### 4.1 Classical ML Aqueous Solubility ($\text{LogS}$) Benchmark on Delaney ESOL ($N=1,128$)

| Model Architecture | Input Features | Test $R^2$ Score | Test RMSE | Test MAE | Training Time |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Gradient Boosting Regressor** | 11 Descriptors | **0.8747** | **0.739** | **0.547** | 0.42 s |
| **Random Forest Regressor** | 11 Descriptors | **0.8701** | **0.753** | **0.544** | 0.88 s |
| **Support Vector Regression (SVR - RBF)** | 11 Scaled Descriptors | **0.8653** | **0.767** | **0.547** | 0.08 s |
| **Ridge Regression ($\alpha=1.0$)** | 11 Scaled Descriptors | **0.7749** | **0.992** | **0.769** | 0.01 s |
| **Linear Regression (OLS)** | 11 Descriptors | **0.7742** | **0.994** | **0.770** | 0.01 s |
| **Morgan Fingerprint Random Forest** | 1024-Bit BitVect ($r=2$) | **0.7562** | **1.034** | **0.781** | 1.15 s |
| **Morgan Fingerprint Ridge** | 1024-Bit BitVect ($r=2$) | **0.6773** | **1.190** | **0.912** | 0.12 s |

### 4.2 Classical SVM vs. Quantum Support Vector Classifier (QSVC) on 4-Qubit Subspace

| Classifier Model | Feature Space / Kernel | Test Accuracy | Precision | Recall | F1-Score | Inference Latency |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Classical RBF SVM** | 4 Descriptors (RBF $\gamma=\text{scale}$) | **76.67%** | 0.774 | 0.800 | **0.787** | 0.002 s |
| **Qiskit QSVC** | 4 Qubits ($ZZ\text{FeatureMap}$) | **75.00%** | 0.703 | **0.867** | **0.776** | 0.418 s |
| **Classical Linear SVM** | 4 Descriptors (Linear Dot Product) | **73.33%** | 0.710 | 0.733 | **0.721** | 0.001 s |
| **Random Forest Classifier** | 4 Descriptors ($N_{\text{est}}=100$) | **71.67%** | 0.700 | 0.700 | **0.700** | 0.025 s |

### 4.3 QM9 DFT Electronic Property Surrogate Models ($N=500$)

| Quantum Target Property | Model Architecture | Test $R^2$ Score | Test MAE | Test RMSE |
| :--- | :--- | :---: | :---: | :---: |
| **HOMO-LUMO Gap ($\Delta E$)** | Gradient Boosting (8 Descriptors) | **0.782** | **0.312 eV** | **0.421 eV** |
| **Dipole Moment ($\mu$)** | Gradient Boosting (8 Descriptors) | **0.694** | **0.485 Debye**| **0.638 Debye** |

### 4.4 De Novo Generative Campaign Performance ($N=50$)

| Generation Metric | Result | Benchmark Significance |
| :--- | :---: | :--- |
| **Chemical Validity Rate** | **$100.0\%$** | All candidates satisfy valence constraints |
| **Batch Uniqueness Rate** | **$100.0\%$** | Zero duplicate structures generated |
| **Novelty vs Delaney ESOL** | **$86.0\%$** | Genuine de novo scaffold discoveries |
| **Internal Structural Diversity** | **$0.832$** | High chemical diversity across population |
| **Pareto-Optimal Yield** | **$18.0\%$** | Multi-objective optimal candidate pool |
| **Mean Desirability Score** | **$59.5$** | Top prioritized candidate: **$78.1 / 100$** |

---

## Chapter 5: Complete Publication Figures Catalog

All 15 figures are generated in `docs/figures/`:
1. `01_solubility_distribution.png`: Delaney ESOL LogS distribution histogram and KDE.
2. `02_mw_distribution.png`: Molecular weight distribution vs Ro5 boundary.
3. `03_tpsa_distribution.png`: Topological Polar Surface Area distribution.
4. `04_correlation_heatmap.png`: Physicochemical property Pearson correlation matrix.
5. `05_outlier_boxplots.png`: Outlier detection across all 11 continuous features.
6. `06_pred_vs_actual.png`: Parity plot for Gradient Boosting ($R^2=0.8747$).
7. `07_residuals_distribution.png`: Normal distribution of regression residuals.
8. `08_feature_importance.png`: Gini impurity feature ranking (LogP dominance).
9. `09_permutation_importance.png`: Permutation feature importance analysis.
10. `10_quantum_circuit_diagram.png`: 4-qubit $ZZ\text{FeatureMap}$ PQC architecture.
11. `11_quantum_kernel_matrix_heatmap.png`: Inner product Hilbert space kernel matrix.
12. `12_classical_vs_quantum_metrics.png`: Classical vs Quantum benchmark bar charts.
13. `13_pareto_frontier.png`: Solubility vs QED Pareto frontier scatter plot.
14. `14_property_tradeoffs.png`: Multi-objective property trade-offs and boxplots.
15. `15_substructure_attribution.png`: Atom-resolved Explainable AI attribution charts.

---

## Chapter 6: Viva Voce Defense Q&A Preparation

1. **Q: Why do continuous descriptors outperform Morgan fingerprints for solubility regression?**
   * *A*: Aqueous solubility ($\text{LogS}$) is a thermodynamic bulk property governed by lipophilicity ($\text{LogP}$), molecular mass ($\text{MW}$), polar surface area ($\text{TPSA}$), and crystal lattice packing ($\text{MR}$). Continuous descriptors directly capture these thermodynamic scalars, whereas Morgan circular fingerprints encode discrete substructural presence, suffering from high dimensionality and sparsity on small datasets ($N \approx 1,128$).

2. **Q: What is the mathematical meaning of the Quantum Kernel $K(\mathbf{x}, \mathbf{z})$?**
   * *A*: The quantum feature map $\mathcal{U}_\Phi(\mathbf{x})$ embeds a classical vector $\mathbf{x} \in \mathbb{R}^d$ into a quantum state $|\Phi(\mathbf{x})\rangle$ in a $2^n$-dimensional Hilbert space. The quantum kernel computes the transition amplitude squared: $K(\mathbf{x}, \mathbf{z}) = |\langle\Phi(\mathbf{x}) \mid \Phi(\mathbf{z})\rangle|^2$. This measures the fidelity/overlap between two molecular quantum states.

3. **Q: How does Pareto optimization prevent pathological molecular collapse?**
   * *A*: Single-objective optimization causes greedy algorithms to exploit extreme edge cases (e.g., optimizing only solubility generates simple alcohols like methanol or polyols; optimizing only QED generates bulky aromatics). Non-dominated Pareto sorting enforces simultaneous trade-offs across competing objectives ($\text{LogS}$, $\text{QED}$, $\text{SA}$, and Quantum Confidence) so that no candidate is prioritized unless it represents an optimal multi-dimensional compromise.

---

## Chapter 7: Conclusion & Future Scope

### 7.1 Conclusion
The **Q-MolGen** platform successfully demonstrates a complete, reproducible computational molecular design paradigm uniting classical cheminformatics, machine learning regressors, parameterized quantum circuits, and multi-objective Pareto optimization. The full-stack platform provides accessible, role-governed web interfaces for students, scientists, and administrators.

### 7.2 Future Scope
1. **NISQ Hardware Execution**: Deploying quantum kernel evaluation onto physical IBM Quantum superconducting processors via Qiskit Runtime.
2. **3D Conformer & Docking**: Coupling de novo candidate SMILES with 3D conformer generation and AutoDock Vina binding energy scoring.
3. **Equivariant Graph Neural Networks**: Integrating SE(3)-equivariant GNNs for atomistic coordinate modeling.
