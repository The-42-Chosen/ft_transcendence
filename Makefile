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

all: up

storage:
	@mkdir -p $(dir $(STORAGE_CONF)) $(STORE)
	@printf '[storage]\ndriver = "overlay"\nrunroot = "/run/user/%s"\ngraphroot = "%s"\n' \
		'$(UID)' '$(STORE)' > $(STORAGE_CONF)
	@systemctl --user enable --now podman.socket 2>/dev/null || true # necessary for cadvisor

up: storage
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

clean: down

fclean: storage
	$(DC) down -v --rmi all --remove-orphans
	podman image prune -a -f

info: storage
	@echo "store   : $(STORE)"
	@podman info --format 'graphroot: {{.Store.GraphRoot}}{{"\n"}}volumes  : {{.Store.VolumePath}}'

.PHONY: storage up down re build logs ps clean fclean info
