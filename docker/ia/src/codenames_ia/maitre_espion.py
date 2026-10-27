"""
Étapes 3 et 4 de la section 7.2 : scorer chaque candidat, puis choisir.

Le cœur tient en une idée : on ne cherche PAS les « clusters » d'abord.
On essaie chaque candidat, et c'est le candidat qui révèle son cluster :
ses n mots d'équipe les plus proches. Le reste n'est que du tri et de
l'arithmétique sur une matrice de similarités.
"""
from __future__ import annotations

import warnings
from dataclasses import dataclass, field

import numpy as np

from .embeddings import Embeddings, sans_accents
from .vocabulaire import masque_interdits, masque_famille


# ---------------------------------------------------------------------- #
# Données
# ---------------------------------------------------------------------- #
@dataclass
class Plateau:
    equipe: list[str]                                
    adverses: list[str] = field(default_factory=list)
    neutres: list[str] = field(default_factory=list)
    assassin: str | None = None

    def mauvais(self) -> list[tuple[str, str]]:
        liste = [(m, "adverse") for m in self.adverses] + [(m, "neutre") for m in self.neutres]
        if self.assassin:
            liste.append((self.assassin, "assassin"))
        return liste

    def tous(self) -> list[str]:
        return list(self.equipe) + [m for m, _ in self.mauvais()]


@dataclass
class Reglages:

    # Contraintes dures : un couple (candidat, n) qui les viole est rejeté.
    marge: float = 0.05                # le maillon faible doit dépasser le pire mauvais mot d'au moins ça
    similarite_minimale: float = 0.35  # en dessous, un mot n'est pas « trouvable » : il ne compte pas dans le cluster

    # Pénalité : un mauvais mot gêne s'il est à moins de `distance_securite` sous le maillon faible.
    #   pénalité = poids × max(0, distance_securite − (maillon faible − similarité du mauvais mot))
    distance_securite: float = 0.25
    poids_assassin: float = 2.0
    poids_adverse: float = 1.0
    poids_neutre: float = 0.5

    # Score : min(maillon faible, plafond) − pénalité + bonus.
    plafond: float = 0.50              # au-dessus, un mot est trouvé à coup sûr : être encore plus proche n'apporte rien
    bonus_par_mot: float = 0.10        # encourage les n élevés : + bonus × (n − 1)
    bonus_frequence: float = 0.05      # préfère les mots courants : + bonus × (1 − rang / nb_candidats)

    # Étape 2, règle « même famille » : 3 premières lettres communes avec un mot
    # du plateau ET similarité >= seuil → interdit (lunaire/LUNE, bancaire/BANQUE).
    seuil_famille: float = 0.40

    def poids(self, categorie: str) -> float:
        return {
            "assassin": self.poids_assassin,
            "adverse": self.poids_adverse,
            "neutre": self.poids_neutre
        }[categorie]

    def __repr__(self):
        string = f"\n{self.marge=}\n" \
            f"{self.similarite_minimale=}\n" \
            f"{self.distance_securite=}\n" \
            f"{self.poids_assassin=}\n" \
            f"{self.poids_adverse=}\n" \
            f"{self.poids_neutre=}\n" \
            f"{self.plafond=}\n" \
            f"{self.bonus_par_mot=}\n" \
            f"{self.bonus_frequence=}\n" \
            f"{self.seuil_famille=}\n" \

        return string

@dataclass
class Indice:
    mot: str
    nombre: int
    cibles: list[str]            # le « cluster » visé : les n mots d'équipe les plus proches
    score: float
    maillon_faible: float        # similarité du moins proche des n cibles
    pire_mauvais: str | None     # mot à éviter le plus proche du candidat
    sim_pire_mauvais: float
    penalite: float
    secours: bool = False        # True si aucun candidat ne respectait la marge

    def __str__(self) -> str:
        texte = f"{self.mot.upper()} {self.nombre}"
        texte += f"   score {self.score:+.3f}   cibles : {', '.join(self.cibles)}"
        texte += f"   (maillon faible {self.maillon_faible:.2f}, pire mauvais {self.pire_mauvais} {self.sim_pire_mauvais:.2f})"
        if self.secours:
            texte += "   [SECOURS]"
        return texte


@dataclass
class Scores:
    """Résultat brut de `scorer`, pour K candidats et a mots d'équipe."""
    ordre: np.ndarray        # (K, a) indices des mots d'équipe triés par similarité décroissante
    S_tri: np.ndarray        # (K, a) similarités triées : S_tri[:, n-1] = maillon faible pour n
    scores: np.ndarray       # (K, a) score de (candidat, n) ; -inf si rejeté
    pire_brut: np.ndarray    # (K,)  similarité avec le mot mauvais le plus proche (brute)
    idx_pire: np.ndarray     # (K,)  lequel (-1 s'il n'y a pas de mauvais mot)
    penalite: np.ndarray     # (K, a) pénalité pondérée, pour chaque n
    idx_penalise: np.ndarray # (K, a) le mauvais mot qui fixe la pénalité, pour chaque n


    def __repr__(self):
        string = f"{self.ordre=}\n" \
            f"{self.S_tri=}\n" \
            f"{self.scores=}\n" \
            f"{self.pire_brut=}\n" \
            f"{self.idx_pire=}\n" \
            f"{self.penalite=}\n" \
            f"{self.idx_penalise=}\n" \
    
        return string


# ---------------------------------------------------------------------- #
# Étape 3 : scorer
# ---------------------------------------------------------------------- #
def scorer(S_equipe: np.ndarray, S_mauvais: np.ndarray, poids_mauvais: np.ndarray, reglages: Reglages) -> Scores:
    """Le calcul de la section 7.2, pour tous les candidats et tous les n d'un coup.

    S_equipe      (K, a) : similarité de chaque candidat avec chaque mot de mon équipe
    S_mauvais     (K, b) : similarité avec chaque mot à éviter (b peut valoir 0)
    poids_mauvais (b,)   : poids de chaque mot à éviter (assassin > adverse > neutre)

    Pour un candidat et un n donnés :
      cluster        = les n mots d'équipe les plus proches (tri décroissant)
      maillon faible = similarité du n-ième (le moins proche du cluster)
      contrainte 1   : maillon faible >= pire mauvais mot (brut) + marge, sinon rejeté
      contrainte 2   : maillon faible >= similarité minimale, sinon rejeté
      pénalité       = max sur les mauvais mots de
                         poids × max(0, distance_securite − (maillon faible − similarité du mauvais mot))
                       (un mauvais mot loin sous le maillon faible ne gêne pas ;
                        plus il s'en approche, plus il coûte, et l'assassin coûte double)
      score          = min(maillon faible, plafond) − pénalité + bonus × (n − 1)
    Le plafond évite qu'un synonyme parfait d'UN seul mot (MANGUE pour BANANE,
    0,67) batte systématiquement un bon indice pour DEUX mots (POIRE, 0,55).
    """

    K, a = S_equipe.shape
    ordre = np.argsort(-S_equipe, axis=1)                         # tri décroissant par ligne
    S_tri = np.take_along_axis(S_equipe, ordre, axis=1)

    if S_mauvais.shape[1] == 0:                                   # plus aucun mot à éviter
        pire_brut = np.full(K, -1.0, dtype=np.float32)
        idx_pire = np.full(K, -1)
        penalite = np.zeros((K, a), dtype=np.float32)
        idx_penalise = np.full((K, a), -1)

    else:
        idx_pire = np.argmax(S_mauvais, axis=1)
        pire_brut = S_mauvais[np.arange(K), idx_pire]
        ecart = S_tri[:, :, None] - S_mauvais[:, None, :]                    # (K, a, b) maillon − mauvais
        gene = poids_mauvais[None, None, :] * np.maximum(0.0, reglages.distance_securite - ecart)
        idx_penalise = np.argmax(gene, axis=2)                               # (K, a)
        penalite = np.take_along_axis(gene, idx_penalise[:, :, None], axis=2)[:, :, 0]
    
    n = np.arange(1, a + 1)
    seuil = np.maximum(pire_brut + reglages.marge, reglages.similarite_minimale)
    valide = S_tri >= seuil[:, None]
    scores = np.minimum(S_tri, reglages.plafond) - penalite + reglages.bonus_par_mot * (n - 1)[None, :]
    scores = np.where(valide, scores, -np.inf)
    return Scores(ordre, S_tri, scores, pire_brut, idx_pire, penalite, idx_penalise)


# ---------------------------------------------------------------------- #
# Étape 4 : choisir
# ---------------------------------------------------------------------- #
def choisir_indices(
    candidats: list[str],
    S_equipe: np.ndarray, mots_equipe: list[str],
    S_mauvais: np.ndarray, mots_mauvais: list[str], categories_mauvais: list[str],
    reglages: Reglages,
    nb_resultats: int = 10,
    frequence: np.ndarray | None = None,
) -> list[Indice]:
    """Pour chaque candidat, le meilleur n ; puis les `nb_resultats` meilleurs candidats.
    `frequence` (K,) entre 0 et 1 (1 = mot très courant) ajoute bonus_frequence × frequence.
    Si aucun couple ne respecte la contrainte, renvoie un indice de secours (n = 1)."""
    poids = np.array([reglages.poids(c) for c in categories_mauvais], dtype=np.float32)
    res = scorer(S_equipe, S_mauvais, poids, reglages)
    K, a = S_equipe.shape

    if frequence is not None:
        res.scores = res.scores + (reglages.bonus_frequence * frequence)[:, None]

    # À score égal on préfère le n le plus grand (d'où le minuscule epsilon).
    scores = res.scores + 1e-6 * np.arange(a)[None, :]
    meilleur_n = np.argmax(scores, axis=1)                      # (K,) indice 0-based → n = +1
    meilleur_score = scores[np.arange(K), meilleur_n]

    def fabriquer(i: int, n: int, secours: bool = False) -> Indice:
        pire = mots_mauvais[res.idx_pire[i]] if res.idx_pire[i] >= 0 else None
        return Indice(
            mot=candidats[i], nombre=n,
            cibles=[mots_equipe[j] for j in res.ordre[i, :n]],
            score=float(res.scores[i, n - 1]) if np.isfinite(res.scores[i, n - 1]) else float(res.S_tri[i, n - 1] - res.penalite[i, n - 1]),
            maillon_faible=float(res.S_tri[i, n - 1]),
            pire_mauvais=pire, sim_pire_mauvais=float(res.pire_brut[i]),
            penalite=float(res.penalite[i, n - 1]), secours=secours,
        )

    classement = np.argsort(-meilleur_score)[:nb_resultats]
    indices = [fabriquer(int(i), int(meilleur_n[i]) + 1) for i in classement if np.isfinite(meilleur_score[i])]
    if indices:
        return indices

    # Secours : personne ne respecte la marge. On prend le candidat qui sépare
    # le mieux son meilleur mot d'équipe du pire mauvais mot, avec n = 1.
    ecart = res.S_tri[:, 0] - res.pire_brut
    i = int(np.argmax(ecart))
    return [fabriquer(i, 1, secours=True)]


# ---------------------------------------------------------------------- #
# Le maître-espion complet
# ---------------------------------------------------------------------- #
class MaitreEspion:
    """Assemble les quatre étapes. Se construit une fois au démarrage du
    service ; `proposer` est appelé à chaque tour."""

    def __init__(self, emb: Embeddings, candidats: list[str], reglages: Reglages | None = None):
        self.emb = emb
        self.reglages = reglages or Reglages()
        self.candidats = [c for c in candidats if c in emb.index]
        self.C = emb.matrice[[emb.index[c] for c in self.candidats]]          # (K, d) normalisés
        self.cles = np.array([sans_accents(c.lower()) for c in self.candidats])  # pour l'étape 2


    def _plateau_vectorise(self, plateau: Plateau):
        """Vecteurs des mots du plateau (en ignorant, avec avertissement, les inconnus)."""
        V_eq, mots_eq, manquants = self.emb.vecteurs(plateau.equipe)

        mauvais = plateau.mauvais()
        V_mv, mots_mv, manquants_mv = self.emb.vecteurs([m for m, _ in mauvais])
        categories = dict(mauvais)
        cats_mv = [categories[m] for m in mots_mv]

        if manquants or manquants_mv:
            warnings.warn(f"mots du plateau absents des embeddings, ignorés : {manquants + manquants_mv}")

        if not mots_eq:
            raise ValueError("aucun mot d'équipe connu des embeddings : impossible de donner un indice")

        return V_eq, mots_eq, V_mv, mots_mv, cats_mv


    def candidats_autorises(self, plateau: Plateau) -> np.ndarray:
        """Étape 2 : indices (dans self.candidats) des candidats que la règle
        du jeu autorise pour ce plateau."""
        interdit = masque_interdits(self.cles, plateau.tous())
        V, mots, _ = self.emb.vecteurs(plateau.tous())
        if mots:
            interdit |= masque_famille(self.cles, mots, self.C @ V.T, self.reglages.seuil_famille)
        return np.flatnonzero(~interdit)


    def proposer(self, plateau: Plateau, nb_resultats: int = 10) -> list[Indice]:
        """Les meilleurs couples (mot, nombre) pour ce plateau, du meilleur au moins bon."""
        V_eq, mots_eq, V_mv, mots_mv, cats_mv = self._plateau_vectorise(plateau)

        # Étape 2 : filtrer les candidats interdits.
        autorises = self.candidats_autorises(plateau)
        candidats = [self.candidats[i] for i in autorises]

        # Étape 3 : une seule multiplication de matrices donne toutes les similarités.
        B = np.vstack([V_eq, V_mv])                                    # (m, d)
        S = self.C[autorises] @ B.T                                    # (K, m)
        S_equipe, S_mauvais = S[:, : len(mots_eq)], S[:, len(mots_eq):]

        # Étape 4 : choisir. Les candidats sont triés par fréquence : rang 0 = le plus courant.
        frequence = 1.0 - autorises / max(len(self.candidats), 1)
        return choisir_indices(candidats, S_equipe, mots_eq, S_mauvais, mots_mv, cats_mv, self.reglages, nb_resultats, frequence)
