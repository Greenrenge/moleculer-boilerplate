FROM node:14-alpine as build-deps

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --no-audit --no-fund

FROM node:14-alpine
WORKDIR /app

COPY --from=build-deps /app/node_modules node_modules

COPY configs configs
COPY src src
COPY test test

COPY migrations migrations
COPY migrate-mongo-config.js migrate-mongo-config.js

COPY seeds seeds

COPY package.json package.json
COPY package-lock.json package-lock.json

COPY .eslintrc.cjs .eslintrc.cjs
COPY .eslintignore .eslintignore
COPY .prettierrc .prettierrc

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
