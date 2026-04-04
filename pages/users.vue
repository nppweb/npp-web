<script setup lang="ts">
definePageMeta({
  title: "Пользователи",
  description: "Управление ролями, доступом и жизненным циклом учётных записей",
  roles: ["ADMIN"]
});

useHead({
  title: "Пользователи"
});

const usersData = useUsersData();
const auth = useAuthSession();
const userDeactivateOpen = computed({
  get: () => Boolean(usersData.userToDeactivate.value),
  set: (value: boolean) => {
    if (!value) {
      usersData.userToDeactivate.value = null;
    }
  }
});

const roleOptions = [
  { label: "Пользователь", value: "USER" },
  { label: "Аналитик", value: "ANALYST" },
  { label: "Администратор", value: "ADMIN" }
] as const;

const activeUsersCount = computed(
  () => usersData.users.value.filter((user) => user.isActive).length
);

onMounted(() => {
  void usersData.load();
});
</script>

<template>
  <PageHeader
    title="Пользователи"
    description="Управление ролями, доступом и жизненным циклом учётных записей."
  >
    <template #actions>
      <Button @click="usersData.createDialogOpen.value = true">Добавить пользователя</Button>
    </template>
  </PageHeader>

  <Card>
    <CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <CardTitle class="text-base">Контур доступа</CardTitle>
        <CardDescription>
          Активных пользователей: {{ activeUsersCount }} из {{ usersData.users.value.length }}.
        </CardDescription>
      </div>
      <Badge variant="secondary">Текущий пользователь: {{ auth.user.value?.email }}</Badge>
    </CardHeader>
  </Card>

  <Card v-if="usersData.loading.value">
    <CardContent class="space-y-3 pt-6">
      <Skeleton class="h-10 rounded-md" />
      <Skeleton class="h-10 rounded-md" />
      <Skeleton class="h-10 rounded-md" />
    </CardContent>
  </Card>

  <ErrorState
    v-else-if="usersData.error.value"
    :description="usersData.error.value"
    action-label="Повторить"
    @action="usersData.load()"
  />

  <Card v-else>
    <CardHeader>
      <CardTitle>Список пользователей</CardTitle>
      <CardDescription>Роли и доступ можно обслуживать прямо в таблице.</CardDescription>
    </CardHeader>
    <CardContent v-if="usersData.users.value.length === 0">
      <EmptyState
        title="Пользователи не найдены"
        description="Создайте первую учётную запись администратора или аналитика."
      />
    </CardContent>
    <CardContent v-else class="px-0">
      <Table>
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
          <TableRow v-for="user in usersData.users.value" :key="user.id">
            <TableCell>
              <div class="flex items-center gap-3">
                <Avatar :fallback="user.fullName" size="sm" />
                <div class="space-y-1">
                  <p class="font-medium">{{ user.fullName }}</p>
                  <p class="text-sm text-muted-foreground">{{ user.email }}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex min-w-[220px] items-center gap-2">
                <Select v-model="usersData.pendingRoles[user.id]">
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="role in roleOptions" :key="role.value" :value="role.value">
                      {{ role.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="secondary"
                  size="sm"
                  :disabled="
                    usersData.pendingRoles[user.id] === user.role ||
                    usersData.updateLoadingId.value === user.id
                  "
                  @click="usersData.updateRole(user)"
                >
                  {{ usersData.updateLoadingId.value === user.id ? "Сохранение..." : "Сохранить" }}
                </Button>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col gap-1">
                <Badge :variant="user.isActive ? 'success' : 'destructive'">
                  {{ user.isActive ? "Активен" : "Отключён" }}
                </Badge>
                <span class="text-sm text-muted-foreground">{{ formatEnumLabel(user.role) }}</span>
              </div>
            </TableCell>
            <TableCell>{{ formatDateTime(user.lastLoginAt) }}</TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                :disabled="user.id === auth.user.value?.id || !user.isActive"
                @click="usersData.userToDeactivate.value = user"
              >
                Деактивировать
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>

  <Dialog v-model:open="usersData.createDialogOpen.value">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>Новый пользователь</DialogTitle>
        <DialogDescription>
          Создайте учётную запись и сразу назначьте роль в системе.
        </DialogDescription>
      </DialogHeader>
      <form class="grid gap-4" @submit.prevent="usersData.createUser()">
        <div class="space-y-2">
          <Label for="user-full-name">ФИО</Label>
          <Input
            id="user-full-name"
            v-model="usersData.createForm.fullName"
            :invalid="Boolean(usersData.createErrors.value.fullName)"
            required
          />
          <p v-if="usersData.createErrors.value.fullName" class="text-sm text-destructive">
            {{ usersData.createErrors.value.fullName }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="user-email">Электронная почта</Label>
          <Input
            id="user-email"
            v-model="usersData.createForm.email"
            type="email"
            :invalid="Boolean(usersData.createErrors.value.email)"
            required
          />
          <p v-if="usersData.createErrors.value.email" class="text-sm text-destructive">
            {{ usersData.createErrors.value.email }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="user-password">Пароль</Label>
          <Input
            id="user-password"
            v-model="usersData.createForm.password"
            type="password"
            :invalid="Boolean(usersData.createErrors.value.password)"
            required
          />
          <p v-if="usersData.createErrors.value.password" class="text-sm text-destructive">
            {{ usersData.createErrors.value.password }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="user-role">Роль</Label>
          <Select v-model="usersData.createForm.role">
            <SelectTrigger id="user-role">
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="role in roleOptions" :key="role.value" :value="role.value">
                {{ role.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            @click="usersData.createDialogOpen.value = false"
          >
            Отмена
          </Button>
          <Button type="submit" :disabled="usersData.createLoading.value || !usersData.createFormValid.value">
            {{ usersData.createLoading.value ? "Создание..." : "Создать" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

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
      @action="usersData.userToDeactivate.value && usersData.deactivate(usersData.userToDeactivate.value)"
    />
  </AlertDialog>
</template>
