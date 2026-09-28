#################################################################
##################### PODMAN DOCKER COMPABILITY #################
#################################################################

COMPOSE_FILE := docker-compose.yml
PROJECT      := transcendence

# podman-compose --in-pod=false : chaque service tourne dans son propre
# conteneur sur le reseau bridge partage (modele docker)
COMPOSE := podman-compose --in-pod=false
DC      := $(COMPOSE) -p $(PROJECT) -f $(COMPOSE_FILE)

#################################################################
################ PREPARATION  FOR STORAGE #######################
#################################################################
 
NEXT_DEV_PORT ?= 3000

UID   := $(shell id -u)
LOGIN := $(shell id -un)

STORE := $(strip $(if $(wildcard /goinfre/$(LOGIN)/.),\
           /goinfre/$(LOGIN)/containers,\
           $(HOME)/.local/share/containers/storage))

STORAGE_CONF := $(CURDIR)/.podman/storage.conf
export CONTAINERS_STORAGE_CONF := $(STORAGE_CONF)

#################################################################
##################### RULES #####################################
#################################################################

all:
	$(MAKE) up

check_env:
	@test -f .env || { echo "Erreur : File .env missing"; exit 1; }

storage:
	@mkdir -p $(dir $(STORAGE_CONF)) $(STORE)
	@printf '[storage]\ndriver = "overlay"\nrunroot = "/run/user/%s"\ngraphroot = "%s"\n' \
		'$(UID)' '$(STORE)' > $(STORAGE_CONF)
	@systemctl --user enable --now podman.socket 2>/dev/null || true # necessary for cadvisor

up: check_env storage
	$(DC) up -d --build --remove-orphans

down: storage
	$(DC) down --remove-orphans

re: down up

build: storage
	$(DC) build

logs: storage
	$(DC) logs -f --tail=200

ps: storage
	$(DC) ps

#################################################################
##################### APPLICATION NEXT ##########################
#################################################################

# Use `make dev` to lauch the front end without passing throught Nginx and with auto-update on
# (change the static website, it will be update without compiling again)
dev: check_env storage
	$(DC) --profile dev up -d --build next-dev
	@echo "Mode developpement : http://localhost:$(NEXT_DEV_PORT)"

dev-logs: storage
	$(DC) --profile dev logs -f --tail=200 next-dev

dev-down: storage
	$(DC) --profile dev rm -sf next-dev

next-reload: storage
	$(DC) rm -sf next
	$(DC) up -d --build --no-deps next
	podman kill -s HUP nginx

next-shell: storage
	$(DC) exec next sh

next-logs: storage
	$(DC) logs -f --tail=200 next

clean: down

fclean: storage
	$(DC) down -v --rmi all --remove-orphans
	podman image prune -a -f

info: storage
	@echo "store   : $(STORE)"
	@podman info --format 'graphroot: {{.Store.GraphRoot}}{{"\n"}}volumes  : {{.Store.VolumePath}}'

.PHONY: storage check_env up down re build logs ps clean fclean info \
        next-shell next-logs dev dev-logs dev-down next-reload
