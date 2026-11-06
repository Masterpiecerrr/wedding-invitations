<script setup lang="ts">
import { 配置 } from '@/lib/wedding';

const link = (() => {
  try { const u = new URL(配置.回执.问卷链接.trim()); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch { return ''; }
})();
</script>

<template>
  <section class="sec paper rsvp" aria-labelledby="rsvp-title">
    <div class="rsvp-card">
      <h2 id="rsvp-title" class="sec-title">{{ 配置.回执.标题 }}</h2>
      <p class="rsvp-text">{{ 配置.回执.正文 }}</p>
      <a v-if="link" class="btn rsvp-btn" :href="link" target="_blank" rel="noopener">{{ 配置.回执.按钮文字 }}</a>
      <button v-else class="btn rsvp-btn" type="button" disabled>回执即将开放</button>
      <p v-if="配置.回执.截止说明" class="rsvp-due">{{ 配置.回执.截止说明 }}</p>
    </div>
  </section>
</template>

<style scoped>
.rsvp-card { padding: 38px 22px 34px; background: #fbf4e6; box-shadow: 0 0 0 1px #c39a5266, inset 0 0 0 8px #fbf4e6, inset 0 0 0 9px #9e1c2255; }
.rsvp-text { text-wrap: balance; max-width: 22em; margin: 18px auto 0; color: var(--ink); font-size: 15.5px; }
.rsvp-btn { margin-top: 24px; min-width: 180px; }
.rsvp-due { margin-top: 12px; color: var(--ink-soft); font-size: 13.5px; }
</style>
