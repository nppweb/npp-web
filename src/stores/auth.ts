import { defineStore } from "pinia";
import { apolloClient } from "../services/apollo";
import { LOGIN_MUTATION, REFRESH_MUTATION } from "../services/queries";

type UserRole = "USER" | "ANALYST" | "ADMIN";

type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: SessionUser;
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("aimsora.accessToken") ?? "",
    refreshToken: localStorage.getItem("aimsora.refreshToken") ?? "",
    user: readStoredUser() as SessionUser | null,
    loading: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken && state.user),
    isAdmin: (state) => state.user?.role === "ADMIN"
  },
  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      try {
        const { data } = await apolloClient.mutate<{ login: AuthPayload }>({
          mutation: LOGIN_MUTATION,
          variables: { input: { email, password } }
        });
        if (!data?.login) {
          throw new Error("Authentication failed");
        }
        this.setSession(data.login);
      } finally {
        this.loading = false;
      }
    },
    async refresh() {
      if (!this.refreshToken) {
        return false;
      }
      try {
        const { data } = await apolloClient.mutate<{ refreshSession: AuthPayload }>({
          mutation: REFRESH_MUTATION,
          variables: { input: { refreshToken: this.refreshToken } }
        });
        if (!data?.refreshSession) {
          return false;
        }
        this.setSession(data.refreshSession);
        return true;
      } catch {
        this.clearSession();
        return false;
      }
    },
    logout() {
      this.clearSession();
    },
    setSession(payload: AuthPayload) {
      this.accessToken = payload.accessToken;
      this.refreshToken = payload.refreshToken;
      this.user = payload.user;
      localStorage.setItem("aimsora.accessToken", payload.accessToken);
      localStorage.setItem("aimsora.refreshToken", payload.refreshToken);
      localStorage.setItem("aimsora.user", JSON.stringify(payload.user));
    },
    clearSession() {
      this.accessToken = "";
      this.refreshToken = "";
      this.user = null;
      localStorage.removeItem("aimsora.accessToken");
      localStorage.removeItem("aimsora.refreshToken");
      localStorage.removeItem("aimsora.user");
      apolloClient.clearStore().catch(() => undefined);
    }
  }
});

function readStoredUser() {
  const raw = localStorage.getItem("aimsora.user");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
