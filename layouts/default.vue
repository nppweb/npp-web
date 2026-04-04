<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AppTopbar />
      <main class="container flex-1 py-6">
        <div class="flex flex-col gap-6">
          <slot />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
