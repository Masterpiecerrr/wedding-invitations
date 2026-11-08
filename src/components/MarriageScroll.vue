<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const root = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
let furthest = 0;
let frame = 0;
let observer: ResizeObserver | undefined;
let reduced: MediaQueryList | undefined;

function paint() {
  frame = 0;
  if (!root.value || !stage.value) return;
  const paper = stage.value.querySelector<HTMLElement>('.letter');
  if (!paper) return;
  const height = paper.getBoundingClientRect().height;
  const travel = Math.max(480, window.innerHeight * .85);
  const progress = reduced?.matches ? 1 : Math.max(0, Math.min(1, (38 - root.value.getBoundingClientRect().top) / travel));
  // 上翻保留已展开状态，直到离开或刷新页面。
  furthest = Math.max(furthest, progress);
  const revealed = .19 + .81 * furthest;
  root.value.style.setProperty('--roll-height', `${height + travel + 104}px`);
  stage.value.style.setProperty('--hidden-paper', `${(1 - revealed) * 100}%`);
  stage.value.style.setProperty('--rod-top', `${8 + height * revealed - 7}px`);
  stage.value.style.setProperty('--note-opacity', `${Math.max(0, 1 - furthest * 3)}`);
}
function requestPaint() {
  if (!frame) frame = requestAnimationFrame(paint);
}
onMounted(() => {
  reduced = matchMedia('(prefers-reduced-motion: reduce)');
  reduced.addEventListener('change', requestPaint);
  window.addEventListener('scroll', requestPaint, { passive: true });
  window.addEventListener('resize', requestPaint);
  observer = new ResizeObserver(requestPaint);
  if (stage.value) observer.observe(stage.value);
  requestPaint();
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  reduced?.removeEventListener('change', requestPaint);
  window.removeEventListener('scroll', requestPaint);
  window.removeEventListener('resize', requestPaint);
});
</script>

<template>
  <div ref="root" class="marriage-scroll">
    <div ref="stage" class="scroll-stage">
      <slot />
      <span class="scroll-rod scroll-rod-top" aria-hidden="true" />
      <span class="scroll-rod scroll-rod-bottom" aria-hidden="true" />
      <p class="scroll-note" aria-hidden="true">下滑 · 徐展婚書</p>
    </div>
  </div>
</template>

<style scoped>
.marriage-scroll { position: relative; height: var(--roll-height, 1600px); }
.scroll-stage { position: sticky; top: 38px; width: min(100%, calc((100svh - 170px) * .5907)); margin: 0 auto; padding-top: 8px; }
.scroll-stage :deep(.letter) { clip-path: inset(0 0 var(--hidden-paper, 81%) 0); }
.scroll-rod { position: absolute; z-index: 2; left: -13px; right: -13px; height: 14px; background: url('../assets/art/scroll-rod-lacquer.webp') center / 100% auto no-repeat; filter: drop-shadow(0 2px 2px #50332230); pointer-events: none; }
.scroll-rod-top { top: 0; }
.scroll-rod-bottom { top: var(--rod-top, 120px); }
.scroll-note { position: absolute; top: calc(var(--rod-top, 120px) + 32px); left: 0; right: 0; margin: 0; font-size: 12px; letter-spacing: .18em; color: #916e51; opacity: var(--note-opacity, 1); }
@media (prefers-reduced-motion: reduce) {
  .marriage-scroll { height: auto !important; }
  .scroll-stage { position: relative; top: auto; }
  .scroll-stage :deep(.letter) { clip-path: none; }
  .scroll-rod-bottom { top: calc(100% - 7px); }
  .scroll-note { display: none; }
}
</style>
