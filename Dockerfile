# Frontend Dockerfile - Next.js (App Router), multi-stage build.
#
# NEXT_PUBLIC_* variables are inlined into the JS bundle at BUILD time,
# not read at container startup - so NEXT_PUBLIC_API_URL has to be
# passed as a --build-arg, not just -e at `docker run` time.
#
# Build (from the frontend/ folder, next to package.json):
#   docker build \
#     --build-arg NEXT_PUBLIC_API_URL=https://your-backend-url \
#     -t graveyard-frontend .
#
# Run:
#   docker run -p 3000:3000 graveyard-frontend
#
# Requires output: "standalone" in next.config.ts (see next.config.ts
# provided alongside this file).

# ---- deps: install dependencies only ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: build the app ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runner: minimal production image ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
