FROM docker.io/library/nginx:alpine

RUN n=1; until apk add --no-cache openssl; do \
        [ "$n" -ge 3 ] && exit 1; \
        echo "apk : tentative $n/3 echouee, nouvelle tentative dans 5 s"; \
        n=$((n+1)); sleep 5; \
    done && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
        -keyout /etc/nginx/certs/key.pem \
        -out    /etc/nginx/certs/cert.pem \
        -subj   "/C=FR/ST=IDF/L=Paris/O=42/OU=ft_transcendence/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
        -addext "basicConstraints=critical,CA:FALSE" \
        -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
        -addext "extendedKeyUsage=serverAuth" && \
    chmod 600 /etc/nginx/certs/key.pem && \
    apk del openssl

EXPOSE 80 443 8444
