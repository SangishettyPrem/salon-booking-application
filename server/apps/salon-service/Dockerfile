FROM node:20-alpine AS builder 

WORKDIR /usr/src/server

COPY  tsconfig.base.json ./

WORKDIR /usr/src/server/apps/salon-service

COPY apps/salon-service/package*.json ./
COPY apps/salon-service/tsconfig.json ./

RUN npm install --include=dev

COPY apps/salon-service/src ./src

RUN npm run build 

FROM node:20-alpine AS production

WORKDIR /usr/src/server/apps/salon-service

COPY apps/salon-service/package*.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/server/apps/salon-service/dist ./dist

ENV NODE_ENV=production

EXPOSE 5002

CMD [ "node" ,"dist/server.js" ]