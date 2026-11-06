<script setup lang="ts">
import { ref } from 'vue';
import { 配置, 取照片 } from '@/lib/wedding';
import PhotoFrame from './PhotoFrame.vue';

defineEmits<{ preview: [src: string] }>();
const photos = 配置.相册.照片.map((p, i) => 取照片(p, `相册.照片[${i + 1}]`));
const strip = ref<HTMLElement | null>(null);
const current = ref(1);
function onScroll() {
  const el = strip.value;
  if (!el) return;
  const items = [...el.children] as HTMLElement[];
  const mid = el.scrollLeft + el.clientWidth / 2;
  const idx = items.findIndex((it) => it.offsetLeft + it.offsetWidth >= mid);
  current.value = Math.max(1, idx + 1);
}
function go(step: number) {
  const el = strip.value;
  const target = el?.children[Math.min(photos.length - 1, Math.max(0, current.value - 1 + step))] as HTMLElement | undefined;
  if (el && target) el.scrollTo({ left: target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2, behavior: 'smooth' });
}
</script>

<template>
  <section class="sec paper gallery" aria-labelledby="gallery-title">
    <h2 id="gallery-title" class="sec-title">{{ 配置.相册.标题 }}</h2>
    <p v-if="配置.相册.说明" class="sec-sub">{{ 配置.相册.说明 }}</p>
    <div ref="strip" class="strip" tabindex="0" aria-label="相册，可左右滑动" @scroll.passive="onScroll">
      <PhotoFrame v-for="(p, i) in photos" :key="i" class="shot" :photo="p" :ratio="p.src ? '' : '4 / 5'" :style="{ width: `min(82vw, 370px, calc(min(96vw, 440px) * ${p.src ? p.w / p.h : 0.8}))` }" :alt="`相册第 ${i + 1} 张`" previewable @preview="$emit('preview', p.src)" />
    </div>
    <div v-if="photos.length > 1" class="pager">
      <button type="button" aria-label="上一张" :disabled="current <= 1" @click="go(-1)"><svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg></button>
      <span aria-live="polite">{{ current }} / {{ photos.length }}</span>
      <button type="button" aria-label="下一张" :disabled="current >= photos.length" @click="go(1)"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg></button>
    </div>
  </section>
</template>

<style scoped>
.gallery { padding-left: 0; padding-right: 0; }
.strip { display: flex; align-items: center; gap: 16px; margin-top: 34px; padding: 10px 24px 18px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
.strip::-webkit-scrollbar { display: none; }
.shot { flex: none; scroll-snap-align: center; box-shadow: 0 0 0 6px #fff, 0 0 0 7px #c39a5244, 0 12px 24px #6f121822; }
.shot:first-child { margin-left: 4vw; } .shot:last-child { margin-right: 4vw; }
.pager { display: flex; align-items: center; justify-content: center; gap: 22px; margin-top: 14px; color: var(--ink-soft); font-size: 14px; letter-spacing: .12em; font-variant-numeric: tabular-nums; }
.pager button { display: grid; place-items: center; width: 40px; height: 40px; border: 1px solid #c39a52aa; border-radius: 50%; background: transparent; color: var(--red); }
.pager button[disabled] { opacity: .35; cursor: default; }
.pager svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.6; }
</style>
