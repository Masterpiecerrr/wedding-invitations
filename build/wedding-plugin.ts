/**
 * 构建插件：把 wedding.config.ts 里引用的照片、音乐变成网页可用的资源。
 *  - photos/ 里的原图自动转正、缩小、压缩成 WebP
 *  - 字体按页面实际用到的字自动裁剪，只留几十 KB
 *  - 农历按日期自动推算
 *  - 微信分享封面（share-cover.jpg）按封面照和姓名自动生成
 *  - 页面标题、分享描述写进 HTML
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import subsetFont from 'subset-font';
import opentype from 'opentype.js';
import type { Plugin, ViteDevServer } from 'vite';
import 配置 from '../wedding.config';
import { 推算日期, 推算农历, 照片文件, 照片焦点, type 照片 } from '../src/config/define';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PHOTO_DIR = path.join(ROOT, 'photos');
const MUSIC_DIR = path.join(ROOT, 'music');
const FONT_DIR = path.join(ROOT, 'fonts');
const CACHE_DIR = path.join(ROOT, 'node_modules', '.cache', 'wedding');
const VIRTUAL = 'virtual:wedding-assets';
const RESOLVED = '\0' + VIRTUAL;

type Asset = { fileName: string; source: Buffer; type: string };
type PhotoInfo = { src: string; w: number; h: number };
const hash = (b: Buffer | string) => crypto.createHash('sha1').update(b).digest('hex').slice(0, 10);
const log = (msg: string) => console.log(`\x1b[35m[婚礼]\x1b[0m ${msg}`);
const warn = (msg: string) => console.warn(`\x1b[33m[婚礼] ${msg}\x1b[0m`);

/** 收集配置里所有照片引用（字段名为 照片 / 配图 / 酒店照片 的地方） */
const PHOTO_KEYS = new Set(['照片', '配图', '酒店照片']);
function collectPhotoRefs(): 照片[] {
  const refs: 照片[] = [];
  const take = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(take);
    else if (typeof v === 'string' || (v && typeof v === 'object' && '文件' in v)) { if (照片文件(v as 照片)) refs.push(v as 照片); }
  };
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) PHOTO_KEYS.has(k) ? take(x) : walk(x);
  };
  walk(配置);
  return refs;
}

/** 在文件夹里找文件：完全一致 → 忽略大小写 → 忽略扩展名 */
function findFile(dir: string, name: string): string | null {
  if (!name || !fs.existsSync(dir)) return null;
  const direct = path.join(dir, name);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const files = fs.readdirSync(dir);
  const lower = name.toLowerCase();
  const stem = (f: string) => f.replace(/\.[^.]+$/, '').toLowerCase();
  const hit = files.find((f) => f.toLowerCase() === lower) ?? files.find((f) => stem(f) === stem(name));
  return hit ? path.join(dir, hit) : null;
}

async function cached(key: string, make: () => Promise<Buffer>): Promise<Buffer> {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, key);
  if (fs.existsSync(file)) return fs.readFileSync(file);
  const buf = await make();
  fs.writeFileSync(file, buf);
  return buf;
}

async function processPhoto(file: string): Promise<{ buf: Buffer; w: number; h: number }> {
  const stat = fs.statSync(file);
  const key = `p-${hash(`${file}|${stat.size}|${stat.mtimeMs}|v2`)}.webp`;
  const buf = await cached(key, () => sharp(file).rotate().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer());
  const meta = await sharp(buf).metadata();
  return { buf, w: meta.width ?? 1, h: meta.height ?? 1 };
}

/** 页面实际会用到的所有字符：配置里的文字 + 组件里写死的少量文字 */
function collectText(): string {
  const files = [path.join(ROOT, 'wedding.config.ts')];
  const walk = (dir: string) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else if (/\.(vue|ts)$/.test(e.name)) files.push(p);
  });
  walk(path.join(ROOT, 'src'));
  const derived = 推算日期(配置);
  const extra = `${derived.中文年月日}${derived.星期}${配置.婚礼.农历 || 推算农历(配置.婚礼.日期)}0123456789年月日时分秒天：:·.-&（）()〇一二三四五六七八九十廿初腊正冬闰`;
  const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  const chars = new Set([...files.map((f) => stripComments(fs.readFileSync(f, 'utf8'))).join('') + extra]);
  return [...chars].filter((c) => c.codePointAt(0)! >= 0x20).join('');
}

function svgEscape(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/** 微信分享封面：600×600 */
async function makeShareCover(cover: { file: string; focus: string } | null): Promise<Buffer> {
  const S = 600;
  const brush = opentype.parse(fs.readFileSync(path.join(FONT_DIR, 'MaShanZheng-Regular.ttf')).buffer as ArrayBuffer);
  const song = opentype.parse(fs.readFileSync(path.join(FONT_DIR, 'NotoSerifSC-Regular-GB.ttf')).buffer as ArrayBuffer);
  const { 新郎, 新娘 } = 配置.新人;
  const d = 推算日期(配置);
  const centered = (font: opentype.Font, text: string, y: number, size: number, fill: string, spacing = 0) => {
    const glyphs = [...text];
    const widths = glyphs.map((g) => font.getAdvanceWidth(g, size));
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (glyphs.length - 1);
    let x = (S - total) / 2; let out = '';
    glyphs.forEach((g, i) => { out += `<path fill="${fill}" d="${font.getPath(g, x, y, size).toPathData(2)}"/>`; x += widths[i] + spacing; });
    return out;
  };
  const xi = fs.readFileSync(path.join(ROOT, 'src/lib/xi.svg'), 'utf8').match(/<path[^>]*\/>/)![0];
  const xiAt = (x: number, y: number, size: number, fill: string) => `<g transform="translate(${x} ${y}) scale(${size / 965})" fill="${fill}">${xi}</g>`;
  const names = `${新郎}  ${新娘}`;

  let base: sharp.Sharp;
  let overlay: string;
  if (cover) {
    const img = sharp(cover.file).rotate();
    const meta = await sharp(await img.clone().toBuffer()).metadata();
    const [fx, fy] = cover.focus.split(/\s+/).map((v) => parseFloat(v) / 100);
    const w = meta.width ?? S, h = meta.height ?? S, side = Math.min(w, h);
    const left = Math.round(Math.max(0, Math.min(w - side, w * (fx || 0.5) - side / 2)));
    const top = Math.round(Math.max(0, Math.min(h - side, h * (fy || 0.5) - side / 2)));
    base = img.extract({ left, top, width: side, height: side }).resize(S, S);
    overlay = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#67191f" stop-opacity="0"/><stop offset="1" stop-color="#67191f" stop-opacity=".92"/></linearGradient></defs>
      <rect width="${S}" height="${S}" fill="url(#g)"/>
      <rect x="14" y="14" width="${S - 28}" height="${S - 28}" fill="none" stroke="#dec08a" stroke-width="2" opacity=".85"/>
      ${xiAt(S / 2 - 34, 392, 68, '#dec08a')}
      ${centered(song, names, 518, 56, '#faf4e8', 4)}
      ${centered(song, d.点分, 562, 24, '#dec08a', 3)}`;
  } else {
    base = sharp({ create: { width: S, height: S, channels: 3, background: '#831f24' } });
    overlay = `<rect x="18" y="18" width="${S - 36}" height="${S - 36}" fill="none" stroke="#dec08a" stroke-width="2"/>
      <rect x="28" y="28" width="${S - 56}" height="${S - 56}" fill="none" stroke="#dec08a" stroke-width="1" opacity=".6"/>
      ${xiAt(S / 2 - 110, 92, 220, '#dec08a')}
      ${centered(song, names, 430, 64, '#faf4e8', 6)}
      ${centered(song, `${d.点分}  ${svgEscape(配置.婚礼.酒店)}`, 492, 26, '#dec08a', 2)}`;
  }
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${overlay}</svg>`);
  return base.composite([{ input: svg }]).jpeg({ quality: 86 }).toBuffer();
}

export function weddingPlugin(): Plugin {
  let isBuild = false;
  let assets = new Map<string, Asset>();
  let manifest: { photos: Record<string, PhotoInfo>; music: string; lunar: string; fonts: { brush: string; song: string } } = { photos: {}, music: '', lunar: '', fonts: { brush: '', song: '' } };
  let ready: Promise<void> | null = null;

  let base = '/';
  const add = (fileName: string, source: Buffer, type: string) => { assets.set('/' + fileName, { fileName, source, type }); return base + fileName; };

  async function prepare() {
    const t0 = Date.now();
    assets = new Map();
    const photos: Record<string, PhotoInfo> = {};
    let missing = 0;
    for (const ref of collectPhotoRefs()) {
      const name = 照片文件(ref);
      if (photos[name]) continue;
      const file = findFile(PHOTO_DIR, name);
      if (!file) { warn(`找不到照片「${name}」，请确认它在 photos 文件夹里，文件名一致`); missing++; continue; }
      try {
        const { buf, w, h } = await processPhoto(file);
        photos[name] = { src: add(`photos/${hash(buf)}.webp`, buf, 'image/webp'), w, h };
      } catch (e) { warn(`照片「${name}」无法读取（${(e as Error).message}）。iPhone 的 HEIC 请先转成 JPG`); missing++; }
    }

    let music = '';
    if (配置.音乐.文件.trim()) {
      const file = findFile(MUSIC_DIR, 配置.音乐.文件.trim());
      if (file) { const buf = fs.readFileSync(file); music = add(`music/${hash(buf)}${path.extname(file).toLowerCase()}`, buf, 'audio/mpeg'); }
      else warn(`找不到音乐「${配置.音乐.文件}」，请放进 music 文件夹`);
    }

    const coverName = 照片文件(配置.首屏.照片);
    const coverFile = coverName ? findFile(PHOTO_DIR, coverName) : null;
    try {
      const cover = await makeShareCover(coverFile ? { file: coverFile, focus: 照片焦点(配置.首屏.照片) } : null);
      add('share-cover.jpg', cover, 'image/jpeg');
    } catch (e) { warn(`分享封面生成失败：${(e as Error).message}`); }

    const fonts = { brush: '', song: '' };
    if (isBuild) {
      const text = collectText();
      for (const [key, file] of [['brush', 'MaShanZheng-Regular.ttf'], ['song', 'NotoSerifSC-Regular-GB.ttf']] as const) {
        const buf = await subsetFont(fs.readFileSync(path.join(FONT_DIR, file)), text, { targetFormat: 'woff2' });
        fonts[key] = add(`fonts/${key}-${hash(buf)}.woff2`, buf, 'font/woff2');
      }
    } else {
      // 开发预览直接用完整字体，改文字不用重启
      fonts.brush = add('fonts/brush.ttf', fs.readFileSync(path.join(FONT_DIR, 'MaShanZheng-Regular.ttf')), 'font/ttf');
      fonts.song = add('fonts/song.ttf', fs.readFileSync(path.join(FONT_DIR, 'NotoSerifSC-Regular-GB.ttf')), 'font/ttf');
    }

    manifest = { photos, music, lunar: 配置.婚礼.农历?.trim() || 推算农历(配置.婚礼.日期), fonts };
    log(`照片 ${Object.keys(photos).length} 张${missing ? `（${missing} 张没找到）` : ''}，农历 ${manifest.lunar}，用时 ${((Date.now() - t0) / 1000).toFixed(1)} 秒`);
  }

  const ensure = () => (ready ??= prepare());

  return {
    name: 'wedding-assets',
    enforce: 'pre',
    configResolved(c) { isBuild = c.command === 'build'; base = c.base || '/'; },
    resolveId(id) { return id === VIRTUAL ? RESOLVED : undefined; },
    async load(id) {
      if (id !== RESOLVED) return;
      await ensure();
      return `export default ${JSON.stringify(manifest)};`;
    },
    async transformIndexHtml(html) {
      await ensure();
      const { 新郎, 新娘 } = 配置.新人;
      const d = 推算日期(配置);
      // 环境变量 SITE_URL 优先（GitHub Pages 用），否则用配置里的分享网址
      const site = (process.env.SITE_URL || 配置.分享.网址).replace(/\/+$/, '');
      const title = 配置.分享.标题 || `${新郎} & ${新娘} · 婚礼请柬`;
      const desc = 配置.分享.描述 || `${d.公历} ${d.星期}，${配置.婚礼.酒店}${配置.婚礼.厅}。诚邀您见证我们的婚礼。`;
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
      const fontCss = `@font-face{font-family:"WBrush";src:url(${manifest.fonts.brush}) format("${isBuild ? 'woff2' : 'truetype'}");font-display:swap}@font-face{font-family:"WSong";src:url(${manifest.fonts.song}) format("${isBuild ? 'woff2' : 'truetype'}");font-display:swap}`;
      return html
        .replaceAll('__TITLE__', esc(title))
        .replaceAll('__DESC__', esc(desc))
        .replaceAll('__SITE__', esc(site))
        .replace('</head>', `<style>${fontCss}</style><link rel="preload" href="${manifest.fonts.brush}" as="font" crossorigin><link rel="preload" href="${manifest.fonts.song}" as="font" crossorigin></head>`);
    },
    configureServer(server: ViteDevServer) {
      void ensure();
      for (const dir of [PHOTO_DIR, MUSIC_DIR]) { fs.mkdirSync(dir, { recursive: true }); server.watcher.add(dir); }
      const onChange = (file: string) => {
        if (!file.startsWith(PHOTO_DIR) && !file.startsWith(MUSIC_DIR)) return;
        ready = prepare();
        void ready.then(() => {
          const mod = server.moduleGraph.getModuleById(RESOLVED);
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        });
      };
      server.watcher.on('add', onChange).on('change', onChange).on('unlink', onChange);
      server.middlewares.use(async (req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]);
        if (!/^\/(photos|music|fonts)\/|^\/share-cover\.jpg$/.test(url)) return next();
        await ensure();
        const a = assets.get(url);
        if (!a) { res.statusCode = 404; return res.end(); }
        res.setHeader('Content-Type', a.type);
        res.setHeader('Cache-Control', 'no-cache');
        res.end(a.source);
      });
    },
    async generateBundle() {
      await ensure();
      for (const a of assets.values()) this.emitFile({ type: 'asset', fileName: a.fileName, source: a.source });
    },
  };
}
