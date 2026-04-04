import type { UserRole } from "~/graphql/types";

export type AppNavigationItem = {
  title: string;
  href: string;
  description: string;
  roles?: UserRole[];
};

export const APP_NAVIGATION: AppNavigationItem[] = [
  {
    title: "Дашборд",
    href: "/dashboard",
    description: "Оперативная сводка по системе"
  },
  {
    title: "Закупки",
    href: "/procurements",
    description: "Реестр закупок и фильтры"
  },
  {
    title: "Источники",
    href: "/sources",
    description: "Состояние подключённых источников"
  },
  {
    title: "Запуски",
    href: "/jobs",
    description: "Журнал запусков и ошибок"
  },
  {
    title: "Отчёты",
    href: "/reports",
    description: "Актуальные аналитические отчёты"
  },
  {
    title: "Пользователи",
    href: "/users",
    description: "Роли и доступ пользователей",
    roles: ["ADMIN"]
  }
];
