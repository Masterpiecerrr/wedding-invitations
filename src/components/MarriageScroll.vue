<script setup lang="ts">
// 婚书卷轴：滑到这里后自动一次性徐徐展开，不再随滚动逐帧计算（手机上更顺）。
import { onBeforeUnmount, onMounted, ref } from 'vue';

const stage = ref<HTMLElement | null>(null);
const open = ref(false);
let io: IntersectionObserver | undefined;

onMounted(() => {
  const quick = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quick || !('IntersectionObserver' in window) || !stage.value) { open.value = true; return; }
  // 卷首进入屏幕下方 25% 处就开始展开；上翻时保持展开
  io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { open.value = true; io?.disconnect(); }
  }, { rootMargin: '0px 0px -25% 0px' });
  io.observe(stage.value);
});
onBeforeUnmount(() => io?.disconnect());
</script>

<template>
  <div class="marriage-scroll">
    <div ref="stage" class="scroll-stage" :data-open="open || undefined">
      <slot />
      <span class="scroll-rod scroll-rod-top" aria-hidden="true" />
      <span class="scroll-rod scroll-rod-bottom" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.scroll-stage { position: relative; width: min(100%, calc((100svh - 170px) * .5907)); margin: 0 auto; padding-top: 8px; --ease: cubic-bezier(.45, .1, .25, 1); --dur: 2.2s; }
.scroll-stage :deep(.letter) { clip-path: inset(0 0 81% 0); transition: clip-path var(--dur) var(--ease); }
.scroll-stage[data-open] :deep(.letter) { clip-path: inset(0); }
.scroll-rod { position: absolute; z-index: 2; left: -13px; right: -13px; height: 14px; background: url('../assets/art/scroll-rod-lacquer.webp') center / 100% auto no-repeat; filter: drop-shadow(0 2px 2px #50332230); pointer-events: none; }
.scroll-rod-top { top: 0; }
/* 下轴随纸张展开一起下移：起点在纸张 19% 处，终点在纸张底边 */
.scroll-rod-bottom { top: calc(8px + (100% - 8px) * .19 - 7px); transition: top var(--dur) var(--ease); will-change: top; }
.scroll-stage[data-open] .scroll-rod-bottom { top: calc(100% - 7px); }
@media (prefers-reduced-motion: reduce) {
  .scroll-stage :deep(.letter) { clip-path: none; transition: none; }
  .scroll-rod-bottom { top: calc(100% - 7px); transition: none; }
}
</style>
