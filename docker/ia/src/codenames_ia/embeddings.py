"""
Chargement des vecteurs de mots (embeddings) et similarité cosinus.

Formats acceptés par `Embeddings.charger` :
  - fastText .vec (première ligne "nb_mots dimension"), éventuellement .gz ;
  - GloVe .txt (pas d'en-tête) ;
  - le cache .npz produit par `Embeddings.sauvegarder` (rechargement en < 1 s).

Point essentiel : les vecteurs sont NORMALISÉS (norme 1) au chargement.
Le produit scalaire de deux vecteurs normalisés est exactement leur
similarité cosinus. Toute la suite (matrice candidats × plateau) repose
sur ce détail : `C @ B.T` donne directement des similarités.
"""
from __future__ import annotations

import gzip
import re
import unicodedata
from pathlib import Path

import numpy as np

# Sépare les mots composés : "pomme de terre", "porte-avions", "chef d'œuvre"
SEPARATEURS = re.compile(r"[\s\-'’]+")


def sans_accents(texte: str) -> str:
    """'MÉDECIN' -> 'MEDECIN'. Sert uniquement aux comparaisons de formes."""
    decompose = unicodedata.normalize("NFD", texte)
    return "".join(c for c in decompose if unicodedata.category(c) != "Mn")


def formes_possibles(mot: str) -> list[str]:
    """Les orthographes sous lesquelles un mot du plateau peut exister.

    Le plateau envoie « MÉDECIN » ; les fichiers fastText contiennent
    « médecin » (très fréquent), « Médecin » (moins), « MÉDECIN » (rare).
    Pour « PARIS », c'est « Paris » qui est de loin le plus fréquent, et son
    vecteur est bien meilleur que celui de « paris ».
    """
    mot = mot.strip()
    base = [mot.lower(), mot.capitalize(), mot, mot.upper()]
    base += [sans_accents(f) for f in base]
    formes: list[str] = []
    for f in base:
        if f not in formes:
            formes.append(f)
    return formes


class Embeddings:
    """Un vocabulaire (liste de mots, ordre = fréquence décroissante) et une
    matrice (nb_mots, dimension) de vecteurs normalisés."""

    def __init__(self, mots: list[str], matrice: np.ndarray):
        if len(mots) != matrice.shape[0]:
            raise ValueError("autant de mots que de lignes dans la matrice, s'il vous plaît")
        self.mots = list(mots)
        self.index = {m: i for i, m in enumerate(self.mots)}
        normes = np.linalg.norm(matrice, axis=1, keepdims=True)
        normes[normes == 0] = 1.0
        self.matrice = np.ascontiguousarray(matrice / normes, dtype=np.float32)
        self.dimension = self.matrice.shape[1]

    # ------------------------------------------------------------------ #
    # Chargement / sauvegarde
    # ------------------------------------------------------------------ #
    @classmethod
    def charger(cls, chemin: str | Path, max_mots: int = 100_000, verbose: bool = True) -> "Embeddings":
        chemin = Path(chemin)
        if chemin.suffix == ".npz":
            return cls.charger_npz(chemin)
        return cls.charger_texte(chemin, max_mots=max_mots, verbose=verbose)

    @classmethod
    def charger_texte(cls, chemin: str | Path, max_mots: int = 100_000, verbose: bool = True) -> "Embeddings":
        """Lit un .vec (fastText) ou .txt (GloVe), en ne gardant que les
        `max_mots` premières lignes, c'est-à-dire les mots les plus fréquents."""
        chemin = Path(chemin)
        ouvrir = gzip.open if chemin.suffix == ".gz" else open
        mots: list[str] = []
        lignes: list[np.ndarray] = []
        dimension = None
        with ouvrir(chemin, "rt", encoding="utf-8", errors="ignore") as f:
            for numero, ligne in enumerate(f):
                morceaux = ligne.split()            # découpe sur tout blanc (espaces de fin compris)
                if numero == 0 and len(morceaux) == 2 and all(p.isdigit() for p in morceaux):
                    dimension = int(morceaux[1])      # en-tête fastText : "2000000 300"
                    continue
                mot, valeurs = morceaux[0], morceaux[1:]
                if dimension is None:
                    dimension = len(valeurs)          # GloVe : pas d'en-tête
                if len(valeurs) != dimension or not mot:
                    continue                          # ligne bizarre (mot avec espace...)
                mots.append(mot)
                lignes.append(np.array(valeurs, dtype=np.float32))
                if len(mots) >= max_mots:
                    break
                if verbose and len(mots) % 20_000 == 0:
                    print(f"\r  {len(mots)} mots lus", end="", flush=True)
        if verbose:
            print(f"\r  {len(mots)} mots lus depuis {chemin.name}")
        if not mots:
            raise ValueError(f"aucun vecteur lu dans {chemin}")
        return cls(mots, np.vstack(lignes))

    def sauvegarder(self, chemin: str | Path) -> None:
        """Cache numpy : les mots (une chaîne, un mot par ligne) + la matrice."""
        np.savez(Path(chemin), mots=np.array("\n".join(self.mots)), matrice=self.matrice)

    @classmethod
    def charger_npz(cls, chemin: str | Path) -> "Embeddings":
        donnees = np.load(Path(chemin))
        return cls(str(donnees["mots"]).split("\n"), donnees["matrice"])

    # ------------------------------------------------------------------ #
    # Accès aux vecteurs
    # ------------------------------------------------------------------ #
    def __len__(self) -> int:
        return len(self.mots)

    def __contains__(self, mot: str) -> bool:
        return self.forme_connue(mot) is not None

    def forme_connue(self, mot: str) -> str | None:
        """La forme du mot présente dans le vocabulaire, ou None.

        S'il en existe plusieurs ('paris', 'Paris', 'PARIS'), on prend la plus
        FRÉQUENTE (le plus petit indice, les fichiers étant triés par
        fréquence) : c'est celle dont le vecteur est le mieux appris.
        """
        presentes = [f for f in formes_possibles(mot) if f in self.index]
        if not presentes:
            return None
        return min(presentes, key=self.index.__getitem__)

    def vecteur(self, mot: str, composes: bool = True) -> np.ndarray | None:
        """Vecteur normalisé du mot, ou None s'il est inconnu.

        Un mot composé inconnu ("pomme de terre") est remplacé par la moyenne
        des vecteurs de ses parties significatives (ici "pomme" et "terre").
        """
        forme = self.forme_connue(mot)
        if forme is not None:
            return self.matrice[self.index[forme]]
        if composes:
            parties = [p for p in SEPARATEURS.split(mot) if len(p) >= 3]
            vecteurs = [self.matrice[self.index[f]] for p in parties if (f := self.forme_connue(p))]
            if vecteurs:
                moyenne = np.mean(vecteurs, axis=0)
                return moyenne / (np.linalg.norm(moyenne) or 1.0)
        return None

    def vecteurs(self, mots: list[str]) -> tuple[np.ndarray, list[str], list[str]]:
        """Matrice (nb_trouves, dimension) + liste des mots trouvés + liste des manquants."""
        trouves, manquants, lignes = [], [], []
        for mot in mots:
            v = self.vecteur(mot)
            if v is None:
                manquants.append(mot)
            else:
                trouves.append(mot)
                lignes.append(v)
        matrice = np.vstack(lignes) if lignes else np.zeros((0, self.dimension), dtype=np.float32)
        return matrice, trouves, manquants

    # ------------------------------------------------------------------ #
    # Similarité
    # ------------------------------------------------------------------ #
    def similarite(self, a: str, b: str) -> float:
        """Similarité cosinus entre deux mots (NaN si l'un est inconnu)."""
        va, vb = self.vecteur(a), self.vecteur(b)
        if va is None or vb is None:
            return float("nan")
        return float(va @ vb)

