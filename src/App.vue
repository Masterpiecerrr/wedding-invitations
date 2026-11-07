<script setup lang="ts">
import { computed, ref, type Component } from 'vue';
import { 配置, 取照片 } from '@/lib/wedding';
import type { 模块名 } from '@/config/define';
import OpeningFan from '@/components/OpeningFan.vue';
import HeroSection from '@/components/HeroSection.vue';
import MarriageLetter from '@/components/MarriageLetter.vue';
import StoryTrail from '@/components/StoryTrail.vue';
import QaCards from '@/components/QaCards.vue';
import GalleryStrip from '@/components/GalleryStrip.vue';
import ScheduleList from '@/components/ScheduleList.vue';
import VenueSection from '@/components/VenueSection.vue';
import RsvpCard from '@/components/RsvpCard.vue';
import EndingSection from '@/components/EndingSection.vue';
import MusicButton from '@/components/MusicButton.vue';
import FallingPetals from '@/components/FallingPetals.vue';
import PhotoLightbox from '@/components/PhotoLightbox.vue';

const 模块: Record<模块名, Component> = {
  婚书: MarriageLetter, 故事: StoryTrail, 问答: QaCards, 相册: GalleryStrip,
  流程: ScheduleList, 时间地点: VenueSection, 回执: RsvpCard, 结尾: EndingSection,
};
const 顺序 = 配置.模块顺序.filter((k, i, all) => k in 模块 && all.indexOf(k) === i);

const opened = ref(false);
const petals = ref(false);
const music = ref<InstanceType<typeof MusicButton> | null>(null);
function onOpening() {
  window.scrollTo(0, 0);
  petals.value = true;
  void music.value?.play();
}

// 所有已选好的照片按页面顺序组成大图浏览列表
const 大图 = computed(() => {
  const list = [取照片(配置.首屏.照片, '')];
  for (const k of 顺序) {
    if (k === '婚书') list.push(取照片(配置.婚书.配图, ''));
    if (k === '故事') 配置.故事.章节.forEach((c) => list.push(取照片(c.照片, '')));
    if (k === '相册') 配置.相册.照片.forEach((p) => list.push(取照片(p, '')));
    if (k === '时间地点') list.push(取照片(配置.时间地点.酒店照片, ''));
  }
  const seen = new Set<string>();
  return list.filter((p) => p.src && !seen.has(p.src) && seen.add(p.src)).map((p) => ({ src: p.src, alt: `${配置.新人.新郎}与${配置.新人.新娘}` }));
});
const previewIndex = ref<number | null>(null);
function preview(src?: string) {
  const i = 大图.value.findIndex((p) => p.src === src);
  if (i >= 0) previewIndex.value = i;
}
</script>

<template>
  <OpeningFan v-if="!opened" @opening="onOpening" @opened="opened = true" />
  <FallingPetals v-if="petals" />
  <MusicButton ref="music" />
  <div class="page" :inert="!opened || undefined">
    <HeroSection @preview="preview(大图[0]?.src)" />
    <main id="main">
      <component :is="模块[k]" v-for="k in 顺序" :key="k" @preview="preview" />
    </main>
  </div>
  <PhotoLightbox v-model="previewIndex" :photos="大图" />
</template>
