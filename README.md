# aimsora

Frontend-репозиторий платформы AIMSORA. Здесь находится основной Vue 3 SPA для работы с GraphQL API: авторизация, дашборд, закупки, источники, джобы, отчеты и пользователи.

## Стек

- Vue 3 + TypeScript
- Vue Router
- Pinia
- Apollo Client
- Vite
- Nginx + Docker для production-сборки

## Структура

- `src/components/` - оболочка интерфейса и UI-компоненты
- `src/views/` - страницы операционного интерфейса
- `src/stores/` - состояние авторизации
- `src/services/` - Apollo client и GraphQL-запросы
- `Dockerfile`, `nginx.conf` - контейнеризация и SPA/proxy-конфигурация

## Локальная разработка

```bash
npm install
npm run dev
```

По умолчанию dev-сервер поднимается на `http://localhost:4173`.

Для работы с локальным API можно задать:

```bash
VITE_GRAPHQL_ENDPOINT=http://localhost:3000/graphql
```

## Сборка

```bash
npm run build
```

## Docker

Контейнер собирает статический bundle и отдает его через Nginx. Путь `/graphql` проксируется в `backend-api`, поэтому в docker-compose можно использовать относительный endpoint.

## Роль в платформе

- `aimsora` - пользовательский frontend платформы
- `backend-api` - GraphQL API и бизнес-логика
- `scraper-service` - сбор данных из открытых источников
- `processing-worker` - асинхронная обработка и нормализация
- `shared-contracts` - общие контракты GraphQL и событий
- `deployment-infra` - compose-окружение и deploy-контур
