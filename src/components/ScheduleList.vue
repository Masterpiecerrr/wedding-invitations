<script setup lang="ts">
import { 配置 } from '@/lib/wedding';
</script>

<template>
  <section class="sec paper schedule" aria-labelledby="schedule-title">
    <h2 id="schedule-title" class="sec-title">{{ 配置.流程.标题 }}</h2>
    <ol class="steps">
      <li v-for="(s, i) in 配置.流程.项目" :key="i">
        <time>{{ s.时间 }}</time>
        <div><b>{{ s.事项 }}</b><small v-if="s.说明">{{ s.说明 }}</small></div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.steps { position: relative; width: fit-content; max-width: 100%; margin: 36px auto 0; text-align: left; }
.steps li { display: grid; grid-template-columns: 64px 1fr; gap: 36px; position: relative; padding-bottom: 26px; }
.steps li:last-child { padding-bottom: 0; }
.steps li::before { content: ''; position: absolute; left: 79px; top: 13px; width: 7px; height: 7px; background: var(--red); transform: rotate(45deg); box-shadow: 0 0 0 3px var(--paper), 0 0 0 4px var(--gold); }
.steps li:not(:last-child)::after { content: ''; position: absolute; left: 82px; top: 26px; bottom: 4px; width: 1px; background: #c39a5299; }
.steps time { color: var(--red); font-size: 19px; text-align: right; font-variant-numeric: tabular-nums; line-height: 1.7; }
.steps b { display: block; font: 400 24px/1.4 var(--brush); color: var(--ink); }
.steps small { display: block; color: var(--ink-soft); font-size: 13.5px; line-height: 1.7; }
</style>
