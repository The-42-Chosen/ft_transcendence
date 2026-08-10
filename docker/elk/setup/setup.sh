#!/usr/bin/env bash
# Configuration initiale d'Elasticsearch :
# politique de retention (ILM) + d'archivage (snapshots + SLM).
set -euo pipefail

ES="http://elasticsearch:9200"
AUTH="elastic:${ELASTIC_PASSWORD}"

req() {
    local method="$1" path="$2" body="${3:-}"
    if [ -n "$body" ]; then
        curl -fsS -u "$AUTH" -X "$method" "$ES$path" \
            -H 'Content-Type: application/json' -d "$body"
    else
        curl -fsS -u "$AUTH" -X "$method" "$ES$path"
    fi
    echo
}

echo "[elk-setup] attente d'Elasticsearch..."
until curl -fsS -u "$AUTH" "$ES/_cluster/health?wait_for_status=yellow&timeout=5s" >/dev/null 2>&1; do
    sleep 5
done
echo "[elk-setup] Elasticsearch est pret"

echo "[elk-setup] mot de passe du compte kibana_system"
req POST "/_security/user/kibana_system/_password" \
    "{\"password\": \"${KIBANA_SYSTEM_PASSWORD}\"}"

echo "[elk-setup] role logstash_writer (moindre privilege : ecriture sur transcendence-logs* uniquement)"
req PUT "/_security/role/logstash_writer" '{
  "cluster": ["monitor", "manage_index_templates", "manage_ilm"],
  "indices": [{
    "names": ["transcendence-logs*"],
    "privileges": ["write", "create", "create_index", "manage", "manage_ilm"]
  }]
}'

echo "[elk-setup] utilisateur logstash_internal"
req PUT "/_security/user/logstash_internal" "{
  \"password\": \"${LOGSTASH_INTERNAL_PASSWORD}\",
  \"roles\": [\"logstash_writer\"],
  \"full_name\": \"Compte technique Logstash\"
}"

echo "[elk-setup] politique ILM transcendence-logs (rollover 1g/1j, suppression a 30j)"
req PUT "/_ilm/policy/transcendence-logs" '{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": { "max_primary_shard_size": "1gb", "max_age": "1d" }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": { "delete": {} }
      }
    }
  }
}'

echo "[elk-setup] depot de snapshots (archivage sur volume persistant)"
req PUT "/_snapshot/transcendence_archive" '{
  "type": "fs",
  "settings": { "location": "/usr/share/elasticsearch/data/snapshots" }
}'

echo "[elk-setup] politique SLM : snapshot quotidien a 2h30, retention 90j"
req PUT "/_slm/policy/transcendence-nightly" '{
  "schedule": "0 30 2 * * ?",
  "name": "<transcendence-logs-{now/d}>",
  "repository": "transcendence_archive",
  "config": { "indices": ["transcendence-logs*"] },
  "retention": { "expire_after": "90d", "min_count": 5, "max_count": 50 }
}'

echo "[elk-setup] configuration terminee"
