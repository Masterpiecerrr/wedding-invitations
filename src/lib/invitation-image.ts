import { 配置, 日期 } from './wedding';

// 使用可直接访问的图片地址，避免微信无法保存临时 blob URL。
// 海报文字已嵌入图片；修改婚礼信息时需同步更新海报并更换版本文件名。
export const 图片地址 = `${import.meta.env.BASE_URL}wedding-invitation-shanshui-v1.png`;
export const 图片尺寸 = { width: 941, height: 1672 };
export const 图片文件名 = `${配置.新人.新郎}与${配置.新人.新娘}的婚礼请柬-${日期.点分}.png`;
