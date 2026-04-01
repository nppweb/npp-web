import type { InjectionKey, Ref } from "vue";

export type TabsContext = {
  currentValue: Ref<string>;
  setValue: (value: string) => void;
};

export const tabsContextKey: InjectionKey<TabsContext> = Symbol("tabs");
