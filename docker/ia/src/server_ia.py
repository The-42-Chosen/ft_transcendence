from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from pathlib import Path

from codenames_ia import (
    Embeddings, MaitreEspion, Plateau, Reglages, Indice,
    construire_candidats, charger_dictionnaire,
    MOTS_OUTILS_EN, MOTS_OUTILS_ES, MOTS_OUTILS_FR
)

class Server(BaseHTTPRequestHandler):

    def __init__(self, list_SpyMaster):
        self.list_SpyMaster = list_SpyMaster

    def __call__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())

            print(json.dumps(data, indent=4))

            if data['langue'] == 'en':
                indice = create_clue(data, self.list_SpyMaster[0])
            elif data['langue'] == 'es':
                indice = create_clue(data, self.list_SpyMaster[1])
            else:
                indice = create_clue(data, self.list_SpyMaster[2])

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()

            response = {
                'clue': indice.mot,
                'number': indice.nombre
            }

            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            print(str(e))
            self.send_response(404)
            self.end_headers()
            self.wfile.write("Error".encode())


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


def main():

    host = "0.0.0.0"
    port = 8001

    list_SpyMaster = [
        create_SpyMaster('en'),
        create_SpyMaster('es'),
        create_SpyMaster('fr')
    ]

    # list_SpyMaster = [
    #     'en'
    #     'es'
    #     'fr'
    # ]

    try:
        httpd = HTTPServer((host,port), Server(list_SpyMaster))
        httpd.serve_forever()
    except:
        httpd.server_close()


main()