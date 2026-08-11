#!/bin/sh
# Cree un utilisateur dedie en lecture seule pour postgres-exporter.
# Le role pg_monitor (integre a postgres) donne acces aux vues de
# statistiques (pg_stat_*) sans aucun droit sur les donnees.
# Execute uniquement au premier demarrage (volume vide), comme 01-init.sql.
set -e

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
    CREATE USER monitoring WITH PASSWORD '${POSTGRES_MONITORING_PASSWORD}';
    GRANT pg_monitor TO monitoring;
EOSQL
