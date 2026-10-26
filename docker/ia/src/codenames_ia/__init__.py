"""
IA Codenames par embeddings de mots (section 7 de IA_GAME.md).

Modules :
    embeddings     chargement des vecteurs, similarité cosinus, voisins
    vocabulaire    étape 1 (candidats autorisés) et étape 2 (mots interdits)
    maitre_espion  étapes 3 et 4 : scorer chaque candidat, choisir (mot, nombre)
    clusters       vue « a priori » : regrouper les mots du plateau entre eux
    agent          le rôle inverse : deviner à partir d'un indice
"""
from .embeddings import Embeddings, sans_accents
from .vocabulaire import construire_candidats, charger_dictionnaire, masque_interdits, masque_famille, mot_interdit
from .maitre_espion import Plateau, Reglages, Indice, MaitreEspion, scorer, choisir_indices, expliquer_candidat, par_cluster
from .clusters import matrice_similarite
from .agent import deviner

__all__ = [
    "Embeddings", "sans_accents",
    "construire_candidats", "charger_dictionnaire", "masque_interdits", "masque_famille", "mot_interdit",
    "Plateau", "Reglages", "Indice", "MaitreEspion", "scorer", "choisir_indices", "expliquer_candidat", "par_cluster",
    "matrice_similarite",
    "deviner",
]
