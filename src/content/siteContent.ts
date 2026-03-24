export const siteMeta = {
  organizationName: "AIMSORA",
  organizationTagline: "Open Intelligence Lab",
  organizationUrl: "https://github.com/aimsora",
  sourceUrl: "https://github.com/aimsora/.github",
  featuredRepositoryUrl: "https://github.com/aimsora/frontend-app"
} as const;

export const capabilities = [
  {
    title: "Сбор Открытых Источников",
    text: "Автоматизированный сбор данных с ЭТП, отраслевых порталов, новостных и рыночных источников.",
    metric: "24/7 ingestion"
  },
  {
    title: "Контрагентная Аналитика",
    text: "Профилирование поставщиков, динамика активности, базовые риск-сигналы и аномалии.",
    metric: "risk signals"
  },
  {
    title: "Нормализация И Обогащение",
    text: "Приведение сырых данных к доменной модели для последующей отчетности и BI-сценариев.",
    metric: "ETL-ready"
  },
  {
    title: "Поддержка Решений",
    text: "Единый интерфейс и API для ускорения закупочных и договорных управленческих решений.",
    metric: "action-first"
  }
] as const;

export const repositories = [
  {
    name: "frontend-app",
    role: "Веб-интерфейс пользователей: поиск, фильтры, витрины аналитики.",
    url: "https://github.com/aimsora/frontend-app"
  },
  {
    name: "backend-api",
    role: "GraphQL API и бизнес-логика платформы.",
    url: "https://github.com/aimsora/backend-api"
  },
  {
    name: "scraper-service",
    role: "Сервис парсинга открытых источников на Playwright.",
    url: "https://github.com/aimsora/scraper-service"
  },
  {
    name: "processing-worker",
    role: "Асинхронная обработка, нормализация и обогащение данных.",
    url: "https://github.com/aimsora/processing-worker"
  },
  {
    name: "shared-contracts",
    role: "Общие GraphQL и JSON Schema контракты между сервисами.",
    url: "https://github.com/aimsora/shared-contracts"
  },
  {
    name: "deployment-infra",
    role: "Инфраструктура и деплойный контур через Docker Compose.",
    url: "https://github.com/aimsora/deployment-infra"
  }
] as const;

export const architectureLayers = [
  "Уровень интерфейса: frontend-app (Nuxt SPA)",
  "Уровень бизнес-логики: backend-api (NestJS + GraphQL)",
  "Уровень сбора данных: scraper-service (Playwright)",
  "Уровень обработки: processing-worker (RabbitMQ consumers)",
  "Уровень контрактов: shared-contracts (GraphQL + JSON Schema)",
  "Инфраструктурный уровень: deployment-infra (PostgreSQL, Redis, RabbitMQ, MinIO)"
] as const;

export const deployFlow = [
  "Публикация версии контрактов в shared-contracts (tag SemVer)",
  "Обновление инфраструктуры из deployment-infra",
  "Сборка и деплой backend-api через GitHub Actions",
  "Сборка и деплой processing-worker через GitHub Actions",
  "Сборка и деплой scraper-service через GitHub Actions",
  "Сборка и деплой frontend-app через GitHub Actions"
] as const;

export const platformFlow = [
  "Сбор данных из открытых источников",
  "Публикация raw-событий в RabbitMQ",
  "Нормализация и валидация сообщений worker-сервисом",
  "Сохранение и аналитическая выдача через backend-api"
] as const;
