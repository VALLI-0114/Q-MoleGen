"""
Phase 0 / Step 1: Environment & Core Dependencies Verification Test
Tests that all foundational scientific computing, machine learning,
and cheminformatics libraries are installed and functional.
"""

import sys
import pytest


def test_python_version():
    """Ensure Python version is 3.10+"""
    assert sys.version_info.major == 3
    assert sys.version_info.minor >= 10, f"Python 3.10+ required, got {sys.version}"


def test_numpy_installation():
    """Verify NumPy array operations"""
    import numpy as np
    arr = np.array([1.0, 2.0, 3.0])
    assert arr.sum() == 6.0


def test_pandas_installation():
    """Verify Pandas DataFrame creation"""
    import pandas as pd
    df = pd.DataFrame({"smiles": ["CCO", "c1ccccc1"], "solubility": [-0.5, -2.1]})
    assert len(df) == 2
    assert "smiles" in df.columns


def test_scipy_installation():
    """Verify SciPy stats and mathematical operations"""
    import scipy.stats as stats
    norm = stats.norm.rvs(loc=0, scale=1, size=10, random_state=42)
    assert len(norm) == 10


def test_sklearn_installation():
    """Verify Scikit-Learn estimator import & basic pipeline"""
    from sklearn.linear_model import LinearRegression
    import numpy as np
    X = np.array([[1], [2], [3]])
    y = np.array([2, 4, 6])
    model = LinearRegression().fit(X, y)
    pred = model.predict([[4]])
    assert round(pred[0], 2) == 8.0


def test_matplotlib_installation():
    """Verify Matplotlib backend setup"""
    import matplotlib
    matplotlib.use("Agg")  # Non-interactive backend for testing
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots()
    ax.plot([1, 2], [3, 4])
    plt.close(fig)


def test_rdkit_installation():
    """Verify RDKit parsing and molecular descriptor calculation"""
    from rdkit import Chem
    from rdkit.Chem import Descriptors

    # Test SMILES for Aspirin (Acetylsalicylic acid)
    smiles = "CC(=O)Oc1ccccc1C(=O)O"
    mol = Chem.MolFromSmiles(smiles)
    assert mol is not None, "Failed to parse valid SMILES"

    # Compute key descriptors
    mw = Descriptors.MolWt(mol)
    logp = Descriptors.MolLogP(mol)
    tpsa = Descriptors.TPSA(mol)

    assert 170.0 < mw < 190.0, f"Unexpected MW: {mw}"
    assert 1.0 < logp < 2.0, f"Unexpected LogP: {logp}"
    assert 60.0 < tpsa < 70.0, f"Unexpected TPSA: {tpsa}"


def test_deepchem_installation():
    """Verify DeepChem import and version"""
    import deepchem as dc
    assert dc.__version__ is not None
    assert len(dc.__version__) > 0


def test_jupyter_environment():
    """Verify Jupyter / IPython kernel components"""
    import IPython
    import ipykernel
    assert IPython.__version__ is not None
    assert ipykernel.__version__ is not None

