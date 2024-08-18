## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Создание админа

```
 npx ts-node create-admin.ts
```

Логин admin пароль 1, потом надо поменять

## Миграция

```
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:generate -d src/data-source.ts src/migrations/AddKeywordsColumnToPost
```

start migration

```
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:run -d src/data-source.ts

```
