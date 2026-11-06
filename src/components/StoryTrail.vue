<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { 配置, 取照片, 看位置 } from '@/lib/wedding';
import PhotoFrame from './PhotoFrame.vue';

defineEmits<{ preview: [src: string] }>();
const chapters = 配置.故事.章节.map((c, i) => ({ ...c, pic: 取照片(c.照片, `故事.章节[${i + 1}].照片`) }));
const trail = ref<HTMLElement | null>(null);
const y = ref(0);
let raf = 0;

// 花轿随滚动沿红绸往下走
function update() {
  raf = 0;
  const el = trail.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - r.top) / r.height));
  y.value = p * Math.max(0, r.height - 48);
}
const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
});
onBeforeUnmount(() => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); });
</script>

<template>
  <section class="sec paper story" aria-labelledby="story-title">
    <h2 id="story-title" class="sec-title">{{ 配置.故事.标题 }}</h2>
    <p v-if="配置.故事.引言" class="sec-sub">{{ 配置.故事.引言 }}</p>
    <div ref="trail" class="trail">
      <span class="silk" aria-hidden="true" />
      <svg class="sedan" :style="{ transform: `translateY(${y}px)` }" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M2 30h44" stroke="#7d5622" stroke-width="2.4" stroke-linecap="round" />
        <path d="M9 10q15-9 30 0l-2 3H11Z" fill="#c22d2a" stroke="#7d5622" stroke-width="1.2" stroke-linejoin="round" />
        <path d="M6 12q18-6 36 0" fill="none" stroke="#e9cf96" stroke-width="2" stroke-linecap="round" />
        <circle cx="24" cy="5" r="2.2" fill="#e9cf96" />
        <rect x="12" y="13" width="24" height="25" rx="1.5" fill="#9e1c22" stroke="#7d5622" stroke-width="1.2" />
        <rect x="17" y="17" width="14" height="13" fill="#6f1218" stroke="#e9cf96" stroke-width="1" />
        <path d="M24 19.5v8M20.5 23.5h7" stroke="#e9cf96" stroke-width="1.2" />
        <path d="M12 38h24M15 38v6M33 38v6" stroke="#7d5622" stroke-width="1.6" stroke-linecap="round" />
        <path d="M12 14v24M36 14v24" stroke="#e9cf96" stroke-width=".8" stroke-dasharray="2 2" />
      </svg>
      <ol>
        <li v-for="(c, i) in chapters" :key="i" class="chapter">
          <p class="ch-time">{{ c.时间 }}</p>
          <h3 class="ch-title">{{ c.标题 }}</h3>
          <p class="ch-text">{{ c.内容 }}</p>
          <PhotoFrame v-if="c.pic.文件 || 看位置" class="ch-pic" :photo="c.pic" :alt="c.标题" previewable @preview="$emit('preview', c.pic.src)" />
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.trail { position: relative; margin-top: 40px; padding-left: 58px; text-align: left; }
.silk { position: absolute; left: 23px; top: 6px; bottom: 6px; width: 3px; background: linear-gradient(var(--red-bright), var(--red) 50%, var(--red-bright)); border-radius: 2px; box-shadow: 4px 0 0 -1px #c39a5244; }
.sedan { position: absolute; left: 0; top: 0; width: 48px; height: 48px; z-index: 1; filter: drop-shadow(0 3px 3px #6f121833); transition: transform .12s linear; will-change: transform; }
.chapter { position: relative; padding-bottom: 44px; }
.chapter:last-child { padding-bottom: 0; }
.chapter::before { content: ''; position: absolute; left: -40px; top: 12px; width: 9px; height: 9px; background: var(--paper); border: 2px solid var(--gold); transform: rotate(45deg); }
.ch-time { color: var(--gold); font-size: 13px; letter-spacing: .16em; }
.ch-title { margin-top: 2px; color: var(--red); font: 400 30px/1.3 var(--brush); letter-spacing: .06em; }
.ch-text { margin-top: 8px; color: var(--ink); font-size: 15.5px; line-height: 1.95; }
.ch-pic { margin-top: 16px; box-shadow: 0 0 0 5px #fff, 0 0 0 6px #c39a5244, 0 10px 22px #6f12181f; }
</style>
