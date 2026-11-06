<script setup lang="ts">
import { 配置, 日期, 农历, 取照片, 看位置 } from '@/lib/wedding';
import PhotoFrame from './PhotoFrame.vue';
import MapDirections from './MapDirections.vue';
import SaveImage from './SaveImage.vue';
import XiMark from './XiMark.vue';

defineEmits<{ preview: [src: string] }>();
const pic = 取照片(配置.时间地点.酒店照片, '时间地点.酒店照片');
const 月名 = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][日期.月];
</script>

<template>
  <section id="venue" class="sec paper venue" aria-labelledby="venue-title">
    <h2 id="venue-title" class="sec-title">{{ 配置.时间地点.标题 }}</h2>

    <div class="cal" aria-label="婚礼日历">
      <p class="cal-head"><span>{{ 日期.年 }}</span><b>{{ 月名 }}月</b></p>
      <div class="cal-week" aria-hidden="true"><span v-for="w in '一二三四五六日'" :key="w">{{ w }}</span></div>
      <div class="cal-grid">
        <span v-for="n in 日期.日历空位" :key="`b${n}`" aria-hidden="true" />
        <span v-for="d in 日期.当月天数" :key="d" :class="{ on: d === 日期.日 }" :aria-current="d === 日期.日 ? 'date' : undefined">
          {{ d }}<XiMark v-if="d === 日期.日" class="cal-xi" />
        </span>
      </div>
      <p class="cal-foot">{{ 日期.公历 }}　{{ 日期.星期 }}<br /><small>农历 {{ 农历 }}</small></p>
    </div>

    <dl class="times">
      <div><dt>迎宾</dt><dd>{{ 配置.婚礼.迎宾 }}</dd></div>
      <div><dt>吉时</dt><dd>{{ 配置.婚礼.吉时 }}</dd></div>
    </dl>

    <div class="place">
      <h3>{{ 配置.婚礼.酒店 }}</h3>
      <p class="hall">{{ 配置.婚礼.厅 }}</p>
      <p class="addr">{{ 配置.婚礼.地址 }}</p>
      <p v-if="配置.时间地点.补充说明" class="note">{{ 配置.时间地点.补充说明 }}</p>
    </div>
    <PhotoFrame v-if="pic.文件 || 看位置" class="venue-pic" :photo="pic" :alt="配置.婚礼.酒店" previewable @preview="$emit('preview', pic.src)" />
    <div class="actions">
      <MapDirections />
      <SaveImage />
    </div>
  </section>
</template>

<style scoped>
.cal { margin: 34px auto 0; max-width: 340px; padding: 22px 18px 18px; background: #fbf4e6; box-shadow: 0 0 0 1px #c39a5266, 0 12px 26px #6f121814; }
.cal-head { display: flex; align-items: baseline; justify-content: center; gap: 12px; color: var(--ink-soft); font-size: 15px; letter-spacing: .14em; }
.cal-head b { color: var(--red); font: 400 30px/1 var(--brush); }
.cal-week, .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.cal-week { margin-top: 16px; padding-bottom: 6px; border-bottom: 1px solid #c39a5266; color: var(--ink-soft); font-size: 13px; }
.cal-grid { row-gap: 4px; margin-top: 8px; font-size: 15px; font-variant-numeric: tabular-nums; }
.cal-grid span { position: relative; display: grid; place-items: center; height: 36px; color: var(--ink); }
.cal-grid .on { width: 34px; height: 34px; margin: 1px auto; border-radius: 50%; background: var(--red); color: var(--cream); box-shadow: 0 0 0 2px #fbf4e6, 0 0 0 3px var(--gold); }
.cal-xi { position: absolute; right: -9px; top: -10px; width: 17px; padding: 2px; box-sizing: content-box; border-radius: 50%; background: #fbf4e6; color: var(--red-bright); }
.cal-foot { margin-top: 12px; padding-top: 12px; border-top: 1px solid #c39a5266; font-size: 16px; letter-spacing: .12em; }
.cal-foot small { color: var(--ink-soft); font-size: 14px; }
.times { display: flex; justify-content: center; gap: 0; margin-top: 30px; }
.times div { padding: 0 30px; }
.times div + div { border-left: 1px solid #c39a5299; }
.times dt { color: var(--ink-soft); font-size: 13px; letter-spacing: .3em; }
.times dd { color: var(--red); font-size: 30px; line-height: 1.4; font-variant-numeric: tabular-nums; }
.place { margin-top: 28px; }
.place h3 { font: 400 32px/1.35 var(--brush); color: var(--ink); letter-spacing: .06em; }
.hall { color: var(--red); font-size: 17px; letter-spacing: .14em; }
.addr { margin-top: 4px; color: var(--ink-soft); font-size: 14px; }
.note { display: inline-block; margin-top: 12px; padding: 4px 12px; background: #c39a521f; color: var(--ink-soft); font-size: 13.5px; }
.venue-pic { margin-top: 24px; box-shadow: 0 0 0 5px #fff, 0 0 0 6px #c39a5244; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.actions > :deep(.btn) { flex: 1 1 40%; padding-left: 10px; padding-right: 10px; }
</style>
