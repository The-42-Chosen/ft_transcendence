import socket
import json
import sys
from pathlib import Path

from codenames_ia import (
    Embeddings, MaitreEspion, Plateau, Reglages,
    construire_candidats, charger_dictionnaire
)

host = "0.0.0.0"
port = 8001

serveur = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
serveur.bind((host, port))
print("Serveur is open")
serveur.listen(5)


while True:
    communication_socket, adress  = serveur.accept()
    print(f"Connected to {adress}")
    
    message = communication_socket.recv(1024).decode("utf-8")
    print(f"Message from client is: {message}")

    communication_socket.send("Message recived\n".encode())

    try:
        message_dict = json.loads(message)
    except:
        print("Error: wrong message input")
        communication_socket.close()
        sys.exit(1)

    langue = message_dict['langue']

    dictionnaire_fr = Path(f"dictionnaires/{langue}.dic")
    chemin = Path(f"vecteurs/cc.{langue}.300.top100000.npz")
    emb = Embeddings.charger(chemin)
    dictionnaire = charger_dictionnaire(dictionnaire_fr) if dictionnaire_fr.exists() else None
    candidats = construire_candidats(emb, nb_max=30_000, dictionnaire=dictionnaire)

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

    list_team = message_dict['list_team']
    list_adverse = message_dict['list_adverse']
    assassin_word = message_dict['assassin_word']
    list_neutral = message_dict['list_neutral']

    plateau25 = Plateau(
        equipe=list_team,
        adverses=list_adverse,
        neutres=list_neutral,
        assassin=assassin_word,
    )
    
    indices = maitre.proposer(plateau25, nb_resultats=200)[0]
    
    response = {
        'guess': indices.mot,
        'number': indices.nombre
    }

    print(response)
    communication_socket.send(json.dumps(response).encode("utf-8"))
    communication_socket.close()

    print(f"Connection close with {adress}")