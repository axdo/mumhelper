# 妈妈帮手（MumHelper）

面向新手妈妈的母婴记录网页应用（手机浏览器优先，PWA 可添加到主屏幕、离线可用）。数据全部存储在浏览器本地 IndexedDB，数据模型预留云同步能力。

## 功能（MVP）

- 首页：宝宝日龄、今日概览（喂奶/尿布/睡眠）、一键记录（亲喂计时、瓶喂、换尿布、睡眠计时，刷新不丢）
- 记录：喂养/尿布/睡眠合并时间线，按类型筛选，可删除
- 统计：日/周切换，喂养次数与奶量、大小便次数、睡眠时长图表（ECharts）
- 我的：宝宝信息 + 妈妈分娩档案

## 技术栈

Vite + Vue 3 + TypeScript / vue-router（hash 模式）/ Dexie.js（IndexedDB）/ ECharts（按需引入）/ vite-plugin-pwa / 手写移动优先 CSS

## 开发

```bash
npm install
npm run dev      # 开发（PWA 在 dev 下不生效属正常）
npm run build    # 类型检查 + 构建（产物含 Service Worker）
npm run preview  # 预览构建产物
```

## 架构说明

组件不直接访问 Dexie：所有数据读写经过 `src/repositories/` 仓库层，未来接入云同步只需改动这一层。领域类型定义在 `src/types.ts`（纯类型），Dexie 实例与表结构在 `src/db/database.ts`。所有时间字段统一使用 epoch 毫秒。

需求文档见 `docs/requirements.md`。
