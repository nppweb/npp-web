<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import PageHeader from "../components/layout/PageHeader.vue";
import UiBadge from "../components/ui/UiBadge.vue";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiDialog from "../components/ui/UiDialog.vue";
import UiEmptyState from "../components/ui/UiEmptyState.vue";
import UiErrorState from "../components/ui/UiErrorState.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiSelect from "../components/ui/UiSelect.vue";
import UiSkeleton from "../components/ui/UiSkeleton.vue";
import UiTable from "../components/ui/UiTable.vue";
import { badgeTone, formatDateTime, formatEnumLabel } from "../lib/format";
import { apolloClient } from "../services/apollo";
import type { AppUser, UserRole } from "../services/graphql-types";
import { useAuthStore } from "../stores/auth";
import {
  CREATE_USER_MUTATION,
  DEACTIVATE_USER_MUTATION,
  UPDATE_USER_ROLE_MUTATION,
  USERS_QUERY
} from "../services/queries";

const loading = ref(true);
const error = ref("");
const actionMessage = ref("");
const users = ref<AppUser[]>([]);
const authStore = useAuthStore();
const pendingRoles = reactive<Record<string, UserRole>>({});
const createDialogOpen = ref(false);
const userToDeactivate = ref<AppUser | null>(null);
const createLoading = ref(false);
const updateLoadingId = ref("");
const deactivateLoadingId = ref("");
const createForm = reactive<{
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
}>({
  email: "",
  fullName: "",
  password: "",
  role: "ANALYST"
});

async function loadUsers() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await apolloClient.query<{ users: AppUser[] }>({
      query: USERS_QUERY,
      fetchPolicy: "network-only"
    });

    users.value = data.users;
    for (const user of data.users) {
      pendingRoles[user.id] = user.role;
    }
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось загрузить пользователей";
  } finally {
    loading.value = false;
  }
}

async function createUser() {
  actionMessage.value = "";
  error.value = "";
  createLoading.value = true;

  try {
    await apolloClient.mutate({
      mutation: CREATE_USER_MUTATION,
      variables: {
        input: {
          email: createForm.email,
          fullName: createForm.fullName,
          password: createForm.password,
          role: createForm.role
        }
      }
    });

    createForm.email = "";
    createForm.fullName = "";
    createForm.password = "";
    createForm.role = "ANALYST";
    actionMessage.value = "Пользователь создан";
    createDialogOpen.value = false;
    await loadUsers();
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось создать пользователя";
  } finally {
    createLoading.value = false;
  }
}

async function updateRole(user: AppUser) {
  actionMessage.value = "";
  error.value = "";
  updateLoadingId.value = user.id;

  try {
    await apolloClient.mutate({
      mutation: UPDATE_USER_ROLE_MUTATION,
      variables: {
        input: {
          userId: user.id,
          role: pendingRoles[user.id]
        }
      }
    });

    actionMessage.value = `Роль обновлена для ${user.email}`;
    await loadUsers();
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось обновить роль";
  } finally {
    updateLoadingId.value = "";
  }
}

async function deactivate(user: AppUser) {
  actionMessage.value = "";
  error.value = "";
  deactivateLoadingId.value = user.id;

  try {
    await apolloClient.mutate({
      mutation: DEACTIVATE_USER_MUTATION,
      variables: { userId: user.id }
    });

    actionMessage.value = `Пользователь ${user.email} деактивирован`;
    userToDeactivate.value = null;
    await loadUsers();
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось деактивировать пользователя";
  } finally {
    deactivateLoadingId.value = "";
  }
}

onMounted(() => {
  void loadUsers();
});

const roleOptions = [
  { label: "Пользователь", value: "USER" },
  { label: "Аналитик", value: "ANALYST" },
  { label: "Администратор", value: "ADMIN" }
];
</script>

<template>
  <PageHeader
    title="Пользователи"
    description="Управление ролями, доступом и жизненным циклом учетных записей."
  >
    <template #actions>
      <UiButton @click="createDialogOpen = true">Добавить пользователя</UiButton>
    </template>
  </PageHeader>

  <UiCard v-if="actionMessage">
    <div class="success-text">{{ actionMessage }}</div>
  </UiCard>

  <UiCard v-if="loading">
    <UiSkeleton :lines="8" />
  </UiCard>
  <UiCard v-else-if="error">
    <UiErrorState :description="error" action-label="Повторить" @action="loadUsers" />
  </UiCard>
  <UiCard v-else>
    <UiEmptyState
      v-if="users.length === 0"
      title="Пользователи не найдены"
      description="Создайте первую учетную запись администратора или аналитика."
    />
    <UiTable v-else>
      <thead>
        <tr>
          <th>Пользователь</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Статус</th>
          <th>Последний вход</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>
            <strong>{{ user.fullName }}</strong>
          </td>
          <td>{{ user.email }}</td>
          <td>
            <div class="inline-actions">
              <UiSelect
                v-model="pendingRoles[user.id]"
                :options="roleOptions"
                aria-label="Роль пользователя"
              />
              <UiButton
                type="button"
                variant="secondary"
                size="sm"
                :disabled="pendingRoles[user.id] === user.role || updateLoadingId === user.id"
                @click="updateRole(user)"
              >
                {{ updateLoadingId === user.id ? "Сохранение..." : "Сохранить" }}
              </UiButton>
            </div>
          </td>
          <td>
            <UiBadge :tone="user.isActive ? 'success' : 'danger'">
              {{ user.isActive ? "Активен" : "Отключен" }}
            </UiBadge>
          </td>
          <td>{{ formatDateTime(user.lastLoginAt) }}</td>
          <td>
            <div class="inline-actions">
              <UiBadge :tone="badgeTone(user.role)">
                {{ formatEnumLabel(user.role) }}
              </UiBadge>
              <UiButton
                type="button"
                variant="destructive"
                size="sm"
                :disabled="user.id === authStore.user?.id || !user.isActive"
                @click="userToDeactivate = user"
              >
                Деактивировать
              </UiButton>
            </div>
          </td>
        </tr>
      </tbody>
    </UiTable>
  </UiCard>

  <UiDialog
    :open="createDialogOpen"
    title="Новый пользователь"
    description="Создайте учетную запись и сразу назначьте роль в системе."
    @close="createDialogOpen = false"
  >
    <form class="form-grid" @submit.prevent="createUser">
      <UiInput v-model="createForm.fullName" label="ФИО" required />
      <UiInput v-model="createForm.email" label="Email" type="email" required />
      <UiInput v-model="createForm.password" label="Пароль" type="password" required />
      <UiSelect v-model="createForm.role" label="Роль" :options="roleOptions" />
      <div class="inline-actions">
        <UiButton type="submit" :disabled="createLoading">
          {{ createLoading ? "Создание..." : "Создать" }}
        </UiButton>
        <UiButton type="button" variant="ghost" @click="createDialogOpen = false">
          Отмена
        </UiButton>
      </div>
    </form>
  </UiDialog>

  <UiDialog
    :open="Boolean(userToDeactivate)"
    title="Подтвердите действие"
    :description="`Пользователь ${userToDeactivate?.email ?? ''} потеряет доступ к платформе.`"
    @close="userToDeactivate = null"
  >
    <div class="form-grid">
      <p class="muted-text">
        Деактивация не удаляет пользователя из системы, но отключает доступ к защищенным разделам.
      </p>
      <div class="inline-actions">
        <UiButton
          variant="destructive"
          :disabled="!userToDeactivate || deactivateLoadingId === userToDeactivate.id"
          @click="userToDeactivate && deactivate(userToDeactivate)"
        >
          {{
            userToDeactivate && deactivateLoadingId === userToDeactivate.id
              ? "Выполняется..."
              : "Деактивировать"
          }}
        </UiButton>
        <UiButton type="button" variant="ghost" @click="userToDeactivate = null">
          Отмена
        </UiButton>
      </div>
    </div>
  </UiDialog>
</template>
