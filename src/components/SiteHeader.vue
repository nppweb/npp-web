<script setup lang="ts">
import aimsoraLogo from "../assets/images/logos/aimsora-logo.png";
import { siteMeta } from "../content/siteContent";

const homeUrl = import.meta.env.BASE_URL;
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" :href="homeUrl" :aria-label="`${siteMeta.organizationName} home`">
        <img :src="aimsoraLogo" alt="AIMSORA logo" class="brand-logo" />
        <div class="brand-copy">
          <p class="brand-kicker">{{ siteMeta.organizationName }}</p>
          <p class="brand-subtitle">{{ siteMeta.organizationTagline }}</p>
        </div>
      </a>

      <div class="header-actions">
        <a class="ghost-btn" :href="siteMeta.featuredRepositoryUrl" target="_blank" rel="noreferrer noopener">
          frontend-app
        </a>
        <a class="solid-btn" :href="siteMeta.organizationUrl" target="_blank" rel="noreferrer noopener">
          GitHub Org
        </a>
      </div>
    </div>
  </header>
</template>
