<script setup lang="ts">
// 婚礼仪典 · 红绸长卷：整幅山水红绸作底，五礼沿红绸自上而下排在画面留白处
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { 配置 } from '@/lib/wedding';

// 画面留白有两处：右上（山水右侧）放前三礼，左下（新人左侧）放后两礼；多出的接在长卷下方
const 章节 = 配置.故事.章节;
const 卷中 = 章节.slice(0, 5);
const 右上 = 卷中.slice(0, 3).map((c, i) => ({ c, i }));
const 左下 = 卷中.slice(3).map((c, i) => ({ c, i: i + 3 }));
const 卷外 = 章节.slice(5);

const root = ref<HTMLElement | null>(null);
const shown = ref<boolean[]>(卷中.map(() => false));
let io: IntersectionObserver | null = null;
onMounted(() => {
  const items = root.value?.querySelectorAll<HTMLElement>('.rite');
  if (!items?.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = shown.value.map(() => true);
    return;
  }
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      shown.value[Number((e.target as HTMLElement).dataset.i)] = true;
      io?.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  items.forEach((el) => io!.observe(el));
});
onBeforeUnmount(() => io?.disconnect());
</script>

<template>
  <section ref="root" class="sec story" aria-labelledby="story-title">
    <h2 id="story-title" class="sec-title">{{ 配置.故事.标题 }}</h2>
    <p v-if="配置.故事.引言" class="sec-sub">{{ 配置.故事.引言 }}</p>

    <div class="scroll">
      <ol class="rites rites-top">
        <li v-for="{ c, i } in 右上" :key="i" class="rite" :data-i="i" :data-on="shown[i] || undefined">
          <h3 class="rite-head"><span class="rite-no">{{ c.时间 }}</span><span class="rite-name">{{ c.标题 }}</span></h3>
          <p class="rite-text">{{ c.内容 }}</p>
        </li>
      </ol>
      <ol v-if="左下.length" class="rites rites-bottom" :start="4">
        <li v-for="{ c, i } in 左下" :key="i" class="rite" :data-i="i" :data-on="shown[i] || undefined">
          <h3 class="rite-head"><span class="rite-no">{{ c.时间 }}</span><span class="rite-name">{{ c.标题 }}</span></h3>
          <p class="rite-text">{{ c.内容 }}</p>
        </li>
      </ol>
    </div>

    <ol v-if="卷外.length" class="rites-more">
      <li v-for="(c, i) in 卷外" :key="i"><h3 class="rite-head"><span class="rite-no">{{ c.时间 }}</span><span class="rite-name">{{ c.标题 }}</span></h3><p class="rite-text">{{ c.内容 }}</p></li>
    </ol>
  </section>
</template>

<style scoped>
.story { padding-left: 0; padding-right: 0; padding-bottom: 0; background: #faeee3; }
.story .sec-title, .story .sec-sub { padding: 0 26px; }

/* 长卷：宽度铺满，按原图 941×1672 的比例 */
.scroll { position: relative; margin-top: 18px; aspect-ratio: 941 / 1672; container-type: inline-size; background: url('../assets/art/ribbon-scroll.webp') center / 100% 100% no-repeat; -webkit-mask-image: linear-gradient(transparent, #000 3%); mask-image: linear-gradient(transparent, #000 3%); }

.rites { position: absolute; display: flex; flex-direction: column; gap: 3.6cqw; }
.rites-top { left: 47%; right: 4%; top: 4.5%; }
.rites-top .rite:nth-child(3) { margin-left: 18%; }
.rites-bottom { left: 5%; width: 50%; bottom: 3%; }
.rite { text-align: left; opacity: 0; transform: translateY(14px); transition: opacity .9s ease, transform .9s cubic-bezier(.2, .7, .3, 1); }
.rite[data-on] { opacity: 1; transform: none; }
.rite-head { display: flex; align-items: baseline; gap: .55em; font-weight: 400; }
.rite-no { flex: none; color: #a07a45; font: 400 clamp(10.5px, 2.8cqw, 14px)/1 var(--song); letter-spacing: .12em; }
.rite-name { color: var(--red); font: 400 clamp(17px, 4.9cqw, 26px)/1.4 var(--song); letter-spacing: .12em; }
.rite-text { margin-top: .25em; color: #5e4636; font: 400 clamp(11.5px, 3.1cqw, 15.5px)/1.75 var(--song); letter-spacing: .02em; text-shadow: 0 0 2px #faeee3, 0 0 6px #faeee3, 0 0 12px #faeee3; }

/* 超过五礼时，多出的环节接在长卷下方 */
.rites-more { padding: 10px 32px 60px; text-align: left; }
.rites-more li + li { margin-top: 28px; }
</style>
