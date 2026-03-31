import { createRouter, createWebHistory } from "vue-router";
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
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { public: true }
  },
  {
    path: "/",
    redirect: "/dashboard"
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/procurements",
    name: "procurements",
    component: ProcurementsPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/procurements/:id",
    name: "procurement-detail",
    component: ProcurementDetailPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/sources",
    name: "sources",
    component: SourcesPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/jobs",
    name: "jobs",
    component: JobsPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/reports",
    name: "reports",
    component: ReportsPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/users",
    name: "users",
    component: UsersPage,
    meta: { requiresAuth: true, roles: ["ADMIN"] }
  }
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to) => {
  const requiresAuth = Boolean(to.meta.requiresAuth);
  const accessToken = localStorage.getItem("aimsora.accessToken");
  const refreshToken = localStorage.getItem("aimsora.refreshToken");
  const user = localStorage.getItem("aimsora.user")
    ? JSON.parse(localStorage.getItem("aimsora.user") ?? "null")
    : null;

  if (!requiresAuth) {
    return true;
  }

  if (!accessToken && !refreshToken) {
    return { name: "login" };
  }

  if (Array.isArray(to.meta.roles) && user && !to.meta.roles.includes(user.role)) {
    return { name: "dashboard" };
  }

  return true;
});
