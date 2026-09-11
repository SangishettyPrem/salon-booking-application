# --- BUILD STAGE ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/server

# 1. Copy monorepo configuration file
COPY tsconfig.base.json ./

# 2. Copy application tracking manifests from real relative path routes
COPY apps/api-gateway/package*.json ./apps/api-gateway/
COPY apps/api-gateway/tsconfig.json ./apps/api-gateway/

# 3. Step into the API Gateway directory to build it
WORKDIR /usr/src/server/apps/api-gateway
RUN npm install --include=dev

# 4. Copy source files and compile down to the distribution folder
COPY apps/api-gateway/src ./src
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:20-alpine AS production

WORKDIR /usr/src/server/apps/api-gateway

# 5. Populate deployment configuration metrics
COPY apps/api-gateway/package*.json ./
RUN npm ci --only=production

# 6. Port over built application distributions out of the compilation stack
COPY --from=builder /usr/src/server/apps/api-gateway/dist ./dist

ENV NODE_ENV=production
EXPOSE 5000

CMD [ "node", "dist/server.js" ]
