// 撒喜糖全场计数（Cloudflare Pages Functions + D1 数据库）
// 数据库：wedding-sweets，表 sweets 只有一行（id = 1）。项目设置里把它绑定为变量名 DB。
// 清零：Cloudflare → 存储和数据库 → D1 → wedding-sweets → 控制台，执行
//   UPDATE sweets SET count = 0;
// 出任何问题都只返回错误，不影响请柬页面本身。

const 单次上限 = 12; // 一次上报最多算几把，防止刷数

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export async function onRequestGet({ env }) {
  try {
    const row = await env.DB.prepare('SELECT count FROM sweets WHERE id = 1').first();
    return json({ count: row ? row.count : 0 });
  } catch {
    return json({ error: 'unavailable' }, 503);
  }
}

export async function onRequestPost({ request, env }) {
  let n = 1;
  try {
    n = Math.floor(Number((await request.json()).n));
  } catch {
    n = 1;
  }
  if (!Number.isFinite(n) || n < 1) n = 1;
  if (n > 单次上限) n = 单次上限;
  try {
    // 加法在数据库里一步完成，多人同时撒也不会算乱
    const row = await env.DB.prepare('UPDATE sweets SET count = count + ?1 WHERE id = 1 RETURNING count').bind(n).first();
    return json({ count: row ? row.count : null });
  } catch {
    return json({ error: 'unavailable' }, 503);
  }
}
