# A股 AI 研究台

一个面向自己和朋友使用的 AI agent stock trading / A 股 AI 辅助研究工具。当前版本包含：

- 私人访问密码登录
- A 股自选股行情面板
- 免费行情源适配层，失败时返回演示数据
- OpenAI Responses API 分析接口
- 适合后续部署到 Vercel 并连接 GitHub

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

然后打开 `http://localhost:3000`。

`.env.local` 至少需要设置：

```bash
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-5.4-mini
APP_ACCESS_PASSWORD=给朋友的访问密码
SESSION_SECRET=一段足够长的随机字符串
```

## GitHub 同步

创建 GitHub 仓库后，在本地执行：

```bash
git remote add origin git@github.com:你的用户名/你的仓库名.git
git add .
git commit -m "Initial A-share AI research app"
git push -u origin main
```

其他电脑使用：

```bash
git clone git@github.com:你的用户名/你的仓库名.git
```

## 上线部署

推荐第一阶段使用 Vercel：

1. 用 GitHub 登录 Vercel。
2. Import 当前 GitHub 仓库。
3. 在 Vercel 项目的 Environment Variables 中配置 `OPENAI_API_KEY`、`OPENAI_MODEL`、`APP_ACCESS_PASSWORD`、`SESSION_SECRET`。
4. 部署完成后，把 Vercel 生成的网址发给朋友。

## 后续路线

- 接 Supabase，支持真正的多用户账号和自选股保存。
- 增加股票搜索和自选股编辑。
- 增加公告、财报、新闻、研报摘要。
- 增加投资日志和策略回测。
- 增加更明确的权限、审计和风险提示。

## 合规提醒

本工具定位为研究辅助，不提供确定性买卖建议，不承诺收益。使用前请确认数据来源、更新频率和相关金融合规要求。
