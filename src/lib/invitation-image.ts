import { 配置, 日期, 农历, 取照片 } from './wedding';
import raw from './xi.svg?raw';
import silkArt from '../assets/art/round-silk.webp';

export const 图片尺寸 = { width: 1080, height: 1920 };
export const 图片文件名 = `${配置.新人.新郎}与${配置.新人.新娘}的婚礼请柬-${日期.点分}.png`;

const RED = '#831f24', GOLD = '#b69766', GOLD_L = '#dec08a', CREAM = '#faf4e8', INK = '#533b30', MUTED = '#806b57';

function load(src: string) {
  return new Promise<HTMLImageElement>((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => fail(new Error('照片加载失败'));
    img.src = src;
  });
}

/** 生成与页面一致的宋式竖版请柬，保留照片选择与 PNG 下载流程。 */
export async function 生成请柬图片(): Promise<Blob> {
  const cover = 取照片(配置.首屏.照片, '');
  await document.fonts.load('80px WSong').catch(() => undefined);
  const photo = cover.src ? await load(cover.src).catch(() => null) : null;
  const artwork = photo ?? await load(silkArt);
  const { width: W, height: H } = 图片尺寸;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  if (!g) throw new Error('无法创建请柬画布');

  g.fillStyle = CREAM; g.fillRect(0, 0, W, H);
  g.fillStyle = RED; g.fillRect(0, 0, W, 1030);
  g.strokeStyle = '#dec08a55'; g.lineWidth = 1;
  g.strokeRect(44, 44, W - 88, 942);

  const text = (s: string, y: number, size: number, color: string, spacing = 0, maxWidth = W - 180) => {
    g.save();
    g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if ('letterSpacing' in g) g.letterSpacing = `${spacing}px`;
    g.font = `400 ${size}px WSong, serif`;
    // 缩字号保持字形比例，避免 Canvas 的 maxWidth 将长姓名横向压扁。
    const measured = g.measureText(s).width;
    if (measured > maxWidth) g.font = `400 ${size * maxWidth / measured}px WSong, serif`;
    g.fillText(s, W / 2, y);
    g.restore();
  };
  const line = (y: number, width: number) => {
    g.strokeStyle = '#b6976655'; g.lineWidth = 1;
    g.beginPath(); g.moveTo((W - width) / 2, y); g.lineTo((W + width) / 2, y); g.stroke();
  };

  const cy = 443, r = 235;
  g.save(); g.beginPath(); g.arc(W / 2, cy, r, 0, Math.PI * 2); g.clip();
  const [fx, fy] = cover.焦点.split(/\s+/).map(v => parseFloat(v) / 100);
  const scale = Math.max(2 * r / artwork.naturalWidth, 2 * r / artwork.naturalHeight);
  const dw = artwork.naturalWidth * scale, dh = artwork.naturalHeight * scale;
  const focusX = photo && Number.isFinite(fx) ? fx : .5;
  const focusY = photo && Number.isFinite(fy) ? fy : .5;
  g.drawImage(artwork, W / 2 - r - (dw - 2 * r) * focusX, cy - r - (dh - 2 * r) * focusY, dw, dh);
  g.restore();
  g.strokeStyle = '#dec08a66'; g.lineWidth = 1.5;
  g.beginPath(); g.arc(W / 2, cy, r + 12, 0, Math.PI * 2); g.stroke();

  text(`${配置.新人.新郎}  ·  ${配置.新人.新娘}`, 818, 76, '#f1dfbf', 5);
  text(配置.首屏.引语, 906, 30, GOLD_L, 5);

  text('谨定于', 1135, 25, MUTED, 8);
  text(`${日期.中文年月日}　${日期.星期}`, 1216, 40, RED, 3);
  text(`农历 ${农历}`, 1275, 27, MUTED, 3);
  text(`迎宾 ${配置.婚礼.迎宾}　·　吉时 ${配置.婚礼.吉时}`, 1344, 30, INK, 2);
  line(1390, 150);
  text(配置.婚礼.酒店, 1480, 49, RED, 4);
  text(配置.婚礼.厅, 1542, 29, INK, 4);

  // 地址按测量宽度换行，保持小字号在手机上仍可辨认。
  g.font = '26px WSong, serif';
  const addressLines: string[] = [];
  let row = '';
  for (const ch of 配置.婚礼.地址) {
    if (g.measureText(row + ch).width > 830 && row) { addressLines.push(row); row = ch; }
    else row += ch;
  }
  if (row) addressLines.push(row);
  const address = addressLines.length > 2 ? [addressLines[0], addressLines.slice(1).join('')] : addressLines;
  address.forEach((value, i) => text(value, 1601 + i * 39, 26, MUTED, 0, 830));

  const d = raw.match(/ d="([^"]+)"/)?.[1] ?? '';
  const t = raw.match(/translate\(([-\d.]+) ([-\d.]+)\)/);
  const size = 34;
  g.save(); g.translate(W / 2, 1730); g.rotate(-.035);
  g.strokeStyle = '#a6433e99'; g.lineWidth = 1.5; g.strokeRect(-26, -28, 52, 56);
  g.translate(-size / 2, -size / 2); g.scale(size / 965, size / 965);
  g.translate(Number(t?.[1] ?? 0), Number(t?.[2] ?? 0)); g.scale(1, -1);
  g.fillStyle = RED; g.fill(new Path2D(d)); g.restore();
  text(配置.结尾.大字, 1830, 32, RED, 10);

  return new Promise((ok, fail) => c.toBlob(b => b ? ok(b) : fail(new Error('导出失败')), 'image/png'));
}
