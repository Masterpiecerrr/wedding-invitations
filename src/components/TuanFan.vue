<script setup lang="ts">
// 一把团扇：圆形花鸟扇面 + 木质扇柄 + 流苏。大小由父级的 --face（扇面直径）决定。
import { useId } from 'vue';
const id = useId();
</script>

<template>
  <span class="tuan" aria-hidden="true">
    <span class="tuan-face"><slot /></span>
    <svg class="tuan-handle" viewBox="0 0 40 220">
      <defs>
        <linearGradient :id="`${id}w`" x1="0" x2="1">
          <stop offset="0" stop-color="#2a170f" /><stop offset=".45" stop-color="#5a3622" /><stop offset="1" stop-color="#22120b" />
        </linearGradient>
        <linearGradient :id="`${id}g`" x1="0" x2="1">
          <stop offset="0" stop-color="#a77d3e" /><stop offset=".5" stop-color="#f3dca4" /><stop offset="1" stop-color="#9a7134" />
        </linearGradient>
        <linearGradient :id="`${id}s`" x1="0" x2="1">
          <stop offset="0" stop-color="#4a090e" /><stop offset=".5" stop-color="#7a1820" /><stop offset="1" stop-color="#43080d" />
        </linearGradient>
      </defs>
      <path d="M12 0h16l-3 12H15z" :fill="`url(#${id}g)`" />
      <rect x="16" y="12" width="8" height="104" rx="2" :fill="`url(#${id}w)`" />
      <rect x="15" y="34" width="10" height="3" :fill="`url(#${id}g)`" />
      <rect x="15" y="92" width="10" height="3" :fill="`url(#${id}g)`" />
      <circle cx="20" cy="121" r="5" :fill="`url(#${id}g)`" />
      <g class="tuan-tassel">
        <line x1="20" y1="126" x2="20" y2="142" stroke="#c9a463" stroke-width="1.2" />
        <path d="M20 140l6 6-6 6-6-6z" :fill="`url(#${id}g)`" />
        <rect x="15.5" y="152" width="9" height="6" rx="1" :fill="`url(#${id}g)`" />
        <path d="M15.5 158h9l5 58q-9.5 4-19 0z" :fill="`url(#${id}s)`" />
        <path d="M18 160l-3 54M20 160v56M22 160l3 54" stroke="#c9a463" stroke-width=".5" opacity=".55" />
      </g>
    </svg>
  </span>
</template>

<style scoped>
.tuan { position: relative; display: block; width: var(--face); height: calc(var(--face) * 1.82); }
.tuan-face { position: absolute; top: 0; left: 0; display: grid; place-items: center; width: var(--face); aspect-ratio: 1; border-radius: 50%; background: #f5eddb url('../assets/art/round-silk.webp') center / cover no-repeat; box-shadow: 0 0 0 2px #d9b778, 0 0 0 5px #831f24, 0 0 0 6px #dec08a66, 0 16px 34px #2a0508a6; }
.tuan-face::after { content: ''; position: absolute; inset: 7px; border-radius: 50%; border: 1px solid #c9a46340; pointer-events: none; }
.tuan-handle { position: absolute; left: 50%; top: calc(var(--face) - 4px); width: calc(var(--face) * .145); transform: translateX(-50%); overflow: visible; }
.tuan-tassel { transform-origin: 20px 126px; transform-box: view-box; animation: tassel 2.8s ease-in-out infinite; }
@keyframes tassel { 0%, 100% { transform: rotate(5deg); } 50% { transform: rotate(-4deg); } }
@media (prefers-reduced-motion: reduce) { .tuan-tassel { animation: none; } }
</style>
