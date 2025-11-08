# 🚀 骆驼大赛 - 云端部署指南

本指南将帮你将骆驼大赛部署到云服务器，让全世界的玩家都能访问！

## 📦 部署架构

```
┌─────────────────┐         ┌──────────────────┐
│   Vercel        │         │   Render.com     │
│   (前端)        │ ◄─────► │   (后端服务器)   │
│   静态网站      │  WebSocket │  Node.js + Socket.io │
└─────────────────┘         └──────────────────┘
```

- **前端**: 部署到 Vercel（免费，全球 CDN）
- **后端**: 部署到 Render（免费，支持 WebSocket）

---

## 🎯 第一步：部署游戏服务器（后端）

### 使用 Render 部署（推荐）

#### 1. 创建 Render 账号

访问 [render.com](https://render.com) 并注册账号（可以使用 GitHub 登录）

#### 2. 创建新的 Web Service

1. 点击 **"New +"** → **"Web Service"**
2. 连接你的 GitHub 仓库 `FruitSamurai/CamelUp`
3. 配置如下：

```
Name: camel-up-server
Region: Singapore (或其他离你近的区域)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

#### 3. 添加环境变量

在 "Environment" 标签页添加：

```
NODE_ENV = production
PORT = 10000
```

#### 4. 部署

点击 **"Create Web Service"**，等待部署完成（约 2-5 分钟）

#### 5. 获取服务器 URL

部署成功后，你会得到一个 URL，类似：
```
https://camel-up-server.onrender.com
```

**⚠️ 保存这个 URL，后面会用到！**

---

## 🌐 第二步：部署前端

### 使用 Vercel 部署（推荐）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 更新服务器地址

编辑 `src/multiplayer/MultiplayerManager.ts`，修改第 20 行：

```typescript
// 将 localhost 改为你的 Render 服务器 URL
constructor(serverUrl: string = 'https://camel-up-server.onrender.com') {
  this.serverUrl = serverUrl;
}
```

#### 3. 提交代码

```bash
git add .
git commit -m "Update server URL for production"
git push
```

#### 4. 部署到 Vercel

在项目根目录运行：

```bash
vercel
```

按照提示操作：
- **Set up and deploy?** → Yes
- **Which scope?** → 选择你的账号
- **Link to existing project?** → No
- **Project name?** → camel-up（或你想要的名称）
- **Directory?** → 按 Enter（使用当前目录）
- **Override settings?** → No

#### 5. 部署到生产环境

```bash
vercel --prod
```

部署成功后，你会得到一个 URL，类似：
```
https://camel-up.vercel.app
```

---

## 🎮 第三步：测试部署

1. 访问你的 Vercel URL（如 `https://camel-up.vercel.app`）
2. 点击"多人联机"
3. 检查连接状态（应该显示"✅ 已连接到服务器"）
4. 创建房间并测试多人功能

---

## 🔧 常见问题排查

### ❌ 问题：前端连接不到服务器

**检查项**：

1. **服务器是否正在运行**
   - 访问 Render Dashboard 查看服务状态
   - 查看服务器日志

2. **CORS 配置**
   - 确保服务器允许来自 Vercel 的请求
   - 检查 `server/index.js` 的 CORS 设置

3. **服务器 URL 是否正确**
   - 检查 `MultiplayerManager.ts` 中的 `serverUrl`
   - 确保使用 HTTPS（不是 HTTP）

### ❌ 问题：Render 服务器休眠

**说明**：免费计划的服务器在 15 分钟无活动后会休眠

**解决方案**：
1. 升级到付费计划（$7/月）
2. 使用 UptimeRobot 定期 ping 服务器保持活跃
3. 接受首次访问需要等待 30 秒唤醒

### ❌ 问题：WebSocket 连接失败

**检查**：
- 确保使用 WSS（不是 WS）
- Render 默认支持 WebSocket，无需额外配置
- 检查防火墙设置

---

## 🌍 其他部署选项

### 后端部署选项

| 平台 | 免费额度 | 优点 | 缺点 |
|------|---------|------|------|
| **Render** | ✅ 750小时/月 | 简单，支持 WebSocket | 会休眠 |
| **Railway** | ✅ $5/月额度 | 快速，不休眠 | 额度用完需付费 |
| **Fly.io** | ✅ 3个应用 | 全球部署 | 配置稍复杂 |
| **Heroku** | ❌ 已取消免费 | 稳定 | 需付费 |

### 前端部署选项

| 平台 | 免费额度 | 优点 | 缺点 |
|------|---------|------|------|
| **Vercel** | ✅ 无限制 | 最快，零配置 | - |
| **Netlify** | ✅ 100GB/月 | 简单 | - |
| **GitHub Pages** | ✅ 无限制 | 集成 GitHub | 仅静态内容 |
| **Cloudflare Pages** | ✅ 无限制 | 全球 CDN | - |

---

## 📝 部署检查清单

### 部署前

- [ ] 服务器代码已推送到 GitHub
- [ ] 已安装 Vercel CLI
- [ ] 已注册 Render 账号

### 部署后端

- [ ] 在 Render 创建 Web Service
- [ ] 设置环境变量（NODE_ENV, PORT）
- [ ] 部署成功，获取 URL
- [ ] 测试服务器 API（访问 URL 应该看到响应）

### 部署前端

- [ ] 更新 MultiplayerManager.ts 中的服务器 URL
- [ ] 提交并推送代码到 GitHub
- [ ] 运行 `vercel --prod` 部署
- [ ] 获取生产环境 URL

### 测试

- [ ] 访问前端 URL
- [ ] 测试单人模式
- [ ] 测试多人联机（创建房间）
- [ ] 邀请朋友测试多人游戏
- [ ] 检查移动端兼容性

---

## 🚀 进阶优化

### 1. 自定义域名

**Vercel**:
1. 在 Vercel Dashboard → Settings → Domains
2. 添加你的域名（如 `camelup.yourdomain.com`）
3. 按照提示配置 DNS

**Render**:
1. 在 Render Dashboard → Settings → Custom Domain
2. 添加域名（如 `api.yourdomain.com`）
3. 配置 DNS CNAME 记录

### 2. 性能优化

- **启用 CDN**: Vercel 自动提供全球 CDN
- **压缩资源**: Vite 构建时自动压缩
- **懒加载**: 考虑按需加载组件

### 3. 监控和日志

- **前端**: 使用 Vercel Analytics
- **后端**: 查看 Render 的日志和指标
- **错误追踪**: 考虑集成 Sentry

---

## 💰 成本估算

### 免费方案
- **Vercel**: 完全免费
- **Render**: 免费（服务器会休眠）
- **总计**: $0/月

### 生产环境推荐
- **Vercel Pro**: $20/月（可选，免费版够用）
- **Render Starter**: $7/月（不休眠）
- **总计**: $7-27/月

---

## 📞 获取帮助

遇到问题？

1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 查看 [Render 文档](https://render.com/docs)
3. 检查服务器日志
4. 提交 Issue 到 GitHub

---

## 🎉 部署成功！

恭喜！你的骆驼大赛现在已经可以在全球访问了！

分享你的游戏链接给朋友：
```
https://your-app.vercel.app
```

享受多人在线骆驼大赛吧！🐪🌍
