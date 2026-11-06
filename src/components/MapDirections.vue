<script setup lang="ts">
import { ref } from 'vue';
import { 配置 } from '@/lib/wedding';

const open = ref(false);
const kw = encodeURIComponent(配置.婚礼.导航关键词 || 配置.婚礼.酒店);
const city = encodeURIComponent(配置.婚礼.城市);
const maps = [
  { name: '高德地图', href: `https://uri.amap.com/search?keyword=${kw}&city=${city}&callnative=1&src=wedding` },
  { name: '百度地图', href: `https://api.map.baidu.com/place/search?query=${kw}&region=${city}&output=html&src=wedding` },
  { name: '腾讯地图', href: `https://apis.map.qq.com/uri/v1/search?keyword=${kw}&region=${city}&referer=wedding` },
  { name: '苹果地图', href: `https://maps.apple.com/?q=${kw}` },
];
</script>

<template>
  <button class="btn" type="button" :aria-expanded="open" aria-controls="map-list" @click="open = !open">一键导航</button>
  <nav v-show="open" id="map-list" class="maps" aria-label="选择地图">
    <a v-for="m in maps" :key="m.name" :href="m.href" target="_blank" rel="noreferrer">{{ m.name }}</a>
  </nav>
</template>

<style scoped>
.maps { order: 3; flex-basis: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.maps a { padding: 10px; border: 1px solid #c39a5299; background: #fbf4e6; color: var(--red); font-size: 14px; letter-spacing: .1em; text-decoration: none; text-align: center; }
</style>
