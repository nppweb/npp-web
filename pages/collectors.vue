<script setup lang="ts">
definePageMeta({
  title: "Коллекторы",
  description: "Редирект на объединённую зону операций парсеров",
  roles: ["DEVELOPER", "ADMIN"]
});

useHead({
  title: "Коллекторы"
});
await navigateTo("/jobs", { redirectCode: 301, replace: true });
</script>

<template />
