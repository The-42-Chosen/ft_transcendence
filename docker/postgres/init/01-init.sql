-- Script d'initialisation execute au premier demarrage du conteneur
-- (uniquement si le volume de donnees est vide).
-- Pour l'instant : une simple table temoin pour verifier que l'init fonctionne.

CREATE TABLE IF NOT EXISTS healthcheck (
    id SERIAL PRIMARY KEY,
    initialized_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO healthcheck DEFAULT VALUES;
