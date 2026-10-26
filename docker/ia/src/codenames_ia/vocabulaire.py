"""
Étape 1 : constituer, une fois au démarrage, le vocabulaire des candidats
          (les mots que l'IA a le droit de proposer comme indice).
Étape 2 : à chaque tour, retirer les candidats interdits par le plateau
          (mot du plateau, mot qui le contient, mot de même racine).
"""
from __future__ import annotations

import numpy as np

from .embeddings import Embeddings, SEPARATEURS, sans_accents

# Mots outils : jamais de bons indices, et leurs vecteurs sont bizarres
# (ils sont proches de tout parce qu'ils apparaissent partout).
MOTS_OUTILS_FR = frozenset("""
le la les un une des du de au aux et ou ni mais donc or car ne pas non oui
que qui quoi dont comment pourquoi combien quand lorsque si
je tu il elle on nous vous ils elles me te se lui leur leurs eux moi toi soi
mon ma mes ton ta tes son sa ses notre nos votre vos
ce cet cette ces ceci cela celui celle ceux celles
quel quelle quels quelles quelque quelques chaque tout tous toute toutes
meme memes autre autres tel telle tels telles
sans avec pour par sur sous dans entre vers chez depuis pendant avant apres
contre selon parmi malgre des lors puis ensuite enfin alors ainsi aussi
tres trop peu assez plus moins bien mal encore deja toujours jamais souvent
ici ailleurs partout
etre suis es est sommes etes sont etais etait etions etiez etaient
serai seras sera serons serez seront serais serait ete etant soit sois soyons soyez soient
avoir ai as avons avez ont avais avait avions aviez avaient
aurai auras aura aurons aurez auront aurais aurait eu ayant aie ait ayons ayez aient
faire fais fait faisons faites font faisais faisait faisaient fera feront ferait
aller vais vas va allons allez vont allait iront irait
peut peux pouvons pouvez peuvent pouvait pourra pourront pourrait pouvoir
veut veux voulons voulez veulent voulait voudrait vouloir
doit dois devons devez doivent devait devra devrait devoir
faut fallait faudra faudrait falloir
dit dis disons dites disent disait dira dire
etc via dont ok oui non
""".split())

MOTS_OUTILS_EN = frozenset("""
the a an and or but nor so yet of to in on at by for with from into onto
about as is are was were be been being am do does did doing have has had having
will would shall should can could may might must
i you he she it we they me him her us them my your his its our their mine yours
this that these those who whom whose which what where when why how
not no yes if then than too very just also only even still already again
here there now then always never often sometimes
up down out off over under again further once all any both each few more most other some such
etc
""".split())


def charger_dictionnaire(chemin: str) -> frozenset[str]:
    """Lit un dictionnaire hunspell (.dic : une entrée « mot/DRAPEAUX » par
    ligne) ou une simple liste de mots (un par ligne). Renvoie les mots en
    minuscules sans accents, pour une comparaison tolérante."""
    mots: set[str] = set()
    with open(chemin, encoding="utf-8", errors="ignore") as f:
        for numero, ligne in enumerate(f):
            ligne = ligne.strip()
            if numero == 0 and ligne.isdigit():
                continue                                   # première ligne hunspell : nb d'entrées
            mot = ligne.split("/")[0].split("\t")[0].strip()
            if mot and mot.isalpha():
                mots.add(sans_accents(mot.lower()))
    return frozenset(mots)


def construire_candidats(
    emb: Embeddings,
    nb_max: int = 30_000,
    longueur_min: int = 3,
    garder_majuscules: bool = True,
    rang_max_noms_propres: int = 10_000,
    mots_outils: frozenset[str] = MOTS_OUTILS_FR,
    dictionnaire: frozenset[str] | None = None,
) -> list[str]:
    """Étape 1 : les mots que l'IA a le droit de proposer.

    On parcourt le vocabulaire dans l'ordre (= fréquence décroissante) et on
    garde les `nb_max` premiers mots qui passent les filtres :
      - uniquement des lettres (pas de chiffres, ponctuation, apostrophes) ;
      - au moins `longueur_min` lettres ;
      - pas de majuscule, sauf si `garder_majuscules` (noms propres : Paris,
        Eiffel, Noël... mais aussi des prénoms et des marques) ; et dans ce
        cas seulement parmi les `rang_max_noms_propres` premiers candidats :
        Eiffel, Mozart ou Zeus sont courants, Georgette ou Méliès ne le sont
        pas et feraient de mauvais indices ;
      - pas un mot outil ;
      - présent dans `dictionnaire` si on en donne un (élimine les mots
        anglais et les fautes de frappe, très nombreux dans un corpus web) ;
      - pas un simple pluriel d'un mot déjà retenu ("pommes" si "pomme" y est).
    Quand un mot existe sous plusieurs formes ('Paris', 'paris'), la première
    rencontrée, donc la plus fréquente, est gardée.
    """
    candidats: list[str] = []
    vus: set[str] = set()
    for mot in emb.mots:
        if len(candidats) >= nb_max:
            break
        if not mot.isalpha() or len(mot) < longueur_min:
            continue
        if mot[0].isupper() and (not garder_majuscules or len(candidats) >= rang_max_noms_propres):
            continue
        if not mot[1:].islower():
            continue                                       # sigles, ordinaux, cris : "PARIS", "XVe", "LOL"
        cle = sans_accents(mot.lower())
        if cle in mots_outils or cle in vus:
            continue
        if dictionnaire is not None and cle not in dictionnaire:
            continue
        if cle[-1] in "sx" and cle[:-1] in vus:   # pluriel grossier
            continue
        vus.add(cle)
        candidats.append(mot)
    return candidats


def _parties(mot_plateau: str) -> list[str]:
    """'POMME DE TERRE' -> ['pomme', 'terre'] (en minuscules, sans accents)."""
    cle = sans_accents(mot_plateau.lower())
    parties = [p for p in SEPARATEURS.split(cle) if len(p) >= 3]
    return parties or [cle]


def mot_interdit(candidat: str, mot_plateau: str, similarite: float | None = None, seuil_famille: float = 0.40) -> bool:
    """Étape 2, version lisible pour un seul couple de mots.

    Interdit si, pour une partie du mot du plateau (ex : 'pomme') :
      - le candidat est égal, contient cette partie, ou est contenu dedans :
        'pommes', 'pommeraie', 'detour' pour TOUR... ;
      - ils commencent par les mêmes lettres sur une longueur k, avec
        k = max(4, longueur - 3) : 'pommier' (pomm), 'routier' (rout),
        'informaticien' pour INFORMATIQUE (informati) ;
      - (si on fournit leur similarité) ils ont les 3 mêmes premières lettres
        ET une similarité >= seuil_famille : 'lunaire' pour LUNE (0,63),
        'bancaire' pour BANQUE (0,71). Les dérivés dont la racine change
        échappent à la règle du préfixe ; les vecteurs les rattrapent.
    C'est une approximation de la racine qui fonctionne bien en pratique.
    """
    c = sans_accents(candidat.lower())
    for p in _parties(mot_plateau):
        if c == p or p in c or c in p:
            return True
        k = max(4, len(p) - 3)
        if len(c) >= k and c[:k] == p[:k]:
            return True
        if similarite is not None and similarite >= seuil_famille and c[:3] == p[:3]:
            return True
    return False


def masque_interdits(cles: np.ndarray, mots_plateau: list[str]) -> np.ndarray:
    """Étape 2, version vectorisée : même règle que `mot_interdit` mais sur
    tout le vocabulaire d'un coup.

    `cles` : tableau numpy des candidats en minuscules sans accents
    (préparé une fois pour toutes par MaitreEspion).
    Renvoie un tableau de booléens : True = interdit pour ce plateau.
    """
    interdit = np.zeros(len(cles), dtype=bool)
    for mot in mots_plateau:
        for p in _parties(mot):
            interdit |= np.char.find(cles, p) >= 0            # le candidat contient p (ou lui est égal)
            interdit |= np.char.find(p, cles) >= 0            # p contient le candidat
            k = max(4, len(p) - 3)
            interdit |= np.char.startswith(cles, p[:k])      # même racine (préfixe commun)
    return interdit


def masque_famille(cles: np.ndarray, mots_plateau: list[str], S: np.ndarray, seuil_famille: float = 0.40) -> np.ndarray:
    """La règle « même famille » de `mot_interdit`, vectorisée.

    `S` (nb_candidats, nb_mots_plateau) : similarité de chaque candidat avec
    chaque mot de `mots_plateau` (même ordre que les colonnes).
    Interdit = 3 premières lettres communes ET similarité >= seuil_famille.
    """
    interdit = np.zeros(len(cles), dtype=bool)
    for j, mot in enumerate(mots_plateau):
        for p in _parties(mot):
            interdit |= np.char.startswith(cles, p[:3]) & (S[:, j] >= seuil_famille)
    return interdit
