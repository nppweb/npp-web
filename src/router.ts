import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { pinia } from "./stores";
import DashboardPage from "./views/DashboardPage.vue";
import JobsPage from "./views/JobsPage.vue";
import LoginPage from "./views/LoginPage.vue";
import ProcurementDetailPage from "./views/ProcurementDetailPage.vue";
import ProcurementsPage from "./views/ProcurementsPage.vue";
import ReportsPage from "./views/ReportsPage.vue";
import SourcesPage from "./views/SourcesPage.vue";
import UsersPage from "./views/UsersPage.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard"
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: {
      public: true,
      title: "Вход",
      description: "Авторизация в платформе мониторинга закупок"
    }
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardPage,
    meta: {
      requiresAuth: true,
      title: "Дашборд",
      description: "Оперативная сводка по закупкам, источникам и запускам"
    }
  },
  {
    path: "/procurements",
    name: "procurements",
    component: ProcurementsPage,
    meta: {
      requiresAuth: true,
      title: "Закупки",
      description: "Единый список закупок с фильтрами и переходом в карточку"
    }
  },
  {
    path: "/procurements/:id",
    name: "procurement-detail",
    component: ProcurementDetailPage,
    meta: {
      requiresAuth: true,
      title: "Карточка закупки",
      description: "Детальная информация о выбранной закупке"
    }
  },
  {
    path: "/sources",
    name: "sources",
    component: SourcesPage,
    meta: {
      requiresAuth: true,
      title: "Источники",
      description: "Реестр подключенных источников и состояние их публикаций"
    }
  },
  {
    path: "/jobs",
    name: "jobs",
    component: JobsPage,
    meta: {
      requiresAuth: true,
      title: "Запуски",
      description: "Журнал запусков сбора и публикации данных"
    }
  },
  {
    path: "/reports",
    name: "reports",
    component: ReportsPage,
    meta: {
      requiresAuth: true,
      title: "Отчеты",
      description: "Состояние аналитических отчетов и их готовность"
    }
  },
  {
    path: "/users",
    name: "users",
    component: UsersPage,
    meta: {
      requiresAuth: true,
      roles: ["ADMIN"],
      title: "Пользователи",
      description: "Управление доступом и ролями пользователей платформы"
    }
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard"
  }
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia);
  await authStore.initialize();
  const requiresAuth = Boolean(to.meta.requiresAuth);

  if (to.name === "login" && authStore.isAuthenticated) {
    return { name: "dashboard" };
  }

  if (!requiresAuth) {
    return true;
  }

  if (!authStore.isAuthenticated) {
    return {
      name: "login",
      query: { redirect: to.fullPath }
    };
  }

  if (
    Array.isArray(to.meta.roles) &&
    authStore.user &&
    !to.meta.roles.includes(authStore.user.role)
  ) {
    return { name: "dashboard" };
  }

  return true;
});
