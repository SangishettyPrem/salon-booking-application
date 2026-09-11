FROM node:20-alpine AS builder

WORKDIR /usr/src/server

COPY tsconfig.base.json ./

WORKDIR /usr/src/server/apps/payment-service

COPY /apps/payment-service/package*.json ./
COPY /apps/payment-service/tsconfig.json ./

RUN npm install --include=dev

COPY /apps/payment-service/src ./src

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/server/payment-service

COPY apps/payment-service/package*.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/server/apps/payment-service/dist ./dist

ENV NODE_ENV=production

EXPOSE 5004

CMD ["node", "dist/server.js"]