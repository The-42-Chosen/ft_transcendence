FROM docker.io/library/postgres:16-alpine

COPY init/ /docker-entrypoint-initdb.d/
COPY pg_hba.conf /etc/postgresql/pg_hba.conf

EXPOSE 5432
