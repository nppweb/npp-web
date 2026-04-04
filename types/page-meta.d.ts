import type { UserRole } from "~/graphql/types";

declare module "#app" {
  interface PageMeta {
    public?: boolean;
    roles?: UserRole[];
    title?: string;
    description?: string;
  }
}

declare module "vue-router" {
  interface RouteMeta {
    public?: boolean;
    roles?: UserRole[];
    title?: string;
    description?: string;
  }
}

export {};
