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
 
NEXT_DEV_PORT ?= $(or $(shell sed -n 's/^NEXT_DEV_PORT=//p' .env 2>/dev/null),3000)

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

NEXT_RECREATE = podman rm -f -i --depend next && podman rm -f -i next && \
                $(DC) up -d --no-deps next nginx nginx-exporter

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
	$(DC) build
	@if [ -n "$$(podman ps -aq -f name='^next$$')" ] && \
	   [ "$$(podman inspect -f '{{.Image}}' next)" != "$$(podman image inspect -f '{{.Id}}' $(PROJECT)_next)" ]; then \
		echo "Next image has changed : container recreated"; \
		$(NEXT_RECREATE); \
	fi
	$(DC) up -d --remove-orphans

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
	$(DC) --profile dev build next-dev
	podman rm -f -i next-dev
	@# volumes recreated
	podman volume rm -f $(PROJECT)_next_dev_node_modules
	$(DC) --profile dev up -d next-dev
	@echo "Mode developpement : http://localhost:$(NEXT_DEV_PORT)"

dev-logs: storage
	$(DC) --profile dev logs -f --tail=200 next-dev

dev-down: storage
	podman rm -f -i next-dev

next-reload: storage
	$(DC) build next
	$(NEXT_RECREATE)

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
