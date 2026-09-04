# Q-MolGen — Phase 3: Website-First UI/UX & Architecture Blueprint

## 1. Design Philosophy: AI + Quantum Scientific Research Platform
The **Q-MolGen** interface is engineered as an interactive scientific workstation rather than a generic CRUD portal. It blends modern dark-mode glassmorphism, precise data density, high-contrast scientific typography, real-time chemical graph rendering, and responsive charting.

---

## 2. Design System & Visual Tokens

```
                               ┌─────────────────────────┐
                               │ Q-MolGen Design System  │
                               └────────────┬────────────┘
                                            │
        ┌────────────────────────┬──────────┴──────────┬────────────────────────┐
        ▼                        ▼                     ▼                        ▼
┌────────────────┐      ┌────────────────┐    ┌─────────────────┐      ┌────────────────┐
│ Color Palette  │      │   Typography   │    │ UI Components   │      │ Micro-Inter-   │
│ • Deep Navy BG │      │ • Outfit / Inter│    │ • Glass Cards   │      │   actions      │
│ • Cyan Glow    │      │ • Fira Code    │    │ • Data Badges   │      │ • Glow Hovers  │
│ • Quantum Purp │      │   (for SMILES) │    │ • Molecule Grid │      │ • Live Progress│
└────────────────┘      └────────────────┘    └─────────────────┘      └────────────────┘
```

### Color Palette (HSL & Hex)
- **Background Primary**: `#0B0F19` (Deep Obsidian / Space Navy)
- **Surface / Card Background**: `rgba(17, 24, 39, 0.75)` with `backdrop-filter: blur(12px)`
- **Border & Glass Divider**: `rgba(255, 255, 255, 0.08)`
- **Accent Primary (Quantum Cyan)**: `#06B6D4` / `#22D3EE` (Interactive buttons, active states)
- **Accent Secondary (Quantum Purple)**: `#8B5CF6` / `#A78BFA` (Quantum circuit indicators, score badges)
- **Accent Tertiary (Bio-Emerald)**: `#10B981` (High solubility / Ro5 compliant indicator)
- **Warning & Attrition (Amber/Rose)**: `#F59E0B` / `#F43F5E` (Ro5 violations, synthetic penalties)
- **Text Hierarchy**: Primary `#F9FAFB`, Secondary `#9CA3AF`, Muted `#6B7280`, Code `#38BDF8`.

### Typography
- **Headings & Brand**: `Outfit`, sans-serif (Geometric, modern authority).
- **Body & Controls**: `Inter`, sans-serif (High legibility at small sizes).
- **Chemical SMILES & Code**: `Fira Code` / `JetBrains Mono` (Monospaced with glyph alignment).

---

## 3. Detailed 10-Page Architecture & Component Blueprint

```
                     ┌────────────────────────────────────────────────────────┐
                     │               Top Scientific Navigation Bar            │
                     │  [Logo] Q-MolGen | Generate | Results | Models | Quantum│
                     └───────────────────────────┬────────────────────────────┘
                                                 │
   ┌───────────────────┬───────────────────┬─────┴─────────────┬───────────────────┐
   ▼                   ▼                   ▼                   ▼                   ▼
[Page 1: Home]   [Page 2: Generator] [Page 4: Results]   [Page 6: Compare]   [Page 8: Analytics]
 Hero, QML Intro  Target Constraints  Ranked Cards, 2D    Classical vs QML    Distributions, Ro5
   │                   │                   │                   │                   │
   ▼                   ▼                   ▼                   ▼                   ▼
[Page 10: About] [Page 3: Progress]  [Page 5: Details]   [Page 7: Quantum]   [Page 9: Library]
 Methodology      Live Stream / QML   Large 2D, Descriptors Circuit Maps, Qubits Filterable Table
```

---

### Page 1 — Home (Platform Overview & Scientific Gateway)
- **Hero Section**: Dynamic particle/quantum state background with headline: *"Quantum-Enhanced Generative AI for De Novo Molecule Design"*.
- **Live Metric Counter**: Benchmarked molecules, evaluated quantum kernels, average validity rate.
- **Workflow Pipeline**: 4-stage interactive cards (1. Exploration $\rightarrow$ 2. RDKit Extraction $\rightarrow$ 3. Hybrid ML/QML Scoring $\rightarrow$ 4. Multi-Objective Optimization).
- **Call-to-Action (CTA)**: Prominent `Launch Molecular Generator` button with glowing cyan hover state.
- **Mandatory Research Disclaimer Alert**: Transparent banner emphasizing computational candidate prioritization and the necessity of wet-lab validation.

---

### Page 2 — Molecule Generator (Constraint Specification Form)
- **Target Objective Selectors**:
  - Solubility Optimization: High ($\text{LogS} > -2$), Moderate, Custom Range.
  - Lipophilicity ($\text{LogP}$ range sliders: e.g., $1.0 - 3.5$).
  - Molecular Weight Range: Min/Max inputs (Default: $150 - 450\text{ Da}$).
  - TPSA Boundaries: Polar surface area target ($40 - 120\text{ Å}^2$).
  - Drug-likeness: Enforce Strict Lipinski Rule of 5 (Yes/No toggle).
- **Batch Size Selector**: Segmented pill buttons (`10`, `25`, `50`, `100` candidate molecules).
- **Evaluation Engine**: Radio selection: `Classical ML Baselines`, `Quantum Kernel (QSVC)`, `Hybrid Classical-Quantum Consensus`.
- **Optimization Strategy**: `Balanced`, `Solubility-Steered`, `Drug-Likeness Steered`.
- **Action**: Glowing `Generate Candidates` button with instant form validation.

---

### Page 3 — Generation Progress (Real-Time Pipeline Monitor)
- **Circular & Linear Progress Trackers**: Animated percentage bar showing current pipeline stage.
- **Step-by-Step Status Feed**:
  1. *Generative Sampling*: Sampling candidate SMILES tokens.
  2. *RDKit Validation*: Parsing valency, aromaticity, and chemical validity.
  3. *Deduplication & Novelty Check*: Cross-referencing Delaney ESOL and QM9 baseline libraries.
  4. *Classical & Quantum Inference*: Computing property predictions and quantum kernel evaluations.
  5. *Multi-Objective Optimization*: Pareto scoring and ranking.
- **Live Counter Metric Badges**: `Total Sampled`, `Valid Molecules`, `Invalid Filtered`, `Unique Candidates`.

---

### Page 4 — Results (Ranked Candidate Gallery)
- **Interactive Control Bar**: Sort by `Final Score`, `Predicted Solubility`, `Quantum Score`, `Molecular Weight`.
- **Candidate Card Grid**: Responsive $3\times N$ or $4\times N$ grid of candidate cards featuring:
  - Top Badge: `#Rank 1`, `#Rank 2`, with composite fitness score (e.g., `Score: 94.2/100`).
  - 2D Molecular Diagram: High-resolution SVG/PNG render generated dynamically by RDKit.
  - Canonical SMILES string with 1-click clipboard copy button.
  - Property Pill Badges: `MW: 245.3 Da`, `LogP: 2.14`, `TPSA: 58.2 Å²`, `HBD: 1`, `HBA: 3`.
  - Predictions: `Pred LogS: -2.31`, `QML Score: 0.88`.
  - Actions: `View Full Details`, `Add to Compare`.

---

### Page 5 — Molecule Details (Deep Chemical & Model Inspection)
- **Left Column**: High-resolution 2D chemical structure with atom/bond highlighting and SVG zoom modal.
- **Middle Column**:
  - Full physicochemical profile table (MW, LogP, TPSA, HBD, HBA, RotBonds, Rings, Heavy Atoms).
  - Lipinski Rule of 5 Compliance Scorecard (Green badges for pass, Amber flags for violations).
- **Right Column**:
  - Classical Model Breakdown (Random Forest, SVR, Ridge predictions).
  - Quantum Support Vector Classification (QSVC) state output & kernel distance.
  - Multi-Objective Pareto weight breakdown chart.
- **Safety Warning Banner**: Highlighted callout reiterating computational candidate status.

---

### Page 6 — Model Comparison (Classical vs. Quantum vs. Hybrid Benchmark)
- **Metric Scorecard Grid**: MAE, RMSE, $R^2$, Accuracy, Precision, Recall, F1-Score, and ROC-AUC.
- **Interactive Visualizations (Chart.js)**:
  - Multi-bar chart: Training Time vs. Inference Latency across models.
  - Regression Scatter Plot: Actual vs. Predicted Solubility with unity diagonal line.
  - Radar Chart: Multi-metric capability comparison across Classical, Quantum, and Hybrid approaches.
- **Transparency Policy**: Strict labelling of actual simulated outputs vs. theoretical bounds.

---

### Page 7 — Quantum Analysis (Quantum State & Circuit Diagnostic)
- **Quantum Execution Specs**:
  - Number of Active Qubits ($N=4$ to $8$).
  - Quantum Feature Map Architecture (e.g., $ZZ\text{FeatureMap}$, Entanglement: Linear/Full).
  - Quantum Kernel Depth & Gate Counts (Hadamard, Phase $R_Z$, CNOT gates).
  - Execution Backend: `AerSimulator (Statevector/Qasm)` vs. shot count ($1024\text{ shots}$).
- **Quantum Circuit Diagram**: Interactive visual representation of the parameterized quantum circuit (PQC).
- **Hilbert Space Feature Mapping**: Explanation diagram showing non-linear projection of scaled molecular descriptors into $2^N$-dimensional quantum state space.

---

### Page 8 — Analytics Dashboard (Global Campaign Metrics)
- **Key Summary KPI Cards**:
  - Total Candidates Generated
  - Validity Rate ($\%$)
  - Novelty Rate ($\%$)
  - Average Predicted Solubility ($\text{LogS}$)
  - Best Optimization Score
- **Interactive Chart Grid**:
  - Chart 1: Solubility Distribution Histogram (Kernel Density Estimate).
  - Chart 2: Property Correlation Scatter (LogP vs. Molecular Weight).
  - Chart 3: TPSA vs. Lipinski Ro5 Compliance breakdown.
  - Chart 4: Optimization convergence curve over generations.

---

### Page 9 — Candidate Library (Searchable Chemical Repository)
- **Universal Search Bar**: Search by SMILES substructure, formula, or Candidate ID.
- **Multi-Filter Sidebar**: Range sliders for MW, LogP, TPSA, and minimum composite score.
- **Interactive Data Table**:
  - Columns: `Rank`, `Structure Thumbnail`, `SMILES`, `MW`, `LogP`, `TPSA`, `Pred LogS`, `QML Score`, `Final Score`, `Actions`.
  - Feature: Multi-select checkboxes for batch comparison and CSV / SDF export.

---

### Page 10 — About & Methodology (Research Documentation & Thesis Alignment)
- Comprehensive thesis overview:
  - Problem Formulation & Mathematical basis.
  - Dataset Provenance (Delaney ESOL & QM9 subsets).
  - RDKit Molecular Graph Processing algorithms.
  - Quantum Computing Foundation (Qubits, Superposition, Entanglement, Quantum Kernels).
  - Generative AI pipeline and multi-objective Pareto optimization.
  - Rigorous acknowledgment of limitations and future hardware scaling.
