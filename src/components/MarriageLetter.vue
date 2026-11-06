<script setup lang="ts">
import { 配置, 日期, 取照片, 看位置 } from '@/lib/wedding';
import PhotoFrame from './PhotoFrame.vue';

defineEmits<{ preview: [src: string] }>();
const pic = 取照片(配置.婚书.配图, '婚书.配图');
const seal = Array.from(配置.婚书.印章.trim());
</script>

<template>
  <section class="sec paper letter-sec" aria-labelledby="letter-title">
    <article class="letter">
      <h2 id="letter-title" class="letter-title">{{ 配置.婚书.标题 }}</h2>
      <p class="letter-body">{{ 配置.婚书.正文 }}</p>
      <footer class="letter-sign">
        <dl>
          <div><dt>新郎</dt><dd>{{ 配置.新人.新郎 }}</dd></div>
          <div><dt>新娘</dt><dd>{{ 配置.新人.新娘 }}</dd></div>
        </dl>
        <p class="letter-date">{{ 日期.中文年月日 }}</p>
        <span v-if="seal.length" class="seal" :data-count="seal.length" aria-hidden="true"><b v-for="(c, i) in seal" :key="i">{{ c }}</b></span>
      </footer>
    </article>
    <PhotoFrame v-if="pic.文件 || 看位置" class="letter-pic" :photo="pic" :alt="`${配置.新人.新郎}与${配置.新人.新娘}`" previewable @preview="$emit('preview', pic.src)" />
  </section>
</template>

<style scoped>
.letter { position: relative; padding: 34px 22px 26px; background: #fbf4e6; box-shadow: 0 0 0 1px #c39a5266, 0 14px 30px #6f12181a; }
.letter::before { content: ''; position: absolute; inset: 8px; border: 2px solid var(--red); outline: 1px solid var(--red); outline-offset: 3px; pointer-events: none; opacity: .85; }
.letter-title { color: var(--red); font: 400 40px/1 var(--brush); letter-spacing: .5em; text-indent: .5em; }
/* 竖排正文，列与列之间是朱红丝栏 */
.letter-body {
  writing-mode: vertical-rl; text-orientation: mixed;
  height: calc(14 * 1.06em); margin: 26px auto 0; max-width: 100%; overflow-x: auto;
  font-size: 17px; line-height: 2.1; letter-spacing: .06em; text-align: start;
  color: var(--ink);
  background-image: linear-gradient(to left, #9e1c2259 1px, transparent 1px);
  background-size: 2.1em 100%; background-position: right top;
  border-left: 1px solid #9e1c2259;
  padding-right: 1px;
  width: fit-content;
}
.letter-sign { position: relative; display: grid; grid-template-columns: auto auto; justify-content: center; align-items: center; column-gap: 26px; margin-top: 26px; padding-top: 18px; border-top: 1px dashed #c39a52aa; }
.letter-sign dl { display: grid; gap: 0; text-align: left; }
.letter-sign dl div { display: flex; align-items: baseline; gap: 8px; }
.letter-sign dt { color: var(--ink-soft); font-size: 13px; letter-spacing: .2em; }
.letter-sign dd { font: 26px/1.4 var(--brush); color: var(--ink); }
.letter-date { grid-column: 1; margin-top: 6px; color: var(--ink-soft); font-size: 14px; letter-spacing: .24em; }
.seal { grid-column: 2; grid-row: 1 / 3; display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-flow: column; grid-template-rows: repeat(2, 1fr); direction: rtl; width: 68px; height: 68px; padding: 6px; background: var(--red-bright); border-radius: 3px; color: #fbeee0; font: 22px/1 var(--brush); transform: rotate(-6deg); box-shadow: inset 0 0 0 2px #fbeee0, inset 0 0 0 3px var(--red-bright); opacity: .92; mix-blend-mode: multiply; }
.seal b { display: grid; place-items: center; font-weight: 400; }
.seal[data-count='1'], .seal[data-count='2'] { grid-template-columns: 1fr; grid-template-rows: none; grid-auto-flow: row; direction: ltr; font-size: 24px; }
.seal[data-count='3'] { grid-template-rows: repeat(2, 1fr); }
.letter-pic { margin-top: 30px; box-shadow: 0 0 0 6px #fff, 0 0 0 7px #c39a5244, 0 14px 28px #6f121822; }
</style>
