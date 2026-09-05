# ⚛️ Q-MoleGen: Quantum-Enhanced Molecular Generation & Property Discovery

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0%2B-092E20.svg?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.0%2B-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0%2B-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Qiskit](https://img.shields.io/badge/Qiskit-2.0%2B-6929C4.svg?logo=qiskit&logoColor=white)](https://qiskit.org/)
[![RDKit](https://img.shields.io/badge/RDKit-Cheminformatics-388E3C.svg)](https://www.rdkit.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

**Q-MoleGen** is an end-to-end, hybrid classical-quantum computational drug design and molecular property optimization platform. It bridges generative AI, high-dimensional cheminformatics, classical ensemble regressors, and parameterized Quantum Support Vector Classifiers (QSVC) with quantum kernel circuits (executed via Qiskit 2.x) to accelerate *in silico* lead candidate discovery, validation, and multi-objective Pareto ranking.

---

## 🌟 Key Features

- 🧪 **Generative De Novo Molecular Design**: Automated SMILES generation, RDKit chemical sanity filtering, Morgan fingerprint (ECFP4) encoding, and 2D/3D descriptor extraction (MW, LogP, TPSA, HBD, HBA, RotBonds).
- ⚡ **Classical Machine Learning Regressors & Classifiers**: Gradient Boosting (**94.3% accuracy, 0.977 ROC-AUC**), Random Forest, RBF SVM, Linear SVM, and Logistic Regression benchmarked against Delaney ESOL physical chemistry data.
- 🔬 **Quantum Kernel Machine Learning (QSVC)**: Parameterized 4-qubit `ZZFeatureMap` ansatz circuits with 19-gate depth executing in a 16-dimensional Hilbert state space via Qiskit simulators to compute quantum fidelity kernels.
- 🎯 **Multi-Objective Pareto Optimization**: Dynamic trade-off solver simultaneously evaluating Delaney Aqueous Solubility (LogS), QED Drug-Likeness, and SAS Synthetic Accessibility.
- 📊 **Real-Time Experiment Analytics**: Interactive histograms, Lipinski Rule of Five compliance doughnut charts, optimization progress trackers, and candidate property comparisons.
- 💻 **Modern Light Theme Web Interface**: Premium React 18 SPA built with Outfit & Plus Jakarta Sans typography, `#15BCDF` cyan quantum accents, glassmorphism cards, interactive 3D molecule visualizers, and animated notice tickers.
- 🔐 **Role-Based Persona Portals**: Tailored workflows for **Researchers** (full campaign generation, simulation, inspector, and analytics) and **Admins** (system logs, ML model switches, and account control).
- ☁️ **Cloud Database Persistence**: Full synchronization of experiments, generated candidate libraries, user accounts, and research inquiries with a live Supabase PostgreSQL 15 database.

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────────────────────────────┐
                                  │             Q-MoleGen Web Interface            │
                                  │   (React 18 + Vite + Chart.js + Glassmorphism) │
                                  └───────────────────────┬────────────────────────┘
                                                          │ REST / JSON APIs
                                  ┌───────────────────────▼────────────────────────┐
                                  │             Django REST Backend Engine         │
                                  │    (Endpoints: Auth, Generation, Analytics)   │
                                  └──────┬──────────────────┬──────────────────┬───┘
                                         │                  │                  │
               ┌─────────────────────────▼──┐  ┌────────────▼──────────┐  ┌───▼──────────────────────────┐
               │    Cheminformatics Engine  │  │  Classical ML Module  │  │   Quantum ML Engine (Qiskit) │
               │  - RDKit SMILES Parsing    │  │  - Gradient Boosting  │  │ - 4-Qubit ZZFeatureMap       │
               │  - 2D/3D Molecular Descr.  │  │  - Random Forest      │  │ - 16-Dim Hilbert Kernel      │
               │  - ECFP4 Fingerprints      │  │  - RBF & Linear SVM   │  │ - Quantum Fidelity Overlap   │
               └────────────────────────────┘  └───────────────────────┘  └──────────────────────────────┘
                                         │                  │                  │
                                  ┌──────▼──────────────────▼──────────────────▼───┐
                                  │    Multi-Objective Pareto Optimization Engine  │
                                  │   (Solubility LogS + QED Score + SAS Ranking)  │
                                  └───────────────────────┬────────────────────────┘
                                                          │
                                  ┌───────────────────────▼────────────────────────┐
                                  │       Supabase PostgreSQL 15 Cloud DB          │
                                  │   (Candidates Library, Experiments, Inquiries) │
                                  └────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
Q-MoleGen/
├── data/
│   ├── raw/                       # Raw Delaney ESOL benchmark datasets & SMILES
│   └── processed/                 # Generated candidates library, features & benchmarks
├── django_app/                    # Django backend server
│   ├── core/                      # Project configuration & settings
│   └── dashboard/                 # Views, API routing, models, and controllers
├── docs/                          # Architecture blueprints & Phase reports
├── frontend/                      # React 18 SPA (Vite + Tailwind/CSS System)
│   ├── public/                    # Static assets & brand media
│   └── src/
│       ├── components/            # Reusable UI (Navbar, BrandLogo, AuthModal, 3D Canvas)
│       └── pages/                 # ResearcherDashboard, Analytics, Contact, LandingPage, Admin
├── models/                        # Serialized ML checkpoints, weights & scalers
├── notebooks/                     # Jupyter exploration & Qiskit prototype circuits
├── src/                           # Core algorithmic pipelines
│   ├── classical/                 # Baseline model trainers (GB, RF, SVM)
│   ├── features/                  # RDKit descriptor & ECFP4 fingerprint extractors
│   ├── generation/                # Molecular generation & sanity filters
│   ├── optimization/              # Multi-objective Pareto dominance solver
│   ├── preprocessing/             # Delaney dataset cleansing & normalization
│   └── quantum/                   # Qiskit ZZFeatureMap circuit & QSVC estimators
├── static/                        # Backend static styling & media
├── templates/                     # Server-rendered templates & fallbacks
├── tests/                         # Automated unit & integration test suites
├── manage.py                      # Django management script
├── requirements.txt               # Python package dependencies
├── supabase_schema.sql            # PostgreSQL schema & table migrations
└── README.md                      # Project documentation
```

---

## ⚡ Quickstart & Setup Guide

### 1. Prerequisites
- **Python 3.10+** (64-bit recommended)
- **Node.js 18+** and **npm**
- **Git**

---

### 2. Clone the Repository
```bash
git clone https://github.com/VALLI-0114/Q-MoleGen.git
cd Q-MoleGen
```

---

### 3. Backend Setup (Django + Python)
```bash
# 1. Create and activate a Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 2. Install required dependencies
pip install -r requirements.txt

# 3. Apply database migrations
python manage.py migrate

# 4. (Optional) Run pipeline test suite
pytest tests/

# 5. Start the Django API server
python manage.py runserver 127.0.0.1:8000
```
*The backend API will be available at `http://127.0.0.1:8000/api/`.*

---

### 4. Frontend Setup (React + Vite)
In a separate terminal window:
```bash
cd frontend

# 1. Install Node dependencies
npm install

# 2. Start the Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
*Open your browser and navigate to `http://127.0.0.1:5173/`.*

---

## 🔬 Running Computational Chemistry & QML Pipelines

You can execute individual modules directly from the command line:

### Feature Extraction & Fingerprinting
```bash
python src/features/fingerprints.py
```

### Train Classical Baseline Ensembles
```bash
python src/classical/train_baselines.py
```

### Execute Quantum Kernel QSVC Simulation
```bash
python src/quantum/qsvc_circuit.py
```

### Multi-Objective Pareto Optimization Ranking
```bash
python src/optimization/pareto_frontier.py
```

---

## 📊 Benchmark & Empirical Performance

Evaluated against the **Delaney ESOL** physical chemistry benchmark dataset (1,128 measured compounds):

| Model Architecture | Test Accuracy | Precision | Recall | F1-Score | ROC-AUC | Fit Time (s) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gradient Boosting** (Champion) | **94.25%** | **94.8%** | **94.0%** | **94.4%** | **0.977** | 0.133s |
| **Random Forest** | 93.36% | 92.5% | 94.9% | 93.7% | 0.975 | 0.117s |
| **QSVC (ZZ-FeatureMap 4-Qubit)** | **89.82%** | **89.8%** | **90.6%** | **90.2%** | **0.959** | 0.793s |
| **RBF SVM** | 89.38% | 88.4% | 91.5% | 89.9% | 0.964 | 0.033s |
| **Linear SVM** | 88.50% | 86.4% | 92.3% | 89.3% | 0.946 | 0.021s |
| **Logistic Regression** | 88.05% | 85.7% | 92.3% | 88.9% | 0.944 | 0.005s |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register or authenticate a Researcher or Admin account |
| `GET` | `/api/researcher/stats/` | Fetch live dynamic KPI counts, quantum depth & benchmark stats |
| `GET` | `/api/researcher/experiments/` | Retrieve saved in silico research campaigns |
| `POST` | `/api/researcher/experiments/delete/` | Delete an experiment campaign by ID |
| `POST` | `/api/generate/` | Generate candidate molecules with target physical properties |
| `GET` | `/api/analytics/experiments/` | List all available analytical experiment runs |
| `GET` | `/api/analytics/data/<exp_id>/` | Fetch dynamic histograms, property distributions & benchmarks |
| `POST` | `/api/contact/` | Submit a research coordination inquiry |

---

## 👥 Project Team & Academic Leadership

### Project Guide & Supervisor
- **Dr. G. JayaSuma**  
  *Professor, Department of Information Technology*

### Student Contributors & Research Team
- **K. Pravallika** (23VV1A1223)


---

## 📜 License & Disclaimers

This project is licensed under the **MIT License**.

> **⚠️ Computational Heuristic Disclaimer:**  
> The property scores (LogS solubility, Lipinski Rule of Five compliance, QED, and SAS) produced by Q-MoleGen are computational heuristics derived from in silico machine learning and quantum simulation models. They are designed for initial lead candidate triaging and do not constitute wet-lab experimental validation or proof of clinical safety and efficacy.
