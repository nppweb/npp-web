<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import EmptyState from "../components/feedback/EmptyState.vue";
import ErrorState from "../components/feedback/ErrorState.vue";
import PageHeader from "../components/layout/PageHeader.vue";
import AlertDialog from "../components/ui/alert-dialog/AlertDialog.vue";
import Avatar from "../components/ui/avatar/Avatar.vue";
import Badge from "../components/ui/badge/Badge.vue";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import Dialog from "../components/ui/dialog/Dialog.vue";
import Input from "../components/ui/input/Input.vue";
import Label from "../components/ui/label/Label.vue";
import Select from "../components/ui/select/Select.vue";
import Skeleton from "../components/ui/skeleton/Skeleton.vue";
import Table from "../components/ui/table/Table.vue";
import TableBody from "../components/ui/table/TableBody.vue";
import TableCell from "../components/ui/table/TableCell.vue";
import TableHead from "../components/ui/table/TableHead.vue";
import TableHeader from "../components/ui/table/TableHeader.vue";
import TableRow from "../components/ui/table/TableRow.vue";
import { badgeVariant, formatDateTime, formatEnumLabel } from "../lib/format";
import { toast } from "../lib/utils/toast";
import { apolloClient } from "../graphql/apollo";
import type { AppUser, UserRole } from "../graphql/types";
import { useAuthStore } from "../stores/auth";
import {
  CREATE_USER_MUTATION,
  DEACTIVATE_USER_MUTATION,
  UPDATE_USER_ROLE_MUTATION,
  USERS_QUERY
} from "../graphql/queries";

const loading = ref(true);
const error = ref("");
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

const activeUsersCount = computed(() => users.value.filter((user) => user.isActive).length);
const createErrors = computed(() => ({
  fullName:
    createForm.fullName.trim().length >= 3 ? "" : "Укажите имя не короче трёх символов.",
  email:
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())
      ? ""
      : "Введите корректную электронную почту.",
  password:
    createForm.password.length >= 4 ? "" : "Пароль должен содержать не менее четырёх символов."
}));
const createFormValid = computed(
  () => !createErrors.value.fullName && !createErrors.value.email && !createErrors.value.password
);

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

function resetCreateForm() {
  createForm.email = "";
  createForm.fullName = "";
  createForm.password = "";
  createForm.role = "ANALYST";
}

async function createUser() {
  error.value = "";
  if (!createFormValid.value) {
    toast.warning("Проверьте форму", "Заполните обязательные поля корректно.");
    return;
  }

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

    resetCreateForm();
    createDialogOpen.value = false;
    toast.success("Пользователь создан", "Новая учётная запись добавлена в систему.");
    await loadUsers();
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Не удалось создать пользователя";
    toast.error("Ошибка создания", message);
  } finally {
    createLoading.value = false;
  }
}

async function updateRole(user: AppUser) {
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

    toast.success("Роль обновлена", `Для ${user.email} сохранена новая роль.`);
    await loadUsers();
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Не удалось обновить роль";
    toast.error("Ошибка обновления роли", message);
  } finally {
    updateLoadingId.value = "";
  }
}

async function deactivate(user: AppUser) {
  error.value = "";
  deactivateLoadingId.value = user.id;

  try {
    await apolloClient.mutate({
      mutation: DEACTIVATE_USER_MUTATION,
      variables: { userId: user.id }
    });

    userToDeactivate.value = null;
    toast.success("Пользователь деактивирован", `${user.email} больше не имеет доступа.`);
    await loadUsers();
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Не удалось деактивировать пользователя";
    toast.error("Ошибка деактивации", message);
  } finally {
    deactivateLoadingId.value = "";
  }
}

const roleOptions = [
  { label: "Пользователь", value: "USER" },
  { label: "Аналитик", value: "ANALYST" },
  { label: "Администратор", value: "ADMIN" }
];

onMounted(() => {
  void loadUsers();
});
</script>

<template>
  <PageHeader
    title="Пользователи"
    description="Управление ролями, доступом и жизненным циклом учётных записей."
  >
    <template #actions>
      <Button @click="createDialogOpen = true">Добавить пользователя</Button>
    </template>
  </PageHeader>

  <Card class="users-toolbar-card">
    <div class="panel-title">
      <div>
        <h2>Контур доступа</h2>
        <p class="data-note">
          Активных пользователей: {{ activeUsersCount }} из {{ users.length }}. Роль можно менять без
          перехода на отдельную страницу.
        </p>
      </div>
      <Badge variant="secondary">Текущий пользователь: {{ authStore.user?.email }}</Badge>
    </div>
  </Card>

  <Card v-if="loading" class="loading-card">
    <Skeleton :lines="8" />
  </Card>

  <Card v-else-if="error" class="error-card">
    <ErrorState :description="error" action-label="Повторить" @action="loadUsers" />
  </Card>

  <Card v-else class="table-card">
    <div class="table-card__header">
      <div>
        <h2>Список пользователей</h2>
        <p class="data-note">
          Учётные записи, роли и доступ можно обслуживать прямо в таблице без отдельного служебного экрана.
        </p>
      </div>
    </div>

    <EmptyState
      v-if="users.length === 0"
      title="Пользователи не найдены"
      description="Создайте первую учётную запись администратора или аналитика."
    />

    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>Пользователь</TableHead>
          <TableHead>Роль</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Последний вход</TableHead>
          <TableHead>Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="user in users" :key="user.id">
          <TableCell>
            <div class="users-table__person">
              <Avatar :fallback="user.fullName" size="sm" />
              <div class="users-table__person-copy">
                <strong>{{ user.fullName }}</strong>
                <p>{{ user.email }}</p>
              </div>
            </div>
          </TableCell>

          <TableCell>
            <div class="users-actions">
              <Select
                v-model="pendingRoles[user.id]"
                :options="roleOptions"
                aria-label="Роль пользователя"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                :disabled="pendingRoles[user.id] === user.role || updateLoadingId === user.id"
                @click="updateRole(user)"
              >
                {{ updateLoadingId === user.id ? "Сохранение..." : "Сохранить" }}
              </Button>
            </div>
          </TableCell>

          <TableCell>
            <div class="users-table__meta">
              <Badge :variant="user.isActive ? 'success' : 'destructive'">
                {{ user.isActive ? "Активен" : "Отключён" }}
              </Badge>
              <span class="muted-text">{{ formatEnumLabel(user.role) }}</span>
            </div>
          </TableCell>

          <TableCell>{{ formatDateTime(user.lastLoginAt) }}</TableCell>

          <TableCell>
            <div class="users-actions">
              <Badge :variant="badgeVariant(user.role)">
                {{ formatEnumLabel(user.role) }}
              </Badge>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                :disabled="user.id === authStore.user?.id || !user.isActive"
                @click="userToDeactivate = user"
              >
                Деактивировать
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Card>

  <Dialog
    :open="createDialogOpen"
    title="Новый пользователь"
    description="Создайте учётную запись и сразу назначьте роль в системе."
    @close="createDialogOpen = false"
  >
    <form class="form-grid" @submit.prevent="createUser">
      <label class="field">
        <Label for="user-full-name">ФИО</Label>
        <Input
          id="user-full-name"
          v-model="createForm.fullName"
          :invalid="Boolean(createErrors.fullName)"
          required
        />
        <span v-if="createErrors.fullName" class="field__error">{{ createErrors.fullName }}</span>
      </label>

      <label class="field">
        <Label for="user-email">Электронная почта</Label>
        <Input
          id="user-email"
          v-model="createForm.email"
          type="email"
          :invalid="Boolean(createErrors.email)"
          required
        />
        <span v-if="createErrors.email" class="field__error">{{ createErrors.email }}</span>
      </label>

      <label class="field">
        <Label for="user-password">Пароль</Label>
        <Input
          id="user-password"
          v-model="createForm.password"
          type="password"
          :invalid="Boolean(createErrors.password)"
          required
        />
        <span v-if="createErrors.password" class="field__error">{{ createErrors.password }}</span>
      </label>

      <label class="field">
        <Label for="user-role">Роль</Label>
        <Select id="user-role" v-model="createForm.role" :options="roleOptions" />
      </label>

      <div class="inline-actions">
        <Button type="submit" :disabled="createLoading || !createFormValid">
          {{ createLoading ? "Создание..." : "Создать" }}
        </Button>
        <Button type="button" variant="ghost" @click="createDialogOpen = false">Отмена</Button>
      </div>
    </form>
  </Dialog>

  <AlertDialog
    :open="Boolean(userToDeactivate)"
    title="Деактивировать пользователя"
    :description="`Пользователь ${userToDeactivate?.email ?? ''} потеряет доступ к защищённым разделам.`"
    confirm-label="Деактивировать"
    cancel-label="Отмена"
    :loading="Boolean(userToDeactivate && deactivateLoadingId === userToDeactivate.id)"
    @update:open="(open) => { if (!open) userToDeactivate = null; }"
    @cancel="userToDeactivate = null"
    @confirm="userToDeactivate && deactivate(userToDeactivate)"
  />
</template>
