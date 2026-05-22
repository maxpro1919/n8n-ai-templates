# 群精华板 — Group Highlights

> 群里好东西，别丢了。

微信群有价值信息沉淀工具。手动粘贴群消息到板子上，打标签分类，群友可搜索浏览。

## 解决什么问题

微信群消息多、有价值的少，好东西总被淹没。翻聊天记录找不到，截图又不好搜索。

**群精华板**让你把群里看到的好内容手动收藏到一个共享空间，按标签分类，所有人随时搜索查看。

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript
- **样式**: Tailwind CSS（移动端优先）
- **数据库**: Supabase（PostgreSQL）
- **部署**: Vercel

## 核心功能

- 粘贴精华内容，打标签（资源/通知/经验/吐槽/其他）
- 按关键词搜索
- 按标签筛选
- 移动端优先，微信浏览器兼容
- 数据实时同步

## 本地运行

```bash
# 安装依赖
npm install

# 配置环境变量
# 编辑 .env.local，填入 Supabase URL 和 anon key

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000

## Supabase 配置

1. 注册 [Supabase](https://supabase.com)，创建项目
2. 在 SQL Editor 执行：

```sql
CREATE TABLE highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT,
  tag TEXT NOT NULL,
  note TEXT,
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有人读取" ON highlights FOR SELECT USING (true);
CREATE POLICY "允许所有人插入" ON highlights FOR INSERT WITH CHECK (true);
```

3. 复制 Project URL 和 anon key 到 `.env.local`

## 部署

1. 推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入仓库
3. 添加环境变量（Supabase URL 和 anon key）
4. 部署完成

## 后续优化

- 微信分享卡片（生成分享图）
- 点赞功能
- 按群分组浏览
- Supabase Auth 登录
- 浏览器插件一键收藏
- 导出为 Markdown
