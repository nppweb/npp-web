<script setup lang="ts">
import { getRolePermissions } from "~/utils/access";
import type { AppUser } from "~/graphql/types";

definePageMeta({
  title: "Пользователь",
  description: "Отдельная административная карточка пользователя",
  roles: ["ADMIN"]
});

const route = useRoute();
const usersData = useUsersData();
const auth = useAuthSession();
const userDeactivateOpen = ref(false);
const userDeleteOpen = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);

const roleOptions = [
  { label: "Пользователь", value: "USER" },
  { label: "Аналитик", value: "ANALYST" },
  { label: "Разработчик", value: "DEVELOPER" },
  { label: "Администратор", value: "ADMIN" }
] as const;

const user = computed(() =>
  usersData.users.value.find((item) => item.id === String(route.params.id)) ?? null
);
const editForm = computed(() =>
  user.value ? usersData.editForms[user.value.id] : null
);
const permissions = computed(() =>
  user.value ? getRolePermissions(usersData.editForms[user.value.id]?.role ?? user.value.role) : []
);

useHead({
  title: user.value?.fullName ? `Пользователь: ${user.value.fullName}` : "Пользователь"
});

function isUserDirty(currentUser: AppUser) {
  const form = usersData.editForms[currentUser.id];

  if (!form) {
    return false;
  }

  return (
    form.fullName.trim() !== currentUser.fullName ||
    form.email.trim().toLowerCase() !== currentUser.email.toLowerCase() ||
    form.avatarUrl !== (currentUser.avatarUrl ?? "") ||
    form.role !== currentUser.role ||
    form.newPassword.trim().length > 0
  );
}

function openAvatarPicker() {
  avatarInput.value?.click();
}

async function onAvatarSelected(event: Event) {
  const currentUser = user.value;
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0];

  if (!currentUser || !file) {
    return;
  }

  await usersData.setEditAvatarFromFile(currentUser.id, file);

  if (target) {
    target.value = "";
  }
}

async function saveUserCard() {
  const currentUser = user.value;

  if (!currentUser) {
    return;
  }

  const updatedUser = await usersData.updateUser(currentUser);

  if (updatedUser && updatedUser.id === auth.user.value?.id) {
    auth.applyUserProfile(updatedUser);
  }
}

async function confirmDeactivate() {
  const targetUser = usersData.userToDeactivate.value;

  if (!targetUser) {
    return;
  }

  userDeactivateOpen.value = false;
  await usersData.deactivate(targetUser);
}

async function confirmDelete() {
  const targetUser = usersData.userToDelete.value;

  if (!targetUser) {
    return;
  }

  userDeleteOpen.value = false;
  await usersData.deleteUser(targetUser);
  await navigateTo("/users");
}

onMounted(() => {
  void usersData.load();
});
</script>

<template>
  <PageHeader
    :title="user?.fullName || 'Пользователь'"
    :description="user ? 'Отдельная административная карточка для изменения данных, роли, аватара и статуса доступа.' : 'Загрузка административной карточки пользователя.'"
  >
    <template #actions>
      <Button as-child variant="outline">
        <NuxtLink to="/users">К списку пользователей</NuxtLink>
      </Button>
    </template>
  </PageHeader>

  <Card v-if="usersData.loading.value">
    <CardContent class="space-y-3 pt-6">
      <Skeleton class="h-16 rounded-xl" />
      <Skeleton class="h-80 rounded-3xl" />
    </CardContent>
  </Card>

  <ErrorState
    v-else-if="usersData.error.value"
    :description="usersData.error.value"
    action-label="Повторить"
    @action="usersData.load()"
  />

  <EmptyState
    v-else-if="!user || !editForm"
    title="Пользователь не найден"
    description="Запись отсутствует или была удалена. Вернитесь к списку пользователей и выберите другую карточку."
  />

  <template v-else>
    <Card class="overflow-hidden">
      <CardHeader class="gap-4 border-b border-border/60 bg-muted/10">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex min-w-0 items-center gap-4">
            <Avatar
              :src="editForm.avatarUrl || ''"
              :fallback="editForm.fullName || user.fullName"
              size="lg"
              class="h-16 w-16"
            />
            <div class="min-w-0 space-y-1">
              <CardTitle class="truncate text-2xl">
                {{ editForm.fullName || user.fullName }}
              </CardTitle>
              <CardDescription class="truncate">
                {{ editForm.email || user.email }}
              </CardDescription>
              <div class="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary">
                  {{ formatRoleLabel(editForm.role || user.role) }}
                </Badge>
                <Badge :variant="user.isActive ? 'success' : 'destructive'">
                  {{ user.isActive ? "Активен" : "Отключён" }}
                </Badge>
                <Badge v-if="user.id === auth.user.value?.id" variant="outline">Это вы</Badge>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onAvatarSelected"
            >
            <Button type="button" variant="outline" @click="openAvatarPicker()">
              Аватар
            </Button>
            <Button
              v-if="editForm.avatarUrl"
              type="button"
              variant="ghost"
              @click="usersData.clearEditAvatar(user.id)"
            >
              Убрать фото
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent class="grid gap-6 p-6">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label :for="`user-name-${user.id}`">Имя</Label>
            <Input
              :id="`user-name-${user.id}`"
              v-model="usersData.editForms[user.id].fullName"
              :invalid="Boolean(usersData.getEditErrors(user.id).fullName)"
              placeholder="Имя пользователя"
            />
            <p v-if="usersData.getEditErrors(user.id).fullName" class="text-sm text-destructive">
              {{ usersData.getEditErrors(user.id).fullName }}
            </p>
          </div>

          <div class="space-y-2">
            <Label :for="`user-email-${user.id}`">Email / логин</Label>
            <Input
              :id="`user-email-${user.id}`"
              v-model="usersData.editForms[user.id].email"
              type="email"
              :invalid="Boolean(usersData.getEditErrors(user.id).email)"
              placeholder="mail@example.com"
            />
            <p v-if="usersData.getEditErrors(user.id).email" class="text-sm text-destructive">
              {{ usersData.getEditErrors(user.id).email }}
            </p>
          </div>

          <div class="space-y-2">
            <Label :for="`user-role-${user.id}`">Роль</Label>
            <Select v-model="usersData.editForms[user.id].role">
              <SelectTrigger :id="`user-role-${user.id}`">
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="role in roleOptions" :key="role.value" :value="role.value">
                  {{ role.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label :for="`user-password-${user.id}`">Новый пароль</Label>
            <Input
              :id="`user-password-${user.id}`"
              v-model="usersData.editForms[user.id].newPassword"
              type="password"
              :invalid="Boolean(usersData.getEditErrors(user.id).newPassword)"
              placeholder="Оставьте пустым, если не меняете"
            />
            <p v-if="usersData.getEditErrors(user.id).newPassword" class="text-sm text-destructive">
              {{ usersData.getEditErrors(user.id).newPassword }}
            </p>
            <p v-else class="text-xs text-muted-foreground">
              Если пароль изменить, активные сессии пользователя будут завершены.
            </p>
          </div>
        </div>

        <div class="grid gap-3 rounded-3xl border bg-muted/10 p-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div class="space-y-1">
            <p class="font-medium text-foreground">Последний вход</p>
            <p>{{ formatDateTime(user.lastLoginAt) }}</p>
          </div>
          <div class="space-y-1">
            <p class="font-medium text-foreground">Обновлена карточка</p>
            <p>{{ formatDateTime(user.updatedAt) }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium">Что сможет делать пользователь</p>
              <p class="text-sm text-muted-foreground">
                Возможности пересчитываются по выбранной роли на этой административной странице.
              </p>
            </div>
            <Badge variant="outline">
              {{ permissions.length }} прав
            </Badge>
          </div>

          <div class="grid gap-3">
            <div
              v-for="permission in permissions"
              :key="`${user.id}-${permission.key}`"
              class="rounded-2xl border bg-muted/15 p-3"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-medium">{{ permission.label }}</p>
                <Badge variant="outline">{{ permission.category }}</Badge>
              </div>
              <p class="mt-1 text-sm text-muted-foreground">{{ permission.description }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <Button
            type="button"
            :disabled="!isUserDirty(user) || !usersData.isEditFormValid(user.id) || usersData.updateLoadingId.value === user.id"
            @click="saveUserCard()"
          >
            {{ usersData.updateLoadingId.value === user.id ? "Сохранение..." : "Сохранить изменения" }}
          </Button>
          <Button
            type="button"
            variant="ghost"
            :disabled="!isUserDirty(user)"
            @click="usersData.resetEditForm(user.id)"
          >
            Отменить изменения
          </Button>
          <Button
            v-if="!user.isActive"
            type="button"
            variant="secondary"
            :disabled="usersData.activationLoadingId.value === user.id"
            @click="usersData.setUserActive(user, true)"
          >
            {{
              usersData.activationLoadingId.value === user.id
                ? "Активация..."
                : "Активировать"
            }}
          </Button>
          <Button
            v-else
            type="button"
            variant="destructive"
            :disabled="user.id === auth.user.value?.id || usersData.deactivateLoadingId.value === user.id"
            @click="
              usersData.userToDeactivate.value = user;
              userDeactivateOpen = true;
            "
          >
            {{
              usersData.deactivateLoadingId.value === user.id
                ? 'Деактивация...'
                : 'Деактивировать'
            }}
          </Button>
          <Button
            type="button"
            variant="outline"
            :disabled="user.id === auth.user.value?.id || usersData.deleteLoadingId.value === user.id"
            @click="
              usersData.userToDelete.value = user;
              userDeleteOpen = true;
            "
          >
            {{
              usersData.deleteLoadingId.value === user.id
                ? "Удаление..."
                : "Удалить"
            }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </template>

  <AlertDialog v-model:open="userDeactivateOpen">
    <AlertDialogContent
      title="Деактивировать пользователя?"
      :description="
        usersData.userToDeactivate.value
          ? `Пользователь ${usersData.userToDeactivate.value.email} потеряет доступ к системе.`
          : 'Подтвердите действие.'
      "
      action-label="Деактивировать"
      cancel-label="Отмена"
      @action="confirmDeactivate()"
    />
  </AlertDialog>

  <AlertDialog v-model:open="userDeleteOpen">
    <AlertDialogContent
      title="Удалить пользователя?"
      :description="
        usersData.userToDelete.value
          ? `Учётная запись ${usersData.userToDelete.value.email} будет удалена из списка пользователей, вход будет заблокирован, а активные сессии завершены.`
          : 'Подтвердите действие.'
      "
      action-label="Удалить"
      cancel-label="Отмена"
      @action="confirmDelete()"
    />
  </AlertDialog>
</template>
