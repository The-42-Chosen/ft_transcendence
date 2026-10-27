#!/usr/bin/env bash
# Attend que toutes les conditions soient vraies en meme temps.
#
# Usage : wait-all.sh <timeout_en_secondes> "<nom>=<commande>" ...

set -u

timeout="$1"
shift

declare -A pending
order=()
for spec in "$@"; do
    name="${spec%%=*}"
    pending["$name"]="${spec#*=}"
    order+=("$name")
done

start=$(date +%s)
last_report=0

while :; do
    for name in "${order[@]}"; do
        [ -n "${pending[$name]+x}" ] || continue
        output=$(bash -c "${pending[$name]}" 2>&1)
        rc=$?
        if [ "$rc" -eq 0 ]; then
            echo "OK   $name ($(( $(date +%s) - start ))s)"
            unset 'pending[$name]'
        elif [ "$rc" -eq 2 ]; then
            echo "::error::echec definitif : $name"
            echo "$output" | tail -n 30
            exit 1
        fi
    done

    if [ "${#pending[@]}" -eq 0 ]; then
        echo "Toutes les conditions sont remplies en $(( $(date +%s) - start ))s"
        exit 0
    fi

    elapsed=$(( $(date +%s) - start ))
    if [ "$elapsed" -ge "$timeout" ]; then
        echo "::error::conditions toujours en echec apres ${timeout}s : ${!pending[*]}"
        for name in "${order[@]}"; do
            [ -n "${pending[$name]+x}" ] || continue
            echo "--- $name"
            bash -c "${pending[$name]}" 2>&1 | tail -n 30
        done
        exit 1
    fi

    if [ $(( elapsed - last_report )) -ge 15 ]; then
        echo "...  ${elapsed}s, en attente de : ${!pending[*]}"
        last_report=$elapsed
    fi
    sleep 3
done
