FROM node:20-alpine AS builder

WORKDIR /usr/src/server

COPY tsconfig.base.json ./

WORKDIR /usr/src/server/apps/notification-service

COPY /apps/notification-service/package*.json ./
COPY /apps/notification-service/tsconfig.json ./

RUN npm install --include=dev

COPY /apps/notification-service/src ./src

RUN npm run build 

FROM node:20-alpine AS production

WORKDIR /usr/src/server/apps/notification-service

COPY /apps/notification-service/package*.json ./

ENV NODE_ENV=production

RUN npm install --omit=dev

COPY --from=builder /usr/src/server/apps/notification-service/dist ./dist

CMD [ "node", "dist/server.js" ]