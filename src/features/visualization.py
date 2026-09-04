"""
Phase 7: Molecular Visualization Engine
Provides high-resolution 2D chemical structure rendering in SVG and PNG formats,
substructure highlighting, and batch grid images using RDKit.
"""

import os
from typing import Optional, List, Tuple
from rdkit import Chem
from rdkit.Chem import Draw
from rdkit.Chem.Draw import rdMolDraw2D


def smiles_to_svg(
    smiles: str,
    width: int = 350,
    height: int = 220,
    highlight_substructure: Optional[str] = None
) -> Optional[str]:
    """
    Renders a SMILES string to a clean, transparent 2D vector SVG string.
    Optionally highlights atoms matching a SMARTS or SMILES substructure.
    """
    if not isinstance(smiles, str) or not smiles.strip():
        return None

    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None

        # Compute 2D coordinates for clear layout
        Chem.rdDepictor.Compute2DCoords(mol)

        drawer = rdMolDraw2D.MolDraw2DSVG(width, height)
        opts = drawer.drawOptions()
        opts.clearBackground = False  # Transparent dark-mode compatibility
        opts.bondLineWidth = 2.0
        opts.padding = 0.08

        highlight_atoms = []
        if highlight_substructure:
            sub_mol = Chem.MolFromSmarts(highlight_substructure) or Chem.MolFromSmiles(highlight_substructure)
            if sub_mol:
                match = mol.GetSubstructMatch(sub_mol)
                highlight_atoms = list(match)

        if highlight_atoms:
            drawer.DrawMolecule(mol, highlightAtoms=highlight_atoms)
        else:
            drawer.DrawMolecule(mol)

        drawer.FinishDrawing()
        return drawer.GetDrawingText()
    except Exception:
        return None


def render_molecule_grid_image(
    smiles_list: List[str],
    legends: Optional[List[str]] = None,
    mols_per_row: int = 3,
    sub_img_size: Tuple[int, int] = (300, 200),
    output_path: Optional[str] = None
) -> Optional[str]:
    """
    Renders a list of SMILES strings into a multi-molecule grid image.
    Optionally saves the PNG to output_path.
    """
    mols = []
    valid_legends = []

    for idx, s in enumerate(smiles_list):
        m = Chem.MolFromSmiles(s)
        if m is not None:
            Chem.rdDepictor.Compute2DCoords(m)
            mols.append(m)
            valid_legends.append(legends[idx] if legends and idx < len(legends) else f"Mol #{idx+1}")

    if not mols:
        return None

    img = Draw.MolsToGridImage(
        mols,
        molsPerRow=mols_per_row,
        subImgSize=sub_img_size,
        legends=valid_legends,
        useSVG=False
    )

    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path)
        return output_path

    return None
