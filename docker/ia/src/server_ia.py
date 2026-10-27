import socket
import json
import sys
from pathlib import Path

from codenames_ia import (
    Embeddings, MaitreEspion, Plateau, Reglages, Indice,
    construire_candidats, charger_dictionnaire
)


def create_candidat(langue: str) ->tuple[list[str], Embeddings]:

    dictionnaire_fr = Path(f"dictionnaires/{langue}.dic")
    chemin = Path(f"vecteurs/cc.{langue}.300.top100000.npz")
    emb = Embeddings.charger(chemin)
    dictionnaire = charger_dictionnaire(dictionnaire_fr)
    candidats = construire_candidats(emb, nb_max=30_000, dictionnaire=dictionnaire)

    return candidats, emb


def create_SpyMaster(langue: str) -> MaitreEspion:

    candidats, emb =  create_candidat(langue)
    
    reglages = Reglages(
        marge=0.05,
        similarite_minimale=0.40,
        distance_securite=0.20,
        poids_assassin=2.0,
        poids_adverse=1.0,
        poids_neutre=0.5,
        plafond=0.40,
        bonus_par_mot=0.15,
        bonus_frequence=0.05,
        seuil_famille=0.40
    )
    maitre = MaitreEspion(emb, candidats, reglages)

    return maitre


def create_clue(message_dict: str) -> Indice:

    maitre = create_SpyMaster(message_dict['langue'])
    
    plateau25 = Plateau(
        equipe=message_dict['list_team'],
        adverses=message_dict['list_adverse'],
        neutres=message_dict['list_neutral'],
        assassin=message_dict['assassin_word'],
    )
    
    indices = maitre.proposer(plateau25, nb_resultats=200)[0]

    return indices


def main():

    host = "0.0.0.0"
    port = 8001

    serveur = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    serveur.bind((host, port))
    serveur.listen(5)

    while True:

        communication_socket, _  = serveur.accept()
        message = communication_socket.recv(1024).decode("utf-8")
        
        indice = create_clue(json.loads(message))
        
        response = {
            'clue': indice.mot,
            'number': indice.nombre
        }

        communication_socket.send(json.dumps(response).encode("utf-8"))
        communication_socket.close()


main()