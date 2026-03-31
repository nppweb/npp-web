<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apolloClient } from "../services/apollo";
import { USERS_QUERY } from "../services/queries";

const loading = ref(true);
const error = ref("");
const users = ref<Array<Record<string, unknown>>>([]);

onMounted(async () => {
  try {
    const { data } = await apolloClient.query<{ users: Array<Record<string, unknown>> }>({
      query: USERS_QUERY,
      fetchPolicy: "network-only"
    });
    users.value = data.users;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to load users";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="page-header">
    <p class="eyebrow">Administration</p>
    <h2>Users</h2>
  </section>
  <div v-if="loading" class="card">Loading users...</div>
  <div v-else-if="error" class="card error-text">{{ error }}</div>
  <section v-else class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Active</th>
          <th>Last login</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="String(user.id)">
          <td>{{ user.fullName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>{{ user.isActive ? "yes" : "no" }}</td>
          <td>{{ user.lastLoginAt ? new Date(String(user.lastLoginAt)).toLocaleString() : "n/a" }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
