<script setup lang="ts">
// 新人姓名：两人字数不同时，短的名字自动撑开到同样宽度（如「禹　露」与「石天宇」对齐）
import { computed } from 'vue';
import { 配置 } from '@/lib/wedding';

const props = defineProps<{ name: string }>();
const 字 = computed(() => [...props.name]);
const 宽 = Math.max([...配置.新人.新郎].length, [...配置.新人.新娘].length);
</script>

<template>
  <span class="nm" :aria-label="name" :style="{ width: 字.length < 宽 ? `${宽}em` : undefined }">
    <span v-for="(c, i) in 字" :key="i" aria-hidden="true">{{ c }}</span>
  </span>
</template>

<style scoped>
.nm { display: inline-flex; justify-content: space-between; letter-spacing: 0; white-space: nowrap; }
</style>
