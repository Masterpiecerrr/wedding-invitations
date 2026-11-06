<script setup lang="ts">
import { ref } from 'vue';
import { 配置, assets } from '@/lib/wedding';

const audio = ref<HTMLAudioElement | null>(null);
const playing = ref(false);
async function play() { try { await audio.value?.play(); } catch { /* 浏览器不允许自动播放时，等用户点按钮 */ } }
function toggle() { if (audio.value?.paused) void play(); else audio.value?.pause(); }
defineExpose({ play });
const label = [配置.音乐.歌名, 配置.音乐.歌手].filter(Boolean).join(' · ');
</script>

<template>
  <template v-if="assets.music">
    <audio ref="audio" :src="assets.music" loop preload="auto" playsinline @play="playing = true" @pause="playing = false" />
    <button class="music" type="button" :data-on="playing || undefined" :aria-pressed="playing" :aria-label="`${playing ? '暂停' : '播放'}背景音乐${label ? '：' + label : ''}`" @click="toggle">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5V6l10-2v11.5" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="15.5" r="2.5" /></svg>
    </button>
  </template>
</template>

<style scoped>
.music { position: fixed; z-index: 40; top: 14px; right: max(14px, calc(50vw - var(--col) / 2 + 14px)); display: grid; place-items: center; width: 42px; height: 42px; padding: 0; border: 1px solid var(--gold); border-radius: 50%; background: radial-gradient(circle, #2b1d18 0 30%, #1a0f0c 31% 100%); color: var(--gold-light); box-shadow: 0 2px 10px #0006, inset 0 0 0 4px #1a0f0c, inset 0 0 0 5px #c39a5255; }
.music svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.6; }
.music[data-on] { animation: spin 5s linear infinite; }
.music:not([data-on])::after { content: ''; position: absolute; width: 30px; height: 1.5px; background: var(--gold-light); transform: rotate(-45deg); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
