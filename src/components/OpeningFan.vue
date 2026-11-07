<script setup lang="ts">
// 开场 · 却扇：团扇遮面，轻触移开，得见新人
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { 配置, 双姓, 日期 } from '@/lib/wedding';
import XiMark from './XiMark.vue';
import TuanFan from './TuanFan.vue';

const emit = defineEmits<{ opening: []; opened: [] }>();
const state = ref<'closed' | 'opening'>('closed');

function open() {
  if (state.value !== 'closed') return;
  state.value = 'opening';
  emit('opening');
  const quick = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(() => emit('opened'), quick ? 50 : 1700);
}
onMounted(() => document.body.classList.add('is-locked'));
onBeforeUnmount(() => document.body.classList.remove('is-locked'));
</script>

<template>
  <div class="cover" :data-state="state" role="dialog" aria-modal="true" aria-label="请柬封面" @click="open">
    <div class="cover-bg" aria-hidden="true" />
    <div class="cover-body">
      <p class="cover-houses cover-text">{{ 双姓 }}</p>

      <button class="fan" type="button" :aria-label="`开启请柬：${配置.新人.新郎}与${配置.新人.新娘}的婚礼`" @click.stop="open">
        <span class="fan-sway"><TuanFan /></span>
      </button>

      <h1 class="cover-names cover-text">
        <span>{{ 配置.新人.新郎 }}</span>
        <span class="cover-seal" aria-hidden="true"><XiMark v-if="配置.开场.题字 === '囍'" /><b v-else>{{ 配置.开场.题字 }}</b></span>
        <span>{{ 配置.新人.新娘 }}</span>
      </h1>
      <p class="cover-date cover-text">{{ 日期.中文年月日 }}</p>
      <p class="cover-hint cover-text">{{ 配置.开场.提示 }}</p>
    </div>
  </div>
</template>

<style scoped>
.cover { --face: min(52vw, 230px, 25svh); position: fixed; top: 0; bottom: 0; left: 50%; z-index: 50; width: var(--col); transform: translateX(-50%); cursor: pointer; overflow: hidden; }
.cover[data-state='opening'] { pointer-events: none; }

/* 朱红底 + 细金线框 */
.cover-bg { position: absolute; inset: 0; background-color: var(--red); background-image: radial-gradient(ellipse at 50% 32%, #a735354d, transparent 65%), repeating-linear-gradient(20deg, #ffffff03 0 1px, transparent 1px 5px); transition: opacity .9s ease .6s; }
.cover-bg::before { content: ''; position: absolute; inset: 25px; border: 1px solid #dec08a55; }
.cover[data-state='opening'] .cover-bg { opacity: 0; }

.cover-body { position: relative; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 28px; color: #f1dfbf; text-align: center; }
.cover-text { transition: opacity .4s ease; }
.cover[data-state='opening'] .cover-text { opacity: 0; }

.cover-houses { margin-bottom: 26px; font: 400 12px/1.8 var(--song); letter-spacing: .32em; opacity: .85; }

/* ───── 团扇 ───── */
.fan { position: relative; width: var(--face); height: calc(var(--face) * 1.82); padding: 0; border: 0; background: none; flex: none; transition: transform 1.35s cubic-bezier(.55, .05, .3, 1), opacity .8s ease .5s; }
.fan:focus-visible { outline: 2px solid var(--gold-light); outline-offset: 6px; border-radius: 50% 50% 0 0; }
.fan-sway { position: absolute; inset: 0; transform-origin: 50% 78%; animation: sway 5.5s ease-in-out infinite; }
@keyframes sway { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(-3deg); } }

/* 却扇：团扇向左上移开，露出底下的新人 */
.cover[data-state='opening'] .fan { transform: translate(-48vw, -16svh) rotate(-32deg) scale(.82); opacity: 0; }
.cover[data-state='opening'] .fan-sway { animation-play-state: paused; }

.cover-names { display: flex; align-items: center; justify-content: center; gap: 16px; width: 100%; margin-top: 4px; font: 400 clamp(25px, 7.6vw, 38px)/1.6 var(--song); letter-spacing: .08em; }
.cover-seal { display: grid; place-items: center; flex: none; width: 25px; height: 29px; padding: 5px; border: 1px solid #d9b78d; color: #e4c79e; transform: rotate(-3deg); }
.cover-seal .xi { width: 100%; }
.cover-seal b { font: 400 11px/1.2 var(--song); }
.cover-date { margin-top: 12px; font: 400 12px/1.9 var(--song); letter-spacing: .2em; opacity: .85; }
.cover-hint { margin-top: 30px; padding: 10px 6px; border-bottom: 1px solid #dec08a60; font-size: 12px; letter-spacing: .24em; animation: hint 2.6s ease-in-out infinite; }
@keyframes hint { 0%, 100% { opacity: .95; } 50% { opacity: .5; } }

@media (max-width: 360px) {
  .cover-names { font-size: 24px; gap: 10px; }
}
@media (max-height: 620px) {
  .cover { --face: min(46vw, 22svh); }
  .cover-houses { margin-bottom: 12px; }
  .cover-hint { margin-top: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .fan-sway, .cover-hint { animation: none; }
}
</style>
