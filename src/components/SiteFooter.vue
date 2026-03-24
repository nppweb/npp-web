<script setup lang="ts">
import { siteMeta } from "../content/siteContent";

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <p>© {{ currentYear }} {{ siteMeta.organizationName }} · Automated Intelligence Monitoring</p>
      <div class="footer-links">
        <a :href="siteMeta.organizationUrl" target="_blank" rel="noreferrer noopener">Organization</a>
        <a :href="siteMeta.sourceUrl" target="_blank" rel="noreferrer noopener">Source</a>
      </div>
    </div>
  </footer>
</template>
