FROM node:16.18.0-slim AS builder

WORKDIR /app

COPY ./package*.json /app/
RUN npm ci

COPY ./tsconfig*.json /app/
COPY ./src /app/src
RUN npm run build

RUN npm prune --omit=dev


FROM node:16.18.0-slim

ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/node_modules/ ./node_modules/

CMD ["node", "dist/server.js"]

EXPOSE 3000