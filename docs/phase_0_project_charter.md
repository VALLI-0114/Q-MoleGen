# Q-MolGen — Phase 0: Project Charter & Research Foundation

## 1. Executive Summary
**Project Title**: Q-MolGen: Quantum-Enhanced Generative AI for De Novo Molecule Design  
**Project Category**: B.Tech Final-Year Capstone Project / Applied Research in Computational Cheminformatics & Quantum Machine Learning  
**Core Domain**: Computational Molecular Design, Cheminformatics (RDKit), Machine Learning, Quantum Machine Learning (Qiskit/Pennylane), Full-Stack Web Deployment (Django).

---

## 2. Problem Statement
The discovery and optimization of novel bioactive molecules (*de novo* molecular design) represents an enormous search problem across a theoretical chemical space estimated to exceed $10^{60}$ synthetically feasible drug-like compounds. Traditional wet-lab high-throughput screening (HTS) and iterative trial-and-error synthesis are:
1. **Cost-Prohibitive**: Average drug discovery pipelines require billions of dollars.
2. **Time-Consuming**: 10–15 years from target validation to lead optimization.
3. **High Attrition Rate**: Over 90% of candidate leads fail in later stages due to poor pharmacokinetics (ADMET), low solubility, or synthetic intractability.

---

## 3. Motivation
* **Computational Efficiency**: Machine learning algorithms can learn chemical probability distributions and property landscapes to screen and propose candidate structures in seconds.
* **Complex Quantum Molecular States**: Molecular properties (e.g., electronic ground states, orbital energies, solubility interactions) are fundamentally governed by quantum mechanical interactions. Classical models approximate these via empirical descriptors, whereas Quantum Machine Learning (QML) constructs high-dimensional Hilbert spaces using quantum feature maps and quantum kernels.
* **Holistic Candidate Prioritization**: There is a critical need for an end-to-end, reproducible software platform that allows researchers to generate candidate SMILES, evaluate their classical and quantum descriptors, score multi-objective fitness, and visually inspect candidates through an interactive web interface.

---

## 4. Why Molecular Discovery Is Difficult & How AI Helps
1. **Discrete & Combinatorial Chemical Space**: Molecules are discrete graphs of atoms and bonds. Small perturbations in structure (activity cliffs) drastically alter physicochemical properties.
2. **Generative AI Contribution**: Autoregressive models, Variational Autoencoders (VAEs), and Sequence Transformers learn the grammar of valid chemical representations (SMILES/SELFIES) and sample candidates directed toward targeted property profiles.
3. **Quantum Machine Learning Contribution**: Parameterized quantum circuits (PQCs), Quantum Kernel Estimators (QKE), and Quantum Support Vector Classifiers (QSVC) map non-linear molecular features into quantum state representations, offering an exploratory paradigm for molecular classification and property mapping.

---

## 5. Project Objectives
1. **Data Preprocessing & Cheminformatics Engine**: Implement automated RDKit pipelines to parse SMILES, compute physicochemical descriptors (MW, LogP, TPSA, HBD, HBA, Rotatable Bonds), and compute Morgan circular fingerprints.
2. **Classical Machine Learning Baselines**: Develop and benchmark regression and classification models (Linear Regression, Random Forest, SVR, Gradient Boosting) for molecular property prediction (e.g., ESOL aqueous solubility).
3. **Quantum Machine Learning Exploration**: Implement simulator-based quantum feature maps (ZZFeatureMap/AngleEmbedding) and quantum kernel methods (QSVC) to evaluate molecular property classification under controlled qubit constraints.
4. **De Novo Molecular Generation**: Build a generative pipeline capable of producing chemically valid, novel, and diverse molecular SMILES satisfying targeted constraints.
5. **Multi-Objective Optimization**: Construct a weighted scoring function balancing solubility, drug-likeness (Lipinski's Rule of 5), and structural validity.
6. **Full-Stack Research Platform**: Deliver a responsive Django-based web interface featuring real-time molecular 2D rendering, interactive candidate comparison, model benchmarking charts, and searchable candidate libraries.

---

## 6. Project Scope & Research Questions
### In Scope:
* Small-to-medium organic molecules (MW < 500 Da) suitable for oral bioavailability.
* Benchmarking on established open-source datasets (Delaney ESOL dataset, followed by QM9 subsets).
* Noiseless and shot-based quantum circuit simulation on local classical hardware (Qiskit Aer / Pennylane default.qubit).
* Automated verification of validity, uniqueness, novelty, and synthetic feasibility metrics.

### Research Questions:
1. *RQ1*: How do classical descriptor-based regressors compare against circular fingerprint-based models in predicting molecular aqueous solubility?
2. *RQ2*: Can low-qubit quantum kernels (e.g., 4-to-8 qubits) achieve competitive classification performance against classical linear and kernel SVMs on reduced molecular feature subsets?
3. *RQ3*: Does a multi-objective optimization loop effectively steer generated candidate molecules toward high drug-likeness without collapsing sample diversity?

---

## 7. Strict Research Terminology & Disclaimers
In all academic reporting, UI displays, and thesis documentation, the following strict guidelines must be observed:

* **Strictly Prohibited Claims**:
  - We do NOT claim to have discovered clinically validated or approved drugs.
  - We do NOT claim that generated molecules are safe, non-toxic, or effective medicines.
  - We do NOT claim computational quantum supremacy or advantage unless rigorously proven by reproducible benchmarks.
  - We do NOT claim that computational predictions replace physical in vitro / in vivo laboratory trials.

* **Mandatory Professional Terminology**:
  - `Generated molecular candidates` / `Candidate molecules`
  - `Computational molecular design`
  - `Predicted physicochemical properties`
  - `Candidate prioritization and filtering`
  - `Drug-like property profile`

---

## 8. Limitations & Future Scope
* **Current Limitations**: Simulated quantum circuits are computationally intensive beyond 10–12 qubits on standard PCs; small dataset sizes can introduce sampling bias; 2D SMILES representations omit 3D conformational docking dynamics.
* **Future Scope**: Integration with 3D conformer generation, protein-ligand docking (AutoDock Vina), execution on physical NISQ quantum hardware (IBM Quantum Platform), and Graph Neural Networks (GNNs / SE(3)-equivariant networks).
