# syntax=docker/dockerfile:1

################################################################################
# 1. Dependances
################################################################################
FROM docker.io/library/node:22-alpine AS deps
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN n=1; until corepack install && pnpm --version; do \
        [ "$n" -ge 3 ] && exit 1; \
        echo "pnpm : tentative $n/3 echouee, nouvelle tentative dans 5 s"; \
        n=$((n+1)); sleep 5; \
    done && \
    pnpm install --frozen-lockfile

################################################################################
# 2. Build
################################################################################
FROM deps AS builder
COPY . .
RUN corepack install && pnpm run build

################################################################################
# 3. Developpement (auto-update)
################################################################################
FROM deps AS dev

ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["pnpm", "dev"]

################################################################################
# 4. Execution
################################################################################
FROM docker.io/library/node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
