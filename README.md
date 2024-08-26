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

npm run migration:generate --name=create_user_table
npm run migration:run

Добавить в src/data-source.ts новые сущности если они есть, после этого запустить команды

Создание файл миграции

```
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:generate -d src/data-source.ts src/migrations/AddKeywordsColumnToPost
```

Запуск миграции

```
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli migration:run -d src/data-source.ts

```
