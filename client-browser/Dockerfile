FROM node:16.18.0-slim

WORKDIR /app

COPY ./package*.json /app/
RUN npm ci

COPY ./tsconfig*.json /app/
COPY ./src /app/src
COPY ./public /app/public

CMD ["npm", "run", "start"]

EXPOSE 3000