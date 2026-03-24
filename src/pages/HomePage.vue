<script setup lang="ts">
import GithubActivityWidget from "../components/GithubActivityWidget.vue";
import {
  architectureLayers,
  capabilities,
  deployFlow,
  platformFlow,
  repositories,
  siteMeta
} from "../content/siteContent";
</script>

<template>
  <section class="hero-shell reveal">
    <article class="hero-main">
      <p class="eyebrow">AIMSORA · Open Procurement Intelligence</p>
      <h1>Платформа мониторинга и анализа закупочных данных из открытых источников</h1>
      <p>
        AIMSORA развивает инженерную платформу для закупочной и договорной аналитики:
        от автоматизированного сбора данных до готовых сигналов для принятия решений.
      </p>

      <div class="hero-tags">
        <span>Open Data</span>
        <span>GraphQL API</span>
        <span>Event-Driven</span>
        <span>GitHub Actions</span>
      </div>

      <div class="hero-actions">
        <a class="solid-btn" :href="siteMeta.organizationUrl" target="_blank" rel="noreferrer noopener">
          Открыть организацию
        </a>
        <a class="ghost-btn" :href="siteMeta.sourceUrl" target="_blank" rel="noreferrer noopener">
          Исходники сайта
        </a>
      </div>
    </article>

    <aside class="signal-panel">
      <p class="signal-kicker">Mission Signal</p>
      <h2>От raw-данных к управленческим действиям</h2>
      <p>
        Платформа построена в формате независимых репозиториев и сервисов, которые
        связываются через контракты, очереди сообщений и GitHub-first деплой.
      </p>
      <div class="signal-grid">
        <div>
          <span class="signal-label">Data scope</span>
          <strong>Открытые закупочные и рыночные данные</strong>
        </div>
        <div>
          <span class="signal-label">Architecture</span>
          <strong>Микросервисы + event-driven обработка</strong>
        </div>
        <div>
          <span class="signal-label">Delivery</span>
          <strong>GitHub Actions + GHCR + Environments</strong>
        </div>
      </div>
    </aside>
  </section>

  <section class="capability-section reveal">
    <div class="section-head">
      <p class="eyebrow">Capabilities</p>
      <h2>Инженерный фокус платформы</h2>
    </div>

    <div class="cap-grid">
      <article v-for="item in capabilities" :key="item.title" class="cap-card">
        <p class="cap-metric">{{ item.metric }}</p>
        <h3>{{ item.title }}</h3>
        <p>{{ item.text }}</p>
      </article>
    </div>
  </section>

  <section class="capability-section reveal">
    <div class="section-head">
      <p class="eyebrow">Repositories</p>
      <h2>Репозитории и их назначение</h2>
    </div>

    <div class="cap-grid">
      <article v-for="repo in repositories" :key="repo.name" class="cap-card">
        <p class="cap-metric">GitHub Repo</p>
        <h3>{{ repo.name }}</h3>
        <p>{{ repo.role }}</p>
        <a class="gh-link" :href="repo.url" target="_blank" rel="noreferrer noopener">
          Открыть репозиторий
        </a>
      </article>
    </div>
  </section>

  <section class="pipeline-section reveal">
    <div class="section-head">
      <p class="eyebrow">Platform Flow</p>
      <h2>Как работает продуктовый контур</h2>
    </div>

    <ol class="pipeline-list">
      <li v-for="(step, index) in platformFlow" :key="step" class="pipeline-item">
        <span class="pipeline-index">0{{ index + 1 }}</span>
        <p>{{ step }}</p>
      </li>
    </ol>
  </section>

  <section class="pipeline-section reveal">
    <div class="section-head">
      <p class="eyebrow">Architecture</p>
      <h2>Архитектурные уровни платформы</h2>
    </div>

    <ol class="pipeline-list">
      <li v-for="(layer, index) in architectureLayers" :key="layer" class="pipeline-item">
        <span class="pipeline-index">L{{ index + 1 }}</span>
        <p>{{ layer }}</p>
      </li>
    </ol>
  </section>

  <section class="pipeline-section reveal">
    <div class="section-head">
      <p class="eyebrow">GitHub Deployment</p>
      <h2>Порядок деплоя через GitHub</h2>
    </div>

    <ol class="pipeline-list">
      <li v-for="(step, index) in deployFlow" :key="step" class="pipeline-item">
        <span class="pipeline-index">D{{ index + 1 }}</span>
        <p>{{ step }}</p>
      </li>
    </ol>
  </section>

  <GithubActivityWidget />
</template>
