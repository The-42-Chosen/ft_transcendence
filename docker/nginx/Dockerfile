FROM docker.io/library/nginx:alpine

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
        -keyout /etc/nginx/certs/key.pem \
        -out    /etc/nginx/certs/cert.pem \
        -subj   "/C=FR/ST=IDF/L=Paris/O=42/OU=ft_transcendence/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" && \
    chmod 600 /etc/nginx/certs/key.pem && \
    apk del openssl

EXPOSE 80 443
