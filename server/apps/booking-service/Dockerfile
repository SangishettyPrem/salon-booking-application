FROM node:20-alpine AS builder

WORKDIR /usr/src/server

COPY tsconfig.base.json ./

COPY apps/booking-service/package*.json ./apps/booking-service/
COPY apps/booking-service/tsconfig.json ./apps/booking-service/

WORKDIR /usr/src/server/apps/booking-service

RUN npm install --include=dev

COPY apps/booking-service/src ./src

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/server

ENV NODE_ENV=production

COPY apps/booking-service/package*.json ./apps/booking-service/

WORKDIR /usr/src/server/apps/booking-service

RUN npm install --omit=dev

COPY --from=builder /usr/src/server/apps/booking-service/dist ./dist

EXPOSE 5003

CMD ["node", "dist/server.js"]