<script setup lang="ts">
import { ref } from 'vue';
import ModalDialog from './ModalDialog.vue';
import { 图片地址, 图片文件名, 图片尺寸 } from '@/lib/invitation-image';

const open = ref(false);

const failed = ref(false);
const trigger = ref<HTMLButtonElement | null>(null);
const 微信 = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent);

function show() {
  failed.value = false;
  open.value = true;
}
</script>

<template>
  <button ref="trigger" class="btn btn-line" type="button" @click="show">保存请柬图片</button>
  <ModalDialog :open="open" class-name="save-dialog" label="保存请柬图片" :final-focus="trigger" @close="open = false">
    <button class="save-close" type="button" aria-label="关闭" @click="open = false">×</button>
    <div class="save-body">
      <img v-if="!failed" :src="图片地址" @error="failed = true" :width="图片尺寸.width" :height="图片尺寸.height" alt="婚礼请柬图片" />
      <p v-else class="save-wait">图片加载失败，请关闭后重试，或打开原图</p>
    </div>
    <p class="save-hint">{{ 微信 ? '长按图片，选择「保存图片」' : '长按图片保存，或点下方按钮下载' }}</p>
    <div class="save-actions">
      <a v-if="!微信" class="btn save-dl" :href="图片地址" :download="图片文件名">下载图片</a>
      <a class="btn btn-line save-dl" :href="图片地址">打开原图</a>
    </div>
    <p v-if="微信" class="save-fallback">若保存失败，请打开原图后长按；也可用右上角菜单在浏览器中打开。</p>
  </ModalDialog>
</template>

<style scoped>
:global(.dialog-overlay) { position: fixed; inset: 0; z-index: 60; background: #1a0507cc; }
:global(.save-dialog) { position: fixed; left: 50%; top: 50%; z-index: 61; display: flex; flex-direction: column; align-items: center; width: min(88vw, 400px); max-height: 92vh; max-height: 92svh; overflow-y: auto; overscroll-behavior: contain; padding: 18px 16px 20px; transform: translate(-50%, -50%); background: var(--paper); text-align: center; }
.save-close { position: absolute; right: 4px; top: 0; width: 44px; height: 44px; border: 0; background: none; color: var(--ink-soft); font-size: 28px; line-height: 1; }
.save-body { flex: none; width: 100%; }
.save-body img { display: block; width: 100%; height: auto; margin: 10px auto 0; box-shadow: 0 8px 20px #0004; -webkit-touch-callout: default; }
.save-wait { padding: 80px 0; color: var(--ink-soft); }
.save-hint { margin-top: 14px; color: var(--ink-soft); font-size: 14px; letter-spacing: .08em; }
.save-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 12px; }
.save-fallback { margin-top: 10px; color: var(--ink-soft); font-size: 12px; line-height: 1.6; }
</style>
