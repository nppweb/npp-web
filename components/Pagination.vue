<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    page: number;
    pageSize: number;
    total: number;
  }>(),
  {
    pageSize: 10
  }
);

const emit = defineEmits<{
  (event: "update:page", value: number): void;
}>();

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const pages = computed(() => Array.from({ length: pageCount.value }, (_, index) => index + 1));
</script>

<template>
  <div class="flex items-center justify-between gap-4 border-t px-6 py-4">
    <p class="text-sm text-muted-foreground">
      Страница {{ page }} из {{ pageCount }}
    </p>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
        Назад
      </Button>
      <div class="hidden items-center gap-1 md:flex">
        <Button
          v-for="item in pages"
          :key="item"
          :variant="item === page ? 'default' : 'ghost'"
          size="sm"
          @click="emit('update:page', item)"
        >
          {{ item }}
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        :disabled="page >= pageCount"
        @click="emit('update:page', page + 1)"
      >
        Вперёд
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
