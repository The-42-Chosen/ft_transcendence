FROM docker.io/library/node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN n=1; until corepack install && pnpm --version; do \
        [ "$n" -ge 3 ] && exit 1; \
        echo "pnpm : tentative $n/3 echouee, nouvelle tentative dans 5 s"; \
        n=$((n+1)); sleep 5; \
    done && \
    pnpm install --frozen-lockfile --prod

COPY src ./src

USER node
EXPOSE 3001

CMD ["node", "src/server.ts"]
