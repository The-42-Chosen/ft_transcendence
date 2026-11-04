import socket
import json
from pathlib import Path

from codenames_ia import (
    Embeddings, MaitreEspion, Plateau, Reglages, Indice,
    construire_candidats, charger_dictionnaire,
    MOTS_OUTILS_EN, MOTS_OUTILS_ES, MOTS_OUTILS_FR
)


def create_candidat(langue: str) ->tuple[list[str], Embeddings]:

    dictionnaire = Path(f"dictionnaires/{langue}.dic")
    chemin = Path(f"vecteurs/cc.{langue}.300.top100000.npz")
    emb = Embeddings.charger(chemin)
    dictionnaire = charger_dictionnaire(dictionnaire)

    if langue == 'en':
        mots_outils = MOTS_OUTILS_EN
    elif langue == 'es':
        mots_outils = MOTS_OUTILS_ES
    else:
        mots_outils = MOTS_OUTILS_FR

    candidats = construire_candidats(emb, nb_max=30_000, dictionnaire=dictionnaire, mots_outils=mots_outils)

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


def create_clue(message_dict: str, maitre: MaitreEspion) -> Indice:

    if message_dict['current_turn'] == 'blue':
        equipe = message_dict['list_blue']
        adverses = message_dict['list_red']
    else:
        equipe = message_dict['list_red']
        adverses = message_dict['list_blue']

    plateau25 = Plateau(
        equipe=equipe,
        adverses=adverses,
        neutres=message_dict['list_neutral'],
        assassin=message_dict['assassin_word'],
    )
    
    indices = maitre.proposer(plateau25, nb_resultats=200)[0]

    return indices


def get_message(communication_socket):

    communication_socket.settimeout(5)

    try:
        chunks = []

        while True:
            chunk = communication_socket.recv(1024)

            if not chunk:
                break

            chunks.append(chunk)

            # Fin du message détectée
            if b"\n" in chunk:
                break

        message = b"".join(chunks).decode("utf-8").strip()

        if not message:
            raise ValueError("Message vide")

        data = json.loads(message)

    except:
        data = None

    return data
        

def main():

    host = "0.0.0.0"
    port = 8001

    serveur = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    serveur.bind((host, port))
    serveur.listen(5)

    list_SpyMaster = [
        create_SpyMaster('en'),
        create_SpyMaster('es'),
        create_SpyMaster('fr')
    ]

    while True:

        communication_socket, _  = serveur.accept()
        data = get_message(communication_socket)
    
        if data == None:
            continue

        if data['langue'] == 'en':
            indice = create_clue(data, list_SpyMaster[0])
        elif data['langue'] == 'es':
            indice = create_clue(data, list_SpyMaster[1])
        else:
            indice = create_clue(data, list_SpyMaster[2])

        response = {
            'clue': indice.mot,
            'number': indice.nombre
        }

        communication_socket.send(json.dumps(response).encode("utf-8"))
        communication_socket.close()


main()