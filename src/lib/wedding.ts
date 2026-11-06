import 配置 from '@config';
import assets from 'virtual:wedding-assets';
import { 推算日期, 照片文件, 照片焦点, type 照片 } from '@/config/define';

export { 配置, assets };
export const 日期 = 推算日期(配置);
export const 农历 = assets.lunar;

/** 网址带 ?看位置 或 ?slots 时，在每张照片上标出它在配置里的位置 */
export const 看位置 = typeof location !== 'undefined' && /看位置|%E7%9C%8B%E4%BD%8D%E7%BD%AE|slots/.test(location.search);

export type 照片信息 = { src: string; w: number; h: number; 焦点: string; 文件: string; 位置: string };

/** 把配置里的照片引用转换成可显示的图片；没选或找不到时 src 为空 */
export function 取照片(p: 照片 | undefined, 位置: string): 照片信息 {
  const 文件 = 照片文件(p);
  const hit = 文件 ? assets.photos[文件] : undefined;
  return { src: hit?.src ?? '', w: hit?.w ?? 4, h: hit?.h ?? 5, 焦点: 照片焦点(p), 文件, 位置 };
}

export const 新人 = 配置.新人;
export const 双姓 = `${新人.新郎姓}府 · ${新人.新娘姓}府`;
