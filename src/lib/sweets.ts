// 撒喜糖全场计数：读数、累加、合并上报。接口不可用时一律静默，不影响撒糖。
import { ref } from 'vue';

const API = `${import.meta.env.BASE_URL}api/sweets`;
const 合并间隔 = 1500; // 连点时攒一会儿再一起上报
const 单次上限 = 12; // 和接口里的上限一致

export const 喜糖数 = ref<number | null>(null); // null = 还没拿到或服务不可用，此时不显示
let 待报 = 0;
let 计时: number | undefined;
let 已加载 = false;

async function 请求(init?: RequestInit): Promise<number | null> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(API, { ...init, signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.count === 'number' ? data.count : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(t);
  }
}

export async function 读取喜糖数() {
  if (已加载) return;
  已加载 = true;
  const n = await 请求();
  if (n !== null) 喜糖数.value = n + 待报;
}

async function 上报() {
  计时 = undefined;
  if (待报 <= 0) return;
  const n = Math.min(待报, 单次上限);
  待报 -= n;
  const total = await 请求({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ n }) });
  if (total !== null) 喜糖数.value = total + 待报;
  if (待报 > 0) 计时 = window.setTimeout(上报, 合并间隔);
}

/** 撒一把：数字立刻 +1，稍后合并上报 */
export function 撒一把() {
  待报 += 1;
  if (喜糖数.value !== null) 喜糖数.value += 1;
  if (计时 === undefined) 计时 = window.setTimeout(上报, 合并间隔);
}

// 宾客撒完马上关页面时，把没报的补上
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (待报 <= 0 || !navigator.sendBeacon) return;
    navigator.sendBeacon(API, new Blob([JSON.stringify({ n: Math.min(待报, 单次上限) })], { type: 'application/json' }));
    待报 = 0;
  });
}
