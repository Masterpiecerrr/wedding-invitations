<script setup lang="ts">
// 双喜字形取自思源宋体 Heavy（OFL 授权），转成矢量路径，任何手机上都一致
import raw from '@/lib/xi.svg?raw';
const d = raw.match(/ d="([^"]+)"/)?.[1] ?? '';
const t = raw.match(/transform="([^"]+)"/)?.[1] ?? '';
</script>

<template>
  <svg class="xi" viewBox="0 0 965 947" aria-hidden="true" focusable="false"><path :transform="t" :d="d" fill="currentColor" /></svg>
</template>

<style scoped>
.xi { display: block; height: auto; }
</style>
