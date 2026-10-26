#!/usr/bin/env python3
"""
Télécharge les N premiers mots (donc les plus fréquents) des vecteurs fastText
SANS télécharger le fichier complet (1,2 Go pour le français).

Les fichiers .vec de fastText sont triés par fréquence décroissante : on lit le
flux compressé depuis le début et on s'arrête dès qu'on a assez de lignes.

Usage :
    python3 telecharger_vecteurs.py                       # français, 100 000 mots
    python3 telecharger_vecteurs.py --langue en --nb-mots 50000

Produit :
    vecteurs/cc.fr.300.top100000.vec   texte au format fastText (lisible, ~200 Mo)
    vecteurs/cc.fr.300.top100000.npz   cache numpy (se charge en moins d'une seconde)
    dictionnaires/fr.dic               dictionnaire hunspell (filtre des candidats)
"""
from __future__ import annotations

import sys
import urllib.request
import zlib
from pathlib import Path

from codenames_ia.embeddings import Embeddings

URL = "https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.{langue}.300.vec.gz"

# Dictionnaires hunspell (LibreOffice) : servent à ne garder comme candidats
# que de vrais mots de la langue. Le corpus web de fastText est plein de mots
# anglais et de fautes de frappe.
URL_DICTIONNAIRE = {
    "fr": "https://raw.githubusercontent.com/LibreOffice/dictionaries/master/fr_FR/dictionaries/fr.dic",
    "en": "https://raw.githubusercontent.com/LibreOffice/dictionaries/master/en/en_US.dic",
    "es": "https://raw.githubusercontent.com/LibreOffice/dictionaries/master/es/es_ES.dic",
}


def telecharger_dictionnaire(langue: str, dossier: Path) -> Path | None:
    url = URL_DICTIONNAIRE.get(langue)
    if url is None:
        print(f"Pas de dictionnaire connu pour « {langue} » : les candidats ne seront pas filtrés.")
        return None
    dossier.mkdir(parents=True, exist_ok=True)
    sortie = dossier / f"{langue}.dic"
    print(f"Téléchargement du dictionnaire {url}")
    urllib.request.urlretrieve(url, sortie)
    print(f"Dictionnaire  : {sortie}")
    return sortie


def telecharger(langue: str, nb_mots: int, dossier: Path) -> Path:
    url = URL.format(langue=langue)
    dossier.mkdir(parents=True, exist_ok=True)
    sortie = dossier / f"cc.{langue}.300.top{nb_mots}.vec"

    decompresseur = zlib.decompressobj(zlib.MAX_WBITS | 32)  # 32 : accepte l'en-tête gzip
    tampon = b""
    ecrites = 0
    dimension = None
    print(f"Téléchargement de {url}")
    print(f"On s'arrête après {nb_mots} mots.")

    with urllib.request.urlopen(url) as reponse, open(sortie, "wb") as f:
        f.write(b" " * 20 + b"\n")  # place pour l'en-tête, réécrit à la fin
        while ecrites < nb_mots:
            bloc = reponse.read(1 << 20)
            if not bloc:
                break
            tampon += decompresseur.decompress(bloc)
            lignes = tampon.split(b"\n")
            tampon = lignes.pop()  # la dernière ligne est peut-être incomplète
            for ligne in lignes:
                if dimension is None:  # première ligne : "2000000 300"
                    dimension = int(ligne.split()[1])
                    continue
                f.write(ligne + b"\n")
                ecrites += 1
                if ecrites >= nb_mots:
                    break
            print(f"\r  {ecrites:>8} mots reçus", end="", flush=True)
        f.seek(0)
        f.write(f"{ecrites} {dimension}".ljust(20).encode())
    print(f"\nFichier texte : {sortie}")
    return sortie


def main() -> int:

    for langue in ('fr', 'en', 'es'):
        sortie = telecharger(langue, 100_000, Path("vecteurs"))
        telecharger_dictionnaire(langue, Path("dictionnaires"))

        # Conversion en cache numpy pour un chargement instantané.
        sys.path.insert(0, str(Path(__file__).resolve().parent))

        emb = Embeddings.charger(sortie, max_mots=100_000)
        cache = sortie.with_suffix(".npz")
        emb.sauvegarder(cache)
        print(f"Cache numpy   : {cache}  ({len(emb)} mots, dimension {emb.dimension})")

    return 0


if __name__ == "__main__":
    sys.exit(main())
