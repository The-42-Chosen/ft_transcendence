#!/usr/bin/env bash

set -u

[ "$#" -gt 0 ] || set -- next kibana grafana ia postgres

metric() {
    case "$1" in
        next|kibana|ia) echo "probe_success{probe=\"$1\"}" ;;  # sonde blackbox
        grafana)        echo 'up{job="grafana"}' ;;            # scrape direct de /metrics
        postgres)       echo 'pg_up' ;;                        # via postgres-exporter
        *)              return 1 ;;
    esac
}

# alerte de alerts.yml qui correspond a chaque service
alert() {
    case "$1" in
        next|kibana|ia) echo "ALERTS{alertname=\"ProbeFailed\",probe=\"$1\"}" ;;
        grafana)        echo 'ALERTS{alertname="ServiceDown",job="grafana"}' ;;
        postgres)       echo 'ALERTS{alertname="PostgresDown"}' ;;
    esac
}

# etat courant de l'alerte : vide, "pending" ou "firing"
alert_state() {
    podman exec prometheus wget -qO- --post-data "query=$(alert "$1")" \
        localhost:9090/api/v1/query 2>/dev/null \
        | sed -n 's/.*"alertstate":"\([a-z]*\)".*/\1/p'
}

# ALERT=1 : garde le service coupe jusqu'a ce que l'alerte soit "firing"
# (1 a 2 min selon le "for:" de la regle), au lieu de relancer tout de suite.
wait_firing() {
    local i state last=""
    for i in $(seq 60); do
        state=$(alert_state "$1")
        if [ "$state" != "$last" ] && [ -n "$state" ]; then
            echo "  alerte  -> $(alert "$1") : $state  (apres $(( $(date +%s) - start )) s)"
            last="$state"
        fi
        [ "$state" = "firing" ] && return 0
        sleep 5
    done
    echo "  alerte  -> ERREUR : $(alert "$1") jamais \"firing\""
    return 1
}

value() {
    podman exec prometheus wget -qO- --post-data "query=$(metric "$1")" \
        localhost:9090/api/v1/query 2>/dev/null \
        | sed -n 's/.*"value":\[[^,]*,"\([01]\)"\].*/\1/p'
}

wait_value() {
    local i
    for i in $(seq 40); do
        [ "$(value "$1")" = "$2" ] && return 0
        sleep 3
    done
    return 1
}

restart() {
    podman stop -t 0 "$1" >/dev/null 2>&1 
    podman start "$1" >/dev/null
    podman exec nginx nginx -s reload >/dev/null 2>&1
}

down=""
trap 'if [ -n "$down" ]; then echo; echo "  interruption : relance de $down"; restart "$down"; fi' EXIT
trap 'exit 130' INT TERM

for svc in "$@"; do
    if ! metric "$svc" >/dev/null; then
        echo "Erreur : service inconnu '$svc'. Choix : next kibana grafana ia postgres" >&2
        exit 2
    fi
done

rc=0
for svc in "$@"; do
    echo
    echo "== $svc =="

    if [ "$(value "$svc")" != "1" ]; then
        echo "  deja down avant le test : lance 'make crisis-restore'"
        rc=1
        continue
    fi

    down="$svc"
    start=$(date +%s)
    podman stop -t 10 "$svc" >/dev/null 2>&1
    if wait_value "$svc" 0; then
        echo "  coupe   -> Prometheus : $(metric "$svc") = 0  (down, vu en $(( $(date +%s) - start )) s)"
        if [ "${ALERT:-0}" = "1" ]; then
            wait_firing "$svc" || rc=1
        fi
    else
        echo "  coupe   -> ERREUR : Prometheus ne voit pas la panne"
        rc=1
    fi

    start=$(date +%s)
    restart "$svc"
    down=""
    if wait_value "$svc" 1; then
        echo "  relance -> Prometheus : $(metric "$svc") = 1  (up, vu en $(( $(date +%s) - start )) s)"
    else
        echo "  relance -> ERREUR : Prometheus ne revoit pas le service up"
        rc=1
    fi
done

exit $rc
