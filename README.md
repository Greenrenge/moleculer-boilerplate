# Research

https://www.apollographql.com/tutorials/voyage-part1/01-intro-to-federation

# README

## Getting started

use `npm start` to start development server

```bash
npm start
```

use `npm run build` then `npm run start:prod` to start production server

```bash
npm run build
npm run start:prod
```

## ESLint

to fix eslint error, you can run

```bash
npm run lint -- --fix
```

## Test

use `npm test` to run normal test

use `npm run test:watch` to run test on every code changes

```bash
npm run test
npm run test:watch
```

## Database Migrateion

use `npm run migrate:create` to start new migration file by using this command

```
// create a new database migration with the provided description
npm run migrate:create [options] [description]
```

use `npm run migrate:up` to run all pending database migrations

```
npm run migrate:up [options]
```

use `npm run migrate:down` to undo the last applied database migration

```
npm run migrate:up [options]
```

use `npm run migrate:status` to print the changelog of the database

```
npm run migrate:status [options]
```
