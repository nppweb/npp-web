<script setup lang="ts">
import { ChevronsUpDown, LogOut } from "lucide-vue-next";
import { formatRoleLabel } from "~/utils/formatters";

const auth = useAuthSession();

async function logout() {
  await auth.logout();
  await navigateTo("/login");
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="h-10 justify-between gap-3">
        <span class="flex items-center gap-3">
          <Avatar :fallback="auth.user.value?.fullName || 'AIMSORA'" size="sm" />
          <span class="hidden text-left md:block">
            <span class="block text-sm font-medium leading-none">
              {{ auth.user.value?.fullName || "Пользователь" }}
            </span>
            <span class="mt-1 block text-xs text-muted-foreground">
              {{ auth.user.value?.email }}
            </span>
          </span>
        </span>
        <ChevronsUpDown class="hidden h-4 w-4 text-muted-foreground md:block" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-64">
      <DropdownMenuLabel>
        <div class="space-y-1">
          <p class="text-sm font-medium leading-none">{{ auth.user.value?.fullName }}</p>
          <p class="text-xs font-normal text-muted-foreground">{{ auth.user.value?.email }}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div class="px-2 py-1.5 text-xs text-muted-foreground">
        Роль: {{ formatRoleLabel(auth.user.value?.role) }}
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive @select="logout">
        <LogOut class="mr-2 h-4 w-4" />
        Выйти
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
