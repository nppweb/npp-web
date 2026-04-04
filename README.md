# aimsora

Frontend AIMSORA переписан на `Nuxt 3 + TypeScript + Tailwind CSS + Radix Vue + Apollo GraphQL`.
Интерфейс стартует с авторизации и после входа открывает защищённый dashboard со страницами закупок, источников, запусков, отчётов и пользователей.

## Локальный запуск

1. Подними `backend-api` и базу данных.
2. Убедись, что сервер применил миграции и seed с тестовыми пользователями.
3. Установи зависимости и запусти frontend:

```bash
npm install
npm run dev
```

По умолчанию приложение доступно на `http://localhost:4173`.

## Переменные окружения

- `NUXT_PUBLIC_GRAPHQL_ENDPOINT`
  Публичный GraphQL endpoint для frontend-клиента. По умолчанию `/graphql`.
- `NUXT_GRAPHQL_PROXY_TARGET`
  Используется в dev-режиме для проксирования запросов в backend. По умолчанию `http://localhost:3000`.

Пример:

```bash
NUXT_PUBLIC_GRAPHQL_ENDPOINT=/graphql
NUXT_GRAPHQL_PROXY_TARGET=http://localhost:3000
```

## Маршруты

- `/` — редирект на `/login` или `/dashboard` в зависимости от сессии
- `/login` — публичная страница входа
- `/dashboard` — основной dashboard
- `/procurements` — список закупок
- `/procurements/:id` — карточка закупки
- `/sources` — источники и последние запуски
- `/jobs` — журнал запусков
- `/reports` — список отчётов
- `/users` — управление пользователями, доступно только `ADMIN`

## Тестовый вход

В dev-режиме на странице `/login` показываются тестовые данные:

- `admin@admin.ru / admin`

## Что проверить вручную

1. `/` корректно редиректит на `/login` или `/dashboard`.
2. Успешный вход переводит на `/dashboard`.
3. После обновления страницы сессия сохраняется, если refresh token валиден.
4. `ADMIN` видит `/users`, остальные пользователи автоматически уводятся на `/dashboard`.
5. `logout` очищает сессию и возвращает на `/login`.
6. На страницах `dashboard`, `procurements`, `sources`, `jobs`, `reports`, `users` работают `loading / empty / error` состояния.

## Проверка качества

```bash
npm run typecheck
npm run build
```

После production-сборки приложение можно поднять из `.output`:

```bash
node .output/server/index.mjs
```

## Docker

`Dockerfile` переведён на Nuxt runtime и собирает `.output` с запуском через Node server.
