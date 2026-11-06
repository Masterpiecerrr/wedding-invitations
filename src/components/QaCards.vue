<script setup lang="ts">
import { reactive } from 'vue';
import { 配置 } from '@/lib/wedding';

const flipped = reactive<Record<number, boolean>>({});
</script>

<template>
  <section class="sec paper qa" aria-labelledby="qa-title">
    <h2 id="qa-title" class="sec-title">{{ 配置.问答.标题 }}</h2>
    <p v-if="配置.问答.说明" class="sec-sub">{{ 配置.问答.说明 }}</p>
    <ul class="qa-grid" :data-odd="配置.问答.题目.length % 2 === 1 || undefined">
      <li v-for="(q, i) in 配置.问答.题目" :key="i">
        <button class="card" type="button" :aria-pressed="!!flipped[i]" :aria-label="flipped[i] ? `${q.问} 答：${q.答}` : `${q.问}（点击看答案）`" @click="flipped[i] = !flipped[i]">
          <span class="face front" aria-hidden="true"><i>问</i><b>{{ q.问 }}</b></span>
          <span class="face back" aria-hidden="true"><i>答</i><b>{{ q.答 }}</b></span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 34px; }
.qa-grid[data-odd] li:last-child { grid-column: 1 / -1; }
.card { position: relative; display: block; width: 100%; min-height: 150px; padding: 0; border: 0; background: none; perspective: 900px; }
.qa-grid[data-odd] li:last-child .card { min-height: 120px; }
.face { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 18px 14px; backface-visibility: hidden; -webkit-backface-visibility: hidden; transition: transform .6s cubic-bezier(.3, .7, .3, 1); }
.face i { font: normal 13px/1 var(--brush); display: grid; place-items: center; width: 26px; height: 26px; border-radius: 2px; }
.front { background: var(--red); color: var(--cream); box-shadow: inset 0 0 0 5px var(--red), inset 0 0 0 6px #c39a52aa; }
.front i { background: var(--gold-light); color: var(--red); }
.front b { font: 400 21px/1.45 var(--brush); letter-spacing: .04em; }
.back { background: #fbf4e6; color: var(--ink); transform: rotateY(180deg); box-shadow: inset 0 0 0 1px #c39a5288, 0 6px 16px #6f121814; }
.back i { background: var(--red); color: var(--cream); }
.back b { font-weight: 400; font-size: 15px; line-height: 1.75; }
.card[aria-pressed='true'] .front { transform: rotateY(-180deg); }
.card[aria-pressed='true'] .back { transform: rotateY(0); }
</style>
