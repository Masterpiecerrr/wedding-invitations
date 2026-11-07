<script setup lang="ts">
// 一把团扇：圆形花鸟扇面 + 木质扇柄 + 流苏。大小由父级的 --face（扇面直径）决定。
import { useId } from 'vue';
const id = useId();
</script>

<template>
  <span class="tuan" aria-hidden="true">
    <span class="tuan-face"><slot /></span>
    <svg class="tuan-handle" viewBox="0 0 60 180">
      <defs>
        <linearGradient :id="`${id}w`" x1="0" x2="1">
          <stop offset="0" stop-color="#b88b48" /><stop offset=".35" stop-color="#eed49a" /><stop offset=".6" stop-color="#f6e2b2" /><stop offset="1" stop-color="#ba8f4e" />
        </linearGradient>
        <linearGradient :id="`${id}g`" x1="0" x2="1">
          <stop offset="0" stop-color="#a77d3e" /><stop offset=".5" stop-color="#f3dca4" /><stop offset="1" stop-color="#9a7134" />
        </linearGradient>
      </defs>
      <path d="M20 1h20l-3 12H23z" :fill="`url(#${id}g)`" />
      <path d="M23 10h14l-2 76q-5 3-10 0z" :fill="`url(#${id}w)`" />
      <path d="M27 15l1 65M32 16v65M35 15l-2 64" fill="none" stroke="#a87c3e" stroke-width=".5" opacity=".32" />
      <path d="M24 46h12M24 48h12" stroke="#b88b48" stroke-width=".6" opacity=".55" />
      <rect x="24" y="84" width="12" height="3" rx="1.5" :fill="`url(#${id}g)`" />
      <rect x="26" y="87" width="8" height="4" rx="1" :fill="`url(#${id}g)`" />
      <g class="tuan-tassel">
        <path d="M29 91C24 101 28 106 30 113C32 106 36 101 31 91" fill="none" stroke="#cd7563" stroke-width="1.1" />
        <circle cx="30" cy="116" r="4.2" fill="#eee1b9" stroke="#c6ad75" stroke-width=".6" />
        <ellipse cx="29" cy="114.5" rx="1.5" ry="1" fill="#fff4d9" opacity=".75" />
        <path d="M28 121Q30 119 32 121L33 126H27z" fill="#bd6755" />
        <path
          v-for="strand in 19"
          :key="strand"
          :d="`M${27 + strand * .3} 125 C${23 + strand * .5} 141 ${25 + strand * .9} 157 ${29 + strand * 1.15} ${174 - strand * .65}`"
          fill="none"
          :stroke="strand % 3 === 0 ? '#e7a083' : strand % 3 === 1 ? '#c77b65' : '#ad5447'"
          stroke-width=".65"
          stroke-linecap="round"
        />
        <path d="M27 123h6M27 125h6" stroke="#e1a081" stroke-width=".7" />
      </g>
    </svg>
  </span>
</template>

<style scoped>
.tuan { position: relative; display: block; width: var(--face); height: calc(var(--face) * 1.56); }
.tuan-face { position: absolute; top: 0; left: 0; display: grid; place-items: center; width: var(--face); aspect-ratio: 1; border-radius: 50%; background: #f5eddb url('../assets/art/round-silk.webp') center / cover no-repeat; box-shadow: 0 0 0 2px #d9b778, 0 0 0 5px #831f24, 0 0 0 6px #dec08a66, 0 16px 34px #2a0508a6; }
.tuan-face::after { content: ''; position: absolute; inset: 7px; border-radius: 50%; border: 1px solid #c9a46340; pointer-events: none; }
.tuan-handle { position: absolute; left: 50%; top: calc(var(--face) - 4px); width: calc(var(--face) * .19); transform: translateX(-50%); overflow: visible; }
.tuan-tassel { transform-origin: 30px 91px; transform-box: view-box; animation: tassel 2.8s ease-in-out infinite; }
@keyframes tassel { 0%, 100% { transform: rotate(5deg); } 50% { transform: rotate(-4deg); } }
@media (prefers-reduced-motion: reduce) { .tuan-tassel { animation: none; } }
</style>
