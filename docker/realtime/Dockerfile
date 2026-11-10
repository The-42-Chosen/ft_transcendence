FROM docker.io/library/node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN corepack install && pnpm install --frozen-lockfile --prod

COPY src ./src

USER node
EXPOSE 3001

CMD ["node", "src/server.ts"]
