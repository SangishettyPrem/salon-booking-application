FROM node:20-alpine AS builder

WORKDIR /usr/src/server

COPY tsconfig.base.json ./
COPY apps/auth-service/package*.json ./apps/auth-service/
COPY apps/auth-service/tsconfig.json ./apps/auth-service/

WORKDIR /usr/src/server/apps/auth-service

RUN npm install --include=dev

COPY apps/auth-service/src ./src

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/server/apps/auth-service

ENV NODE_ENV=production

COPY apps/auth-service/package*.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/server/apps/auth-service/dist ./dist

EXPOSE 5001

CMD ["node", "dist/server.js"]