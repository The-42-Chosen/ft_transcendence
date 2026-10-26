"""
Section 7.4 : le rôle d'agent. À partir d'un indice (mot, nombre), choisir
les mots du plateau les plus proches. 25 produits scalaires, rien de plus.
"""
from __future__ import annotations

import numpy as np

from .embeddings import Embeddings


def deviner(emb: Embeddings, indice: str, nombre: int, mots_caches: list[str], ecart_max: float = 0.15) -> list[tuple[str, float]]:
    """Les mots à proposer, dans l'ordre, avec leur similarité à l'indice.

    On trie les mots cachés par similarité décroissante et on en prend
    `nombre`. On s'arrête plus tôt si la similarité chute de plus de
    `ecart_max` d'un mot au suivant : c'est l'agent prudent de 7.4.
    """
    v = emb.vecteur(indice)
    if v is None:
        return []
    V, trouves, _ = emb.vecteurs(mots_caches)
    if not trouves:
        return []
    sims = V @ v
    choix: list[tuple[str, float]] = []
    precedent = None
    for j in np.argsort(-sims)[:nombre]:
        if precedent is not None and precedent - sims[j] > ecart_max:
            break
        choix.append((trouves[j], float(sims[j])))
        precedent = sims[j]
    return choix
