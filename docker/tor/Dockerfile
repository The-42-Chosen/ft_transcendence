FROM alpine:3.24

RUN apk add --no-cache tor && \
    mkdir -p /var/lib/tor/hidden_service && \
    chown -R tor:tor /var/lib/tor && \
    chmod 700 /var/lib/tor/hidden_service

COPY torrc /etc/tor/torrc

USER tor

CMD ["tor", "-f", "/etc/tor/torrc"]