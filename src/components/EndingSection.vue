<script setup lang="ts">
import { emojiBlast } from 'emoji-blast';
import { 配置, 日期 } from '@/lib/wedding';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { 喜糖数, 读取喜糖数, 撒一把 } from '@/lib/sweets';
import XiMark from './XiMark.vue';
import TuanFan from './TuanFan.vue';

// 团扇归来：滚动到结尾时，开场移开的团扇缓缓落回
const fanEl = ref<HTMLElement | null>(null);
const fanIn = ref(false);
let io: IntersectionObserver | null = null;
onMounted(() => {
  if (!fanEl.value || !('IntersectionObserver' in window)) { fanIn.value = true; return; }
  io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fanIn.value = true; io?.disconnect(); } }, { threshold: .45 });
  io.observe(fanEl.value);
});
onBeforeUnmount(() => io?.disconnect());

// 全场喜糖计数：结尾附近才去读，接口不可用就不显示
const endEl = ref<HTMLElement | null>(null);
let countIo: IntersectionObserver | null = null;
onMounted(() => {
  if (!配置.结尾.喜糖计数 || !endEl.value) return;
  if (!('IntersectionObserver' in window)) { void 读取喜糖数(); return; }
  countIo = new IntersectionObserver(([e]) => { if (e.isIntersecting) { void 读取喜糖数(); countIo?.disconnect(); } }, { rootMargin: '600px 0px' });
  countIo.observe(endEl.value);
});
onBeforeUnmount(() => countIo?.disconnect());
const 计数文字 = computed(() => {
  if (喜糖数.value === null || !配置.结尾.喜糖计数) return null;
  const [前, 后 = ''] = 配置.结尾.喜糖计数.split('{n}');
  return { 前, 数: 喜糖数.value.toLocaleString('zh-CN'), 后 };
});

const 父母 = 配置.父母;
const 两家 = [
  [父母.新郎父亲, 父母.新郎母亲].filter(Boolean).join('　'),
  [父母.新娘父亲, 父母.新娘母亲].filter(Boolean).join('　'),
].filter(Boolean);

function sweets(e: MouseEvent) {
  if (配置.结尾.喜糖计数) 撒一把();
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  emojiBlast({
    emojis: ['🍬', '🧧', '🍭', '🎉', '✨', '🍬'],
    emojiCount: calm ? 8 : 26,
    position: { x: r.left + r.width / 2, y: r.top },
    physics: { fontSize: { min: 18, max: 32 }, gravity: .3, initialVelocities: { x: { min: -9, max: 9 }, y: { min: -18, max: -11 }, rotation: { min: -8, max: 8 } }, rotation: { min: -30, max: 30 }, rotationDeceleration: .97, opacityDecay: 90 },
    process: (el) => el.setAttribute('aria-hidden', 'true'),
  });
}
</script>

<template>
  <footer ref="endEl" class="ending on-red">
    <XiMark class="end-xi" />
    <h2 class="end-big">{{ 配置.结尾.大字 }}</h2>
    <p class="end-text">{{ 配置.结尾.正文 }}</p>
    <div v-if="父母.显示 && 两家.length" class="end-parents">
      <p v-for="l in 两家" :key="l">{{ l }}</p>
      <span>{{ 配置.结尾.落款 }}</span>
    </div>
    <button class="btn btn-gold end-sweets" type="button" @click="sweets">🍬 {{ 配置.结尾.喜糖按钮 }}</button>
    <p class="end-count" aria-live="polite" :data-on="计数文字 ? '' : undefined">
      <template v-if="计数文字">{{ 计数文字.前 }}<b :key="计数文字.数">{{ 计数文字.数 }}</b>{{ 计数文字.后 }}</template>
    </p>
    <div ref="fanEl" class="end-fan" :data-in="fanIn || undefined">
      <span class="end-fan-sway"><TuanFan /></span>
    </div>
    <p class="end-sign">{{ 配置.新人.新郎 }} & {{ 配置.新人.新娘 }}　{{ 日期.点分 }}</p>
  </footer>
</template>

<style scoped>
.ending { padding: 70px 24px 46px; text-align: center; }
.end-xi { width: 64px; margin: 0 auto; color: var(--gold-light); }
.end-big { margin-top: 20px; font: 400 52px/1.2 var(--brush); letter-spacing: .3em; text-indent: .3em; color: var(--gold-light); }
.end-text { margin-top: 18px; white-space: pre-line; line-height: 2; font-size: 15.5px; }
.end-parents { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 30px; padding: 16px 0; border-top: 1px solid #c39a5266; border-bottom: 1px solid #c39a5266; }
.end-parents p { font: 22px/1.6 var(--brush); letter-spacing: .08em; }
.end-parents span { font-size: 15px; letter-spacing: .3em; color: var(--gold-light); writing-mode: vertical-rl; }
.end-parents:has(p + p) { display: grid; grid-template-columns: auto auto; justify-content: center; column-gap: 22px; }
.end-parents:has(p + p) span { grid-column: 2; grid-row: 1 / 3; }
.end-sweets { margin-top: 34px; }
.end-count { min-height: 1.9em; margin-top: 14px; color: #e9cf96cc; font-size: 13px; letter-spacing: .14em; opacity: 0; transition: opacity .6s ease; }
.end-count[data-on] { opacity: 1; }
.end-count b { display: inline-block; margin: 0 .3em; color: var(--gold-light); font: 400 19px/1 var(--song); letter-spacing: .02em; animation: bump .45s cubic-bezier(.3, 1.6, .5, 1); }
@keyframes bump { from { transform: scale(1.35); } to { transform: scale(1); } }
.end-fan { --face: 132px; width: var(--face); margin: 46px auto 0; opacity: 0; transform: translate(-70px, -60px) rotate(-30deg) scale(.85); transition: transform 1.6s cubic-bezier(.2, .7, .25, 1), opacity 1s ease; }
.end-fan[data-in] { opacity: 1; transform: none; }
.end-fan-sway { display: block; transform-origin: 50% 78%; animation: end-sway 6s ease-in-out 1.6s infinite; }
@keyframes end-sway { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(-1deg); } }
@media (prefers-reduced-motion: reduce) { .end-fan { transition: none; } .end-fan-sway, .end-count b { animation: none; } }
.end-sign { margin-top: 26px; color: #e9cf96aa; font-size: 12.5px; letter-spacing: .2em; }
</style>
