"""
La vue « a priori » : regrouper les mots du plateau entre eux.

Ce n'est PAS nécessaire pour choisir un indice (voir maitre_espion.py : le
candidat révèle lui-même son cluster). Mais c'est très utile pour :
  - comprendre ce que « voit » l'IA sur un plateau (debug, soutenance) ;
  - l'approche hybride (section 8) : proposer un groupe + quelques indices
    à un LLM ;
  - vérifier qu'un indice couvre bien un groupe que l'on a en tête.
"""
from __future__ import annotations

import numpy as np

from .embeddings import Embeddings
from .maitre_espion import Indice, MaitreEspion, Plateau, scorer


def matrice_similarite(emb: Embeddings, mots: list[str]) -> tuple[np.ndarray, list[str]]:
    """Similarité de chaque mot du plateau avec chaque autre : (m, m)."""
    V, trouves, _ = emb.vecteurs(mots)
    return V @ V.T, trouves
