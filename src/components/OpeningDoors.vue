<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { 配置, 双姓, 日期 } from '@/lib/wedding';
import XiMark from './XiMark.vue';

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
  <div class="doors" :data-state="state" role="dialog" aria-modal="true" aria-label="请柬封面">
    <div class="door door-l" aria-hidden="true"><i class="studs" /></div>
    <div class="door door-r" aria-hidden="true"><i class="studs" /></div>
    <div class="door-copy">
      <p class="door-houses">{{ 双姓 }}</p>
      <p class="door-date">{{ 日期.中文年月日 }}</p>
      <button class="knocker" type="button" :aria-label="`开启请柬：${配置.新人.新郎}与${配置.新人.新娘}的婚礼`" @click="open">
        <span class="knocker-ring" aria-hidden="true" />
        <span class="knocker-face"><XiMark v-if="配置.开场.题字 === '囍'" class="knocker-xi" /><b v-else>{{ 配置.开场.题字 }}</b></span>
      </button>
      <p class="door-hint">{{ 配置.开场.提示 }}</p>
    </div>
  </div>
</template>

<style scoped>
.doors { position: fixed; inset: 0; z-index: 50; perspective: 1400px; pointer-events: auto; }
.doors[data-state='opening'] { pointer-events: none; }
.door { position: absolute; top: 0; bottom: 0; width: 50%; background-color: var(--red); background-image: radial-gradient(ellipse at 50% 40%, #b0242a 0, var(--red) 55%, var(--red-deep) 100%); box-shadow: inset 0 0 0 10px var(--red-deep), inset 0 0 0 12px var(--gold), inset 0 0 0 22px var(--red-deep), inset 0 0 0 23px #c39a5288; transition: transform 1.5s cubic-bezier(.6, .02, .25, 1) .15s; backface-visibility: hidden; }
.door-l { left: 0; transform-origin: left center; }
.door-r { right: 0; transform-origin: right center; }
.doors[data-state='opening'] .door-l { transform: rotateY(-108deg); }
.doors[data-state='opening'] .door-r { transform: rotateY(108deg); }
/* 门钉：五行四列的金色圆钉 */
.studs { position: absolute; inset: 15% 18% 15%; background: radial-gradient(circle at 50% 45%, #f6e1ac 0 2px, #c39a52 3.5px, #7a5524 6px, transparent 6.6px) 0 0 / 25% 20%; opacity: .92; }
.door-l::after, .door-r::after { content: ''; position: absolute; top: 0; bottom: 0; width: 2px; background: #3f080c; }
.door-l::after { right: 0; } .door-r::after { left: 0; }

.door-copy { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--gold-light); text-align: center; transition: opacity .35s; pointer-events: none; }
.doors[data-state='opening'] .door-copy { opacity: 0; }
.door-houses { padding: 6px 18px; background: var(--red-deep); font: 26px/1.4 var(--brush); letter-spacing: .2em; box-shadow: 0 0 0 1px #c39a5266; }
.door-date { margin-top: 10px; padding: 2px 12px; background: var(--red-deep); font-size: 13px; letter-spacing: .3em; }
.knocker { position: relative; width: 132px; height: 132px; margin-top: 40px; padding: 0; border: 0; border-radius: 50%; background: transparent; pointer-events: auto; }
.knocker-face { position: absolute; inset: 0; display: grid; place-items: center; border-radius: 50%; background: radial-gradient(circle at 38% 32%, #f8e3ad, #c39a52 48%, #7d5622 100%); box-shadow: 0 6px 18px #0007, inset 0 0 0 6px #a37a3b, inset 0 0 0 8px #f4dca2; }
.knocker-xi { width: 64px; color: var(--red); }
.knocker-face b { color: var(--red); font: 400 56px/1 var(--brush); }
.knocker-ring { position: absolute; inset: -10px; border: 2px solid #e9cf96aa; border-radius: 50%; animation: breathe 2.6s ease-in-out infinite; }
@keyframes breathe { 0%, 100% { transform: scale(.94); opacity: .9; } 50% { transform: scale(1.06); opacity: .25; } }
.door-hint { margin-top: 26px; padding: 2px 12px; background: var(--red-deep); font-size: 14px; letter-spacing: .24em; }
</style>
