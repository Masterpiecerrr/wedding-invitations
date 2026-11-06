<script setup lang="ts">
import { computed } from 'vue';
import { 看位置, type 照片信息 } from '@/lib/wedding';

const props = withDefaults(defineProps<{ photo: 照片信息; ratio?: string; alt?: string; eager?: boolean; previewable?: boolean }>(), { ratio: '', alt: '婚纱照', eager: false, previewable: false });
defineEmits<{ preview: [] }>();
const aspect = computed(() => props.ratio || `${props.photo.w} / ${props.photo.h}`);
const 提示 = computed(() => props.photo.文件 ? `没找到「${props.photo.文件}」` : '待放照片');
</script>

<template>
  <figure class="pf" :style="{ aspectRatio: aspect }" :data-empty="!photo.src || undefined">
    <img v-if="photo.src" :src="photo.src" :alt="alt" :loading="eager ? 'eager' : 'lazy'" decoding="async" :style="{ objectPosition: photo.焦点 }" draggable="false" />
    <div v-else class="pf-empty" aria-hidden="true">
      <svg viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="2" fill="none" stroke="currentColor" stroke-width="1.4" /><circle cx="15" cy="15" r="3.5" fill="currentColor" /><path d="m6 31 10-10 6 6 4-4 8 8" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>
      <span>{{ 提示 }}</span>
    </div>
    <button v-if="previewable && photo.src" class="pf-hit" type="button" :aria-label="`查看大图：${alt}`" @click="$emit('preview')" />
    <figcaption v-if="看位置 || !photo.src" class="pf-tag">{{ photo.位置 }}<template v-if="photo.文件 && 看位置"> ← {{ photo.文件 }}</template></figcaption>
  </figure>
</template>

<style scoped>
.pf { position: relative; overflow: hidden; background: var(--paper-deep); }
.pf img { width: 100%; height: 100%; object-fit: cover; }
.pf-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #b48e63; background: repeating-linear-gradient(135deg, #eadbc1 0 10px, #e5d3b6 10px 20px); font-size: 13px; letter-spacing: .1em; }
.pf-empty svg { width: 34px; height: 34px; opacity: .8; }
.pf-hit { position: absolute; inset: 0; border: 0; background: transparent; cursor: zoom-in; }
.pf-tag { position: absolute; left: 50%; top: 10px; transform: translateX(-50%); max-width: calc(100% - 16px); padding: 2px 10px; border-radius: 20px; background: #2b1d18b3; color: #fbf1dc; font: 12px/1.7 var(--song); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; }
</style>
