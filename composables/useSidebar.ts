let sidebarInitialized = false;

export function useSidebar() {
  const open = useState<boolean>("sidebar.open", () => true);
  const openMobile = useState<boolean>("sidebar.openMobile", () => false);
  const isMobile = useState<boolean>("sidebar.isMobile", () => false);

  function syncViewport() {
    if (!import.meta.client) {
      return;
    }

    isMobile.value = window.innerWidth < 1024;

    if (!sidebarInitialized) {
      open.value = !isMobile.value;
      openMobile.value = false;
      sidebarInitialized = true;
    }
  }

  function toggleSidebar() {
    if (isMobile.value) {
      openMobile.value = !openMobile.value;
      return;
    }

    open.value = !open.value;
  }

  function closeMobileSidebar() {
    openMobile.value = false;
  }

  return {
    open,
    openMobile,
    isMobile,
    state: computed(() => (open.value ? "expanded" : "collapsed")),
    syncViewport,
    toggleSidebar,
    closeMobileSidebar
  };
}
