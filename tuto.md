# Tuto

Podman **rootless** + `podman-compose` avec une logique réseau **docker-like**
(bridge + DNS par nom de service). Comment ajouter des briques sans rien casser.

---

## 1. Ajouter un service

Un service = un conteneur. On l'ajoute sous `services:` dans
`docker-compose.yml` :

```yaml
  db:
    image: docker.io/library/postgres:16-alpine
    container_name: transcendence_db
    environment:
      POSTGRES_USER: ${DB_USER:-transcendence}
      POSTGRES_PASSWORD: ${DB_PASSWORD:?renseigne DB_PASSWORD dans .env}
      POSTGRES_DB: ${DB_NAME:-transcendence}
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - transcendence          # OBLIGATOIRE
    restart: unless-stopped

volumes:                       # à ajouter dès qu'on a un volume nommé
  db_data:
```

À retenir :

- **`networks: [transcendence]`** sur *chaque* service, sinon il est isolé.
- **DNS par nom de service** : depuis un autre conteneur, la DB est joignable à
  `db` (`postgres://db:5432`). Jamais par IP, et pas par `container_name`.
- **`${VAR:-defaut}`** = valeur par défaut ; **`${VAR:?message}`** = erreur si
  non définie (bien pour un mot de passe). Les valeurs viennent de `.env`
  (pense à mettre à jour `.env.example`).

Pour du code maison, on remplace `image:` par `build:` :

```yaml
  backend:
    build:
      context: ./dossier_contenant_le_Dockerfile
    depends_on: [db]
    networks: [transcendence]
```

---

## 2. Volumes : lequel choisir

| Besoin | Solution | Nettoyage |
|---|---|---|
| Config / contenu statique que tu édites | bind mount `:ro` (`./docker/nginx/html:/usr/share/nginx/html:ro`) | rien |
| Données applicatives (DB) | **volume nommé** (`db_data:/var/lib/...`) | `make fclean` |
| Inspecter le fichier depuis l'hôte | bind mount rw (`./data:/app/data`) | `podman unshare rm -rf ./data` |

**Par défaut : volume nommé.** Le Makefile place le stockage podman dans
`/goinfre/<login>/containers` (voir section 3) → les volumes nommés sont
persistants entre `down`/`up`, hors quota NFS, et supprimés proprement par
`make fclean` (`down -v`), sans galère de permissions rootless.

Cas particulier nginx : `./docker/nginx/templates` est monté `:ro`, mais le conteneur
écrit le résultat d'`envsubst` dans `/etc/nginx/conf.d` (interne à l'image). D'où
l'absence de montage sur `conf.d` — les deux se marcheraient dessus.

⚠️ `/goinfre` est local à la machine et purgé régulièrement par 42 : les données
survivent à un `make down`, pas forcément à un changement de poste.

---

## 3. Le Makefile

**`fclean` vide vraiment le store** : `--rmi all` supprime les images qu'on build
(nginx) *et* celles simplement téléchargées (postgres...). Le prochain `make up`
regénère donc un certificat TLS neuf.

Deux détails du Makefile qui méritent une explication :

- **`COMPOSE ?= podman-compose --in-pod=false`**
  Par défaut podman-compose met tous les services dans un même *pod* : ils
  partagent le même namespace réseau, donc les mêmes ports (collisions) et on
  perd le modèle « un réseau bridge, un DNS par service ». `--in-pod=false`
  donne à chaque service son propre conteneur sur le bridge partagé : exactement
  le modèle Docker. Le `?=` permet de surcharger depuis la ligne de commande,
  ex. `make up COMPOSE="podman compose"`.

  À ne pas confondre : `docker` existe sur ces machines mais c'est un simple
  script de 4 lignes (paquet `podman-docker`) qui fait `exec podman "$@"` —
  Docker Engine n'est pas installé. En revanche `docker-compose` n'existe pas
  du tout : `podman-compose` est une réimplémentation Python indépendante, avec
  ses propres bugs. C'est de là que vient le `--in-pod=false`.

- **La cible `storage`, dont dépendent toutes les autres**
  Par défaut podman range ses images dans `~/.local/share/containers` — c'est-à-dire
  dans le home NFS, **sous quota de ce qu'on a en place memoire**  
  La parade habituelle est un `~/.config/containers/storage.conf` posé à la main,
  mais il est local à la machine : absent ailleurs, et impossible à ajouter après
  coup sans un `podman system reset` destructeur (podman refuse de démarrer avec
  « database graph root does not match »).

  Donc le Makefile ne parie pas dessus : il **génère lui-même** `.podman/storage.conf`
  et le passe par `CONTAINERS_STORAGE_CONF`, qui est prioritaire sur la conf du
  home. Le fichier est réécrit à chaque `make` — contenu déterministe, donc
  idempotent et jamais obsolète si tu changes de machine ou de login.

  Le chemin est choisi automatiquement : `/goinfre/<login>/containers` si
  `/goinfre/<login>` existe (machines 42), sinon le chemin par défaut de podman
  (machine perso, CI). Rien à installer, rien à configurer : `make up` suffit sur
  n'importe quelle machine. `make info` te dit où ça pointe.

---

## 4. Checklist pour faire un ajout

1. Service ajouté sous `services:`.
2. `networks: [transcendence]`.
3. Persistance ? → volume nommé, déclaré sous `volumes:` en bas du fichier.
4. Secrets/config → `${...}` + `.env` (+ `.env.example`).
5. `make re` puis `make logs` pour vérifier.
