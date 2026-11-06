import { 配置, 日期, 农历, 取照片, 双姓 } from './wedding';
import raw from './xi.svg?raw';

export const 图片尺寸 = { width: 1080, height: 1920 };
export const 图片文件名 = `${配置.新人.新郎}与${配置.新人.新娘}的婚礼请柬-${日期.点分}.png`;

const RED = '#831f24', DEEP = '#67191f', GOLD = '#b69766', GOLD_L = '#dec08a', CREAM = '#faf4e8';

function load(src: string) {
  return new Promise<HTMLImageElement>((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => fail(new Error('照片加载失败'));
    img.src = src;
  });
}

/** 生成一张竖版红金请柬图片，供宾客保存到相册 */
export async function 生成请柬图片(): Promise<Blob> {
  const cover = 取照片(配置.首屏.照片, '');
  await Promise.all([document.fonts.load('80px WBrush'), document.fonts.load('40px WSong')]).catch(() => undefined);
  const photo = cover.src ? await load(cover.src).catch(() => null) : null;

  const { width: W, height: H } = 图片尺寸;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const bg = g.createRadialGradient(W / 2, 300, 50, W / 2, 900, 1300);
  bg.addColorStop(0, '#a73535'); bg.addColorStop(.6, RED); bg.addColorStop(1, DEEP);
  g.fillStyle = bg; g.fillRect(0, 0, W, H);

  // 双线金框 + 四角回纹
  g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(36, 36, W - 72, H - 72);
  g.lineWidth = 1.5; g.globalAlpha = .7; g.strokeRect(52, 52, W - 104, H - 104); g.globalAlpha = 1;
  const corner = (x: number, y: number, sx: number, sy: number) => {
    g.save(); g.translate(x, y); g.scale(sx, sy); g.beginPath();
    g.moveTo(0, 60); g.lineTo(0, 0); g.lineTo(60, 0); g.moveTo(14, 46); g.lineTo(14, 14); g.lineTo(46, 14); g.lineTo(46, 32); g.lineTo(28, 32);
    g.strokeStyle = GOLD_L; g.lineWidth = 3; g.stroke(); g.restore();
  };
  corner(70, 70, 1, 1); corner(W - 70, 70, -1, 1); corner(70, H - 70, 1, -1); corner(W - 70, H - 70, -1, -1);

  const text = (s: string, y: number, font: string, color: string, spacing = 0) => {
    g.font = font; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if ('letterSpacing' in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing}px`;
    g.fillText(s, W / 2 + spacing / 2, y, W - 180);
  };

  text(双姓, 170, '46px WBrush, serif', GOLD_L, 14);

  // 月洞门照片 或 大囍字
  const cy = 520, r = 270;
  if (photo) {
    g.save(); g.beginPath(); g.arc(W / 2, cy, r, 0, Math.PI * 2); g.clip();
    const [fx, fy] = cover.焦点.split(/\s+/).map((v) => parseFloat(v) / 100);
    const s = Math.max((2 * r) / photo.naturalWidth, (2 * r) / photo.naturalHeight);
    const dw = photo.naturalWidth * s, dh = photo.naturalHeight * s;
    g.drawImage(photo, W / 2 - r - (dw - 2 * r) * (fx || .5), cy - r - (dh - 2 * r) * (fy || .5), dw, dh);
    g.restore();
    g.strokeStyle = GOLD; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, cy, r + 10, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(W / 2, cy, r + 26, 0, Math.PI * 2); g.stroke();
  }
  const d = raw.match(/ d="([^"]+)"/)?.[1] ?? '';
  const xiSize = photo ? 110 : 400;
  const xiY = photo ? cy + r - 30 : cy - 210;
  g.save(); g.translate(W / 2 - xiSize / 2, xiY);
  if (photo) { g.fillStyle = RED; g.beginPath(); g.arc(xiSize / 2, xiSize * .49, xiSize * .72, 0, Math.PI * 2); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 2; g.stroke(); }
  g.scale(xiSize / 965, xiSize / 965);
  const t = raw.match(/translate\(([-\d.]+) ([-\d.]+)\)/);
  g.translate(Number(t?.[1] ?? 0), Number(t?.[2] ?? 0)); g.scale(1, -1);
  g.fillStyle = GOLD_L; g.fill(new Path2D(d)); g.restore();

  text(`${配置.新人.新郎}  &  ${配置.新人.新娘}`, 1000, '92px WBrush, serif', CREAM, 6);
  text(配置.首屏.引语, 1080, '44px WBrush, serif', GOLD_L, 12);

  g.strokeStyle = '#b6976688'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(240, 1140); g.lineTo(W - 240, 1140); g.stroke();
  text('谨定于', 1215, '36px WSong, serif', GOLD_L, 10);
  text(`${日期.中文年月日}　${日期.星期}`, 1290, '46px WSong, serif', CREAM, 6);
  text(`农历 ${农历}`, 1355, '36px WSong, serif', GOLD_L, 6);
  text(`迎宾 ${配置.婚礼.迎宾}　·　吉时 ${配置.婚礼.吉时}`, 1425, '36px WSong, serif', CREAM, 4);
  text(配置.婚礼.酒店, 1530, '68px WBrush, serif', CREAM, 6);
  text(配置.婚礼.厅, 1595, '38px WSong, serif', GOLD_L, 8);
  text(配置.婚礼.地址, 1650, '30px WSong, serif', '#dec08acc', 2);
  text(配置.结尾.大字, 1780, '64px WBrush, serif', GOLD_L, 24);

  return new Promise((ok, fail) => c.toBlob((b) => (b ? ok(b) : fail(new Error('导出失败'))), 'image/png'));
}
