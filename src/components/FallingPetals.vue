<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

// 开门那一刻落下的红花瓣与金箔，约 7 秒后自然落完，不长期打扰阅读。
// 花瓣绘制思路改编自 MrDevashish-777/royal-wedding-invitation 的 FloatingCherryBlossoms。
const canvas = ref<HTMLCanvasElement | null>(null);
let raf = 0;

onMounted(() => {
  const cv = canvas.value, g = cv?.getContext('2d');
  if (!cv || !g || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; g.scale(dpr, dpr);
  const colors = ['#c22d2a', '#d8433a', '#9e1c22', '#e9cf96', '#c39a52'];
  const parts = Array.from({ length: W < 600 ? 46 : 70 }, (_, i) => ({
    x: Math.random() * W, y: -20 - Math.random() * H * 0.9,
    s: 6 + Math.random() * 8, vy: 1.4 + Math.random() * 1.8, vx: (Math.random() - .5) * .8,
    r: Math.random() * 6.3, vr: (Math.random() - .5) * .08, f: Math.random() * 6.3,
    c: colors[i % colors.length], gold: i % colors.length >= 3,
  }));
  let prev = 0;
  const tick = (t: number) => {
    const k = prev ? Math.min(3, (t - prev) / 16.7) : 1; prev = t;
    g.clearRect(0, 0, W, H);
    let alive = 0;
    for (const p of parts) {
      p.y += p.vy * k; p.x += (p.vx + Math.sin(p.y / 60 + p.f) * .6) * k; p.r += p.vr * k; p.f += .05 * k;
      if (p.y > H + 20) continue;
      alive++;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.scale(1, Math.abs(Math.cos(p.f)) * .7 + .3);
      g.fillStyle = p.c; g.globalAlpha = .9;
      g.beginPath();
      if (p.gold) g.rect(-p.s * .35, -p.s * .35, p.s * .7, p.s * .7);
      else { g.moveTo(0, -p.s / 2); g.bezierCurveTo(p.s / 2, -p.s / 2, p.s / 2, p.s / 3, 0, p.s / 2); g.bezierCurveTo(-p.s / 2, p.s / 3, -p.s / 2, -p.s / 2, 0, -p.s / 2); }
      g.fill(); g.restore();
    }
    if (alive) raf = requestAnimationFrame(tick); else cv.remove();
  };
  raf = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<template>
  <canvas ref="canvas" class="petals" aria-hidden="true" />
</template>

<style scoped>
.petals { position: fixed; inset: 0; z-index: 45; width: 100%; height: 100%; pointer-events: none; }
</style>
