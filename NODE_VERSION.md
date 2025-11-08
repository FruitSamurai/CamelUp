# 🔧 服务器 Node.js 版本升级指南

## ❌ 错误原因

```
SyntaxError: Unexpected token ?
```

这个错误是因为服务器上的 Node.js 版本太旧（< 14），不支持 ES2020 的新语法（如 `??` 空值合并运算符）。

---

## ✅ 解决方案

### 方案 1: 升级 Node.js（推荐）

#### 使用 nvm (Node Version Manager)

**安装 nvm**:

```bash
# Linux/Mac
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 或使用 wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**重启终端，然后安装 Node.js 18**:

```bash
# 安装 Node.js 18 LTS
nvm install 18

# 使用 Node.js 18
nvm use 18

# 设置为默认版本
nvm alias default 18

# 验证版本
node -v  # 应该显示 v18.x.x
```

#### 直接安装 Node.js

**Ubuntu/Debian**:

```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装 Node.js 18
sudo apt-get install -y nodejs

# 验证版本
node -v
npm -v
```

**CentOS/RHEL**:

```bash
# 添加 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# 安装 Node.js 18
sudo yum install -y nodejs

# 验证版本
node -v
npm -v
```

**macOS (使用 Homebrew)**:

```bash
brew install node@18
brew link node@18
```

---

### 方案 2: 云服务器部署（推荐）

如果你使用云服务器（如 Render, Railway），它们会自动使用正确的 Node.js 版本。

#### Render 配置

在 `server/package.json` 中，我们已经添加了：

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

Render 会自动使用指定的 Node.js 版本。

#### Railway 配置

创建 `.nvmrc` 文件（已创建），内容：

```
v18.20.4
```

Railway 会自动读取此文件并使用指定版本。

---

## 🔍 检查当前 Node.js 版本

```bash
node -v
```

**要求**:
- ✅ Node.js >= 18.0.0（推荐）
- ⚠️ Node.js >= 14.0.0（最低要求）
- ❌ Node.js < 14.0.0（不支持）

---

## 📦 项目配置

### 已添加的配置

1. **package.json** (根目录)
   ```json
   {
     "engines": {
       "node": ">=18.0.0",
       "npm": ">=9.0.0"
     }
   }
   ```

2. **server/package.json**
   ```json
   {
     "engines": {
       "node": ">=18.0.0",
       "npm": ">=9.0.0"
     }
   }
   ```

3. **.nvmrc** (根目录)
   ```
   v18.20.4
   ```

这些配置确保云服务器使用正确的 Node.js 版本。

---

## 🚀 本地开发

### 检查 Node.js 版本

```bash
node -v
```

如果版本低于 18，请升级：

```bash
# 使用 nvm
nvm install 18
nvm use 18

# 或直接下载安装
# 访问 https://nodejs.org/
# 下载 LTS 版本（18.x 或更高）
```

### 重新安装依赖

```bash
# 清理旧依赖
rm -rf node_modules package-lock.json
rm -rf server/node_modules server/package-lock.json

# 重新安装
npm install
cd server && npm install && cd ..
```

### 测试运行

```bash
# 测试服务器
npm run server:dev

# 测试前端
npm run dev

# 同时运行
npm run start:all
```

---

## 🌍 云端部署

### Render 部署

1. 在 Render Dashboard 创建 Web Service
2. Render 会自动读取 `server/package.json` 中的 `engines` 字段
3. 自动使用 Node.js 18

**不需要额外配置！**

### Vercel 部署

1. Vercel 默认使用 Node.js 18
2. 可以在 `vercel.json` 中指定（可选）：

```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### Railway 部署

1. Railway 会自动读取 `.nvmrc` 文件
2. 自动使用指定的 Node.js 版本

---

## ⚠️ 常见问题

### Q: 我的服务器没有 root 权限，如何升级 Node.js？

**A**: 使用 nvm（不需要 root 权限）：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端
source ~/.bashrc

# 安装 Node.js 18
nvm install 18
nvm use 18
```

### Q: 升级后还是报错？

**A**: 清理缓存并重新安装：

```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### Q: 云服务器如何指定 Node.js 版本？

**A**:
- **Render**: 自动读取 `package.json` 的 `engines` 字段
- **Railway**: 自动读取 `.nvmrc` 文件
- **Heroku**: 自动读取 `package.json` 的 `engines` 字段
- **Vercel**: 默认使用最新 LTS 版本

### Q: 如何验证版本是否正确？

**A**: 运行以下命令：

```bash
node -v
# 应该显示 v18.x.x 或更高

npm -v
# 应该显示 9.x.x 或更高
```

---

## 📋 快速解决步骤

1. **检查版本**:
   ```bash
   node -v
   ```

2. **如果 < 18，升级**:
   ```bash
   nvm install 18
   nvm use 18
   ```

3. **重新安装依赖**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **测试运行**:
   ```bash
   npm run start:all
   ```

---

## 🎯 最佳实践

1. **开发环境**: 使用 nvm 管理多个 Node.js 版本
2. **生产环境**: 使用云服务器（自动管理版本）
3. **团队协作**: 提交 `.nvmrc` 文件到代码库
4. **CI/CD**: 在配置文件中指定 Node.js 版本

---

## 📞 需要帮助？

如果升级后仍有问题：

1. 检查 `node -v` 输出
2. 查看完整错误日志
3. 提交 Issue 到 GitHub
4. 附上系统信息（OS、Node 版本等）

---

## ✅ 升级成功确认

升级成功后，你应该能够：

1. 运行 `npm run start:all` 无错误
2. 看到服务器启动消息
3. 前端开发服务器正常运行
4. 多人联机功能正常

祝你升级顺利！🚀
