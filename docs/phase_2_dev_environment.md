# Q-MolGen — Phase 2: Complete Development Environment Guide

This guide details the complete 13-step development environment setup, tools configuration, and verification protocols for **Q-MolGen**.

---

## 1. System Requirements & Python 3.10 Installation
- **Python Version**: Python 3.10.x (Selected for stable binary compatibility with RDKit, DeepChem, PyTorch, and Qiskit).
- **Architecture**: 64-bit Windows / Linux / macOS.
- **Verification Command**:
  ```powershell
  python --version
  # Output: Python 3.10.x
  ```

---

## 2. VS Code Workspace Configuration
To enable automatic environment activation, Python IntelliSense, and integrated PyTest discovery, configure `.vscode/settings.json`:
- `python.defaultInterpreterPath`: Points directly to `./venv/Scripts/python.exe`.
- `python.testing.pytestEnabled`: `true`.
- `files.exclude`: Hides clutter (`__pycache__`, `.pytest_cache`).

---

## 3. Git & GitHub Version Control Setup
- **Initialize Repository**:
  ```powershell
  git init
  ```
- **Ignore Sensitive / Binary Files**:
  Ensure `.gitignore` excludes `venv/`, `.env`, cached datasets, and heavy model weights (`.pt`, `.joblib`).
- **Initial Commit**:
  ```powershell
  git add .
  git commit -m "feat(setup): initialize Q-MolGen project structure and dependencies"
  ```

---

## 4. Project Folder Hierarchy
Maintain strict separation of concerns across raw data, source logic, classical & quantum models, Django apps, and test suites:
- `data/`: `raw/`, `processed/`, `external/`
- `src/`: `preprocessing/`, `features/`, `classical/`, `quantum/`, `generation/`, `optimization/`, `evaluation/`
- `models/`: `classical/`, `quantum/`, `generator/`
- `django_app/`: `config/`, `molecules/`, `predictions/`, `quantum/`, `generation/`, `optimization/`, `dashboard/`

---

## 5. Virtual Environment Creation
Always isolate dependencies to avoid version conflicts with system-wide Python packages:
```powershell
# Create virtual environment named 'venv'
python -m venv venv
```

---

## 6. Virtual Environment Activation
- **Windows PowerShell**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(If execution policy restricts scripts: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*
- **Windows Command Prompt (cmd)**:
  ```cmd
  venv\Scripts\activate.bat
  ```
- **Linux / macOS**:
  ```bash
  source venv/bin/activate
  ```

---

## 7. Installing Core Dependencies
Install verified packages listed in `requirements.txt`:
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 8. Testing Python Core
Verify floating point precision, memory allocation, and standard library:
```powershell
python -c "import sys, platform; print(f'Python {sys.version} on {platform.system()}')"
```

---

## 9. Testing NumPy
Ensure BLAS/LAPACK vectorized matrix operations execute without segmentation faults:
```powershell
python -c "import numpy as np; a = np.eye(3); print('NumPy Matrix Identity:\n', a)"
```

---

## 10. Testing Pandas
Verify tabular data structures and indexing:
```powershell
python -c "import pandas as pd; df = pd.DataFrame({'molecule': ['Benzene'], 'mw': [78.11]}); print(df)"
```

---

## 11. Testing RDKit
Verify SMILES parsing, aromaticity perception, and descriptor calculation:
```powershell
python -c "from rdkit import Chem; from rdkit.Chem import Descriptors; m = Chem.MolFromSmiles('c1ccccc1'); print('Benzene MW:', Descriptors.MolWt(m))"
```

---

## 12. Testing DeepChem & Scientific Dataset Loaders
Verify molecular dataset loading tools:
```powershell
python -c "import deepchem as dc; print('DeepChem Version:', dc.__version__)"
```

---

## 13. Testing Jupyter & Kernel Registration
Register the virtual environment as an isolated Jupyter kernel for experimental notebooks:
```powershell
# Register the kernel
python -m ipykernel install --user --name qmolgen --display-name "Python 3.10 (Q-MolGen)"

# List available kernels
jupyter kernelspec list
```
