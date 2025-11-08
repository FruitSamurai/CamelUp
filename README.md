# 🐪 骆驼大赛 (Camel Up)

一款基于经典桌游《骆驼大赛》的Web游戏，使用现代Web技术栈开发。

![骆驼大赛](https://img.shields.io/badge/Game-Camel%20Up-orange)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PixiJS](https://img.shields.io/badge/PixiJS-8-green)

## 📖 游戏简介

骆驼大赛是一款充满策略和运气的赛驼博弈游戏。玩家通过对5只赛跑的骆驼进行下注，预测哪只骆驼会在比赛中获胜，最终获得最多金钱的玩家获胜。

### 🎯 游戏特色

- **骆驼叠加系统**：骆驼可以叠在其他骆驼背上，被骑的骆驼移动时会带着背上所有的骆驼一起移动
- **金字塔骰子**：使用特殊的金字塔摇骰子，增加游戏的随机性和趣味性
- **多种玩家动作**：赛段下注、摇骰子、放置观众板块、比赛下注
- **赛段制**：游戏分为多个赛段，每个赛段结束时结算一次

## 🛠️ 技术栈

### 核心技术

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **PixiJS** - Canvas渲染引擎
- **Zustand** - 状态管理
- **GSAP** - 动画库
- **styled-components** - CSS-in-JS

### 项目架构

```
camel-up/
├── src/
│   ├── components/          # React组件
│   │   ├── GameBoard/       # 游戏主面板（PixiJS Canvas）
│   │   ├── BettingArea/     # 下注区域
│   │   ├── PlayerPanel/     # 玩家面板
│   │   └── UI/              # 通用UI组件
│   ├── game/                # 游戏逻辑（纯TypeScript）
│   │   ├── GameEngine.ts    # 游戏引擎
│   │   ├── CamelManager.ts  # 骆驼管理
│   │   ├── BettingManager.ts # 下注管理
│   │   └── PyramidManager.ts # 金字塔管理
│   ├── renderer/            # PixiJS渲染器
│   │   └── GameRenderer.ts  # 游戏渲染器
│   ├── store/               # 状态管理
│   │   └── gameStore.ts     # Zustand store
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts
│   └── utils/               # 工具函数
│       ├── constants.ts     # 常量配置
│       └── helpers.ts       # 辅助函数
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 即可开始游戏。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🎮 游戏规则

### 游戏设置

- 2-8名玩家
- 每位玩家初始金钱：3 EP（埃及镑）
- 5只不同颜色的骆驼：红、蓝、绿、黄、白
- 赛道长度：16格

### 玩家动作

每个回合，玩家可以选择以下4种动作之一：

#### 1. 赛段下注
- 预测当前赛段结束时哪只骆驼会领先
- 每个颜色有6张下注牌，价值从高到低：5, 3, 2, 2, 1, 1
- 先下注的玩家获得更高价值的下注牌

#### 2. 摇骰子
- 获得1 EP奖励
- 从金字塔中随机掷出一个骰子
- 对应颜色的骆驼移动1-3格

#### 3. 放置观众板块
- 绿洲板块：骆驼向前移动1格，玩家获得1 EP
- 海市蜃楼板块：骆驼向后移动1格，玩家获得1 EP

#### 4. 比赛下注
- 预测整场比赛的冠军或垫底
- 比赛结束时结算

### 赛段结算

当所有5个骰子都从金字塔中掷出后，赛段结束：

- **第一名下注奖励**：5, 3, 2, 1 EP（按下注顺序）
- **第二名下注奖励**：3, 2, 1, 1 EP（按下注顺序）
- **错误下注惩罚**：-1 EP

### 游戏结束

当任何一只骆驼越过终点线（第16格）时，游戏立即结束，进行最终结算。

## 🎨 游戏特色

### 骆驼叠加机制

这是游戏最独特的机制：

- 当骆驼移动到已有其他骆驼的格子时，会叠在最上面
- 骆驼移动时，会带着背上所有的骆驼一起移动
- 这使得比赛结果充满不确定性和策略性

### Canvas渲染

使用PixiJS实现流畅的游戏动画：

- 骆驼移动动画
- 骆驼堆叠动画
- 平滑的过渡效果

## 📝 开发计划

### 已完成功能 ✅

- [x] 游戏核心逻辑
- [x] 骆驼移动和叠加系统
- [x] 赛段下注系统
- [x] 摇骰子功能
- [x] PixiJS渲染引擎
- [x] 基础UI界面
- [x] 玩家信息面板
- [x] 游戏设置界面

### 待开发功能 🚧

- [ ] 观众板块功能
- [ ] 比赛下注功能（冠军/垫底）
- [ ] 更精美的骆驼渲染（可能使用图片资源）
- [ ] 金字塔摇动动画
- [ ] 音效和背景音乐
- [ ] 游戏历史记录显示
- [ ] 移动端适配
- [ ] 本地存储游戏进度
- [ ] AI玩家
- [ ] 在线多人模式

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- 原版桌游：Camel Up (Steffen Bogen)
- 技术支持：React, PixiJS, Zustand等开源项目

---

**祝你游戏愉快！🎉**
