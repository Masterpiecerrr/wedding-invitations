<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { 配置, 日期, 农历, 取照片 } from '@/lib/wedding';
import PhotoFrame from './PhotoFrame.vue';
import XiMark from './XiMark.vue';

defineEmits<{ preview: [] }>();
const cover = 取照片(配置.首屏.照片, '首屏.照片');
const now = ref(Date.now());
let timer = 0;
onMounted(() => { timer = window.setInterval(() => (now.value = Date.now()), 1000); });
onBeforeUnmount(() => window.clearInterval(timer));
const left = computed(() => {
  const ms = 日期.吉时时间戳 - now.value;
  if (ms <= 0) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    { v: String(Math.floor(ms / 864e5)), u: '天' },
    { v: pad(Math.floor(ms / 36e5) % 24), u: '时' },
    { v: pad(Math.floor(ms / 6e4) % 60), u: '分' },
    { v: pad(Math.floor(ms / 1e3) % 60), u: '秒' },
  ];
});
</script>

<template>
  <header class="hero on-red">
    <div class="moon">
      <PhotoFrame class="moon-photo" :photo="cover" ratio="1 / 1" :alt="`${配置.新人.新郎}与${配置.新人.新娘}`" eager previewable @preview="$emit('preview')" />
      <XiMark class="moon-xi" />
    </div>
    <p class="hero-lead">{{ 配置.首屏.上款 }}</p>
    <h1 class="hero-names"><span>{{ 配置.新人.新郎 }}</span><i aria-label="与">&</i><span>{{ 配置.新人.新娘 }}</span></h1>
    <p class="hero-quote">{{ 配置.首屏.引语 }}</p>
    <p class="hero-date"><time :datetime="配置.婚礼.日期">{{ 日期.中文年月日 }}</time><br /><small>{{ 农历 }}　{{ 日期.星期 }}</small></p>
    <p v-if="left" class="countdown" aria-label="距离婚礼">
      <span class="cd-label">距吉时</span>
      <template v-for="x in left" :key="x.u"><b>{{ x.v }}</b><small>{{ x.u }}</small></template>
    </p>
    <p v-else class="countdown"><span class="cd-label">良辰已至</span></p>
    <a class="scroll-cue" href="#main" aria-label="向下浏览">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 6 6 6-6M6 12l6 6 6-6" /></svg>
    </a>
  </header>
</template>

<style scoped>
.hero { position: relative; min-height: 100svh; padding: 40px 24px 28px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.hero-houses { font: 22px/1.4 var(--brush); letter-spacing: .3em; color: var(--gold-light); }
.moon { position: relative; width: min(62vw, 270px); margin-top: 26px; }
.moon-photo { border-radius: 50%; box-shadow: 0 0 0 5px var(--red), 0 0 0 7px var(--gold), 0 0 0 15px var(--red), 0 0 0 16px #c39a5288, 0 18px 50px #2a0508aa; }
.moon-photo :deep(.pf-empty) { background: radial-gradient(circle, #b8282c, #8a171d); color: #e9cf96aa; }
.moon-xi { position: absolute; left: 50%; bottom: -26px; width: 52px; transform: translateX(-50%); color: var(--gold-light); padding: 8px; box-sizing: content-box; background: var(--red); border-radius: 50%; box-shadow: 0 0 0 1px var(--gold); }
.hero-lead { margin-top: 40px; color: var(--gold-light); font-size: 14px; letter-spacing: .4em; }
.hero-names { display: flex; align-items: baseline; justify-content: center; flex-wrap: wrap; gap: 4px 14px; margin-top: 6px; font: 400 44px/1.3 var(--brush); letter-spacing: .06em; color: var(--cream); }
.hero-names i { color: var(--gold); font: italic 26px Georgia, serif; }
.hero-quote { margin-top: 10px; font: 20px/1.6 var(--brush); color: var(--gold-light); letter-spacing: .2em; }
.hero-date { margin-top: 14px; font-size: 18px; letter-spacing: .18em; line-height: 1.9; }
.hero-date small { font-size: 14px; color: var(--gold-light); letter-spacing: .14em; }
.countdown { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-top: 14px; padding: 8px 18px; border-top: 1px solid #c39a5266; border-bottom: 1px solid #c39a5266; font-variant-numeric: tabular-nums; }
.countdown b { font-size: 24px; font-weight: 400; color: var(--cream); }
.countdown small { margin-right: 6px; font-size: 12px; color: var(--gold-light); }
.cd-label { margin-right: 10px; font-size: 13px; color: var(--gold-light); letter-spacing: .2em; }
.scroll-cue { margin-top: auto; padding-top: 22px; color: var(--gold-light); }
.scroll-cue svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 1.5; animation: cue 2s ease-in-out infinite; }
@keyframes cue { 50% { transform: translateY(5px); opacity: .5; } }
</style>
