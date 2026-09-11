FROM node:20-alpine AS builder

WORKDIR /usr/src/server/keys
COPY ./keys ./

WORKDIR /usr/src/server

COPY tsconfig.base.json ./

WORKDIR /usr/src/server/apps/api-gateway

COPY apps/api-gateway/package*.json ./
COPY apps/api-gateway/tsconfig.json ./

RUN npm install --include=dev

COPY apps/api-gateway/src ./src

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/server/keys
COPY --from=builder /usr/src/server/keys ./

WORKDIR /usr/src/server/apps/api-gateway

COPY /apps/api-gateway/package*.json ./

RUN npm install 

COPY --from=builder /usr/src/server/apps/api-gateway/dist ./dist

ENV NODE_ENV=production

EXPOSE 5000

CMD [ "node", "dist/server.js" ]