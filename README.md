# 武博留学补课系统

这是一个可上线的 Next.js + Supabase + Vercel 项目，不是 HTML 演示。

## 已实现功能

- 家长端：手机号 + 验证码登录，维护孩子资料，给每个孩子勾选未来 8 周可补课时间。
- 老师端：邮箱 + 密码登录，维护老师资料，勾选未来 8 周可上课时间。
- 管理后台：自动匹配学生和老师共同空闲时间，按学生 / 老师 / 日期筛选，一键确认排课，导出 Excel。
- 数据安全：使用 Supabase RLS。家长只能看自己的孩子，老师只能看自己的资料，后台只允许 admin 角色访问。

## 技术栈

- Next.js App Router
- Supabase Auth + Postgres + Row Level Security
- Vercel 部署
- xlsx 导出 Excel

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量：

```bash
cp .env.example .env.local
```

3. 在 Supabase 项目中找到：

- Project URL
- anon public key

填入 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon key
```

4. 在 Supabase SQL Editor 执行：

```sql
-- 复制并执行 supabase/migrations/001_initial_schema.sql
```

5. 启动：

```bash
npm run dev
```

打开 `http://localhost:3000`。

## Supabase 配置

### 手机号验证码

在 Supabase Dashboard：

1. Authentication → Providers → Phone
2. 开启 Phone 登录
3. 配置短信服务商
4. 测试手机号验证码

中国大陆手机号建议后期接国内短信服务商或自建验证码接口；当前项目代码已经按 Supabase Phone OTP 写好。

### 老师邮箱账号

在 Supabase Dashboard：

1. Authentication → Users
2. Invite user 或 Create user
3. 邮箱使用英国老师邮箱
4. 老师登录后会自动创建 `teacher_profiles`

### 创建管理员

先用邮箱登录一次，让系统生成 `profiles` 记录。然后在 Supabase SQL Editor 执行：

```sql
update public.profiles
set role = 'admin', full_name = '教务管理员'
where email = '你的管理员邮箱';
```

之后访问 `/admin`。

## 部署到 Vercel

推荐使用 GitHub 自动部署：

1. 把本项目推送到 GitHub。
2. 打开 Vercel Dashboard，选择 Add New Project。
3. Import 这个 GitHub 仓库。
4. Framework Preset 选择 Next.js。
5. 在 Environment Variables 添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon key
```

6. 点击 Deploy。

以后每次推送到主分支，Vercel 会自动重新部署。Vercel 官方文档也支持 Git、CLI、Drop 等方式部署。

## 绑定自己的域名

在 Vercel：

1. 进入项目 → Settings → Domains。
2. 输入你的域名，例如 `booking.your-school.com`。
3. 按 Vercel 页面提示去域名服务商添加 DNS 记录。
4. 子域名通常添加 `CNAME` 指向 Vercel 提供的地址。
5. 根域名通常按 Vercel 提示添加 `A` 或 `CNAME` 记录。
6. 等待 DNS 生效，Vercel 会自动签发 HTTPS 证书。

绑定成功后，把 Supabase Authentication → URL Configuration 里的 Site URL 改成你的正式域名。

## 分享给所有家长使用

上线后给家长发这个地址：

```text
https://你的域名/login
```

家长使用手机号验证码登录。第一次登录后进入 `/parent`，添加孩子并勾选时间。

建议正式发布前准备：

- 一个家长使用说明截图版
- 一个测试家长手机号
- 一个老师测试账号
- 一个管理员账号
- 隐私政策和服务说明页面

## 后期接微信登录

当前项目把登录入口和用户角色结构都预留好了。后期可选两条路线：

- 微信开放平台 OAuth：适合网页端。
- 微信小程序登录：适合后续做小程序家长端。

接入后把微信 openid / unionid 写入 `profiles`，不需要重做排课数据结构。
