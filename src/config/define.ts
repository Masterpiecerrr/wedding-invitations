/**
 * 婚礼配置的类型定义与日期推算。
 * 平时不用改这个文件；要改内容请打开根目录的 wedding.config.ts。
 */

/** 照片：直接写 photos 文件夹里的文件名；需要调整裁剪中心时写成 { 文件, 焦点 }。留空 '' 表示还没选。 */
export type 照片 = string | { 文件: string; 焦点?: string };

export type 模块名 = '婚书' | '故事' | '问答' | '相册' | '流程' | '时间地点' | '回执' | '结尾';

export interface 婚礼配置 {
  新人: { 新郎: string; 新娘: string; 新郎姓: string; 新娘姓: string };
  婚礼: {
    日期: string;
    迎宾: string;
    吉时: string;
    农历?: string;
    酒店: string;
    厅: string;
    地址: string;
    导航关键词: string;
    城市: string;
  };
  父母: { 显示: boolean; 新郎父亲: string; 新郎母亲: string; 新娘父亲: string; 新娘母亲: string };
  音乐: { 文件: string; 歌名: string; 歌手: string };
  分享: { 网址: string; 标题: string; 描述: string };
  模块顺序: 模块名[];
  开场: { 题字: string; 提示: string };
  首屏: { 照片: 照片; 上款: string; 引语: string };
  婚书: { 标题: string; 正文: string; 印章: string; 配图: 照片 };
  故事: { 标题: string; 引言: string; 章节: { 时间: string; 标题: string; 内容: string; 照片: 照片 }[] };
  问答: { 标题: string; 说明: string; 题目: { 问: string; 答: string }[] };
  相册: { 标题: string; 说明: string; 照片: 照片[] };
  流程: { 标题: string; 项目: { 时间: string; 事项: string; 说明?: string }[] };
  时间地点: { 标题: string; 酒店照片: 照片; 补充说明: string };
  回执: { 标题: string; 正文: string; 问卷链接: string; 按钮文字: string; 截止说明: string };
  结尾: { 大字: string; 正文: string; 喜糖按钮: string; 落款: string };
}

export function 定义婚礼配置(配置: 婚礼配置): 婚礼配置 {
  return 配置;
}

const 数字 = '〇一二三四五六七八九';
const 月名 = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const 日名 = (d: number) => (d <= 10 ? (d === 10 ? '十' : 数字[d]) : d < 20 ? `十${数字[d - 10]}` : d % 10 === 0 ? `${数字[d / 10]}十` : `${数字[Math.floor(d / 10)]}十${数字[d % 10]}`);

/** 由配置推算出的日期信息：页面、日历、倒计时、请柬图共用。 */
export function 推算日期(配置: 婚礼配置) {
  const { 日期, 迎宾, 吉时 } = 配置.婚礼;
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(日期.trim());
  if (!m) throw new Error(`【婚礼配置】日期「${日期}」格式不对，请写成 2027-05-01 这样`);
  const [年, 月, 日] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(年, 月 - 1, 日));
  if (d.getUTCMonth() !== 月 - 1) throw new Error(`【婚礼配置】日期「${日期}」不存在`);
  for (const t of [迎宾, 吉时]) if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(t)) throw new Error(`【婚礼配置】时间「${t}」格式不对，请写成 11:58 这样`);
  const 两位 = (n: number) => String(n).padStart(2, '0');
  const [时, 分] = 吉时.split(':').map(Number);
  return {
    年, 月, 日,
    星期: `星期${'日一二三四五六'[d.getUTCDay()]}`,
    公历: `${年}年${月}月${日}日`,
    点分: `${年}.${两位(月)}.${两位(日)}`,
    中文年月日: `${String(年).split('').map((c) => 数字[Number(c)]).join('')}年${月名[月]}月${日名(日)}日`,
    吉时时间戳: Date.UTC(年, 月 - 1, 日, 时 - 8, 分),
    日历空位: (d.getUTCDay() + 6) % 7,
    当月天数: new Date(Date.UTC(年, 月, 0)).getUTCDate(),
  };
}

/** 用系统内置的农历历法推算（构建时执行），返回如「丁未年 三月廿五」。 */
export function 推算农历(日期: string): string {
  const [y, mo, da] = 日期.split('-').map(Number);
  const parts = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    .formatToParts(new Date(Date.UTC(y, mo - 1, da, 12)));
  const 取 = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const n = Number(取('day'));
  const 日 = n <= 10 ? `初${n === 10 ? '十' : 数字[n]}` : n < 20 ? `十${数字[n - 10]}` : n === 20 ? '二十' : n < 30 ? `廿${数字[n - 20]}` : '三十';
  return `${取('yearName')}年 ${取('month')}${日}`;
}

export function 照片文件(p: 照片 | undefined): string {
  if (!p) return '';
  return (typeof p === 'string' ? p : p.文件).trim();
}
export function 照片焦点(p: 照片 | undefined): string {
  return (p && typeof p === 'object' && p.焦点) || '50% 50%';
}
