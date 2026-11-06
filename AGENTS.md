# 妈妈帮手（MumHelper）— AGENTS.md

> 本文档面向 AI 编码助手，介绍本项目的架构、约定与常用命令。项目文档与代码注释均使用中文。

## 项目概览

极简喂奶记录**单页网页应用**（手机浏览器优先的 PWA，可添加到主屏幕、离线可用）。功能只有两个：**记录喂奶的开始/结束时间**、**展示当天的喂奶记录（含时长与汇总）**。

> 注意：项目经历过大幅精简（见 `docs/requirements.md` 第 4 节）。尿布/睡眠/统计图表/宝宝档案/分娩档案均已移除，不要按旧功能推断现有代码。

**数据全部存储在浏览器本地 IndexedDB（Dexie.js），不出设备**；记录带 `id` / `createdAt` / `updatedAt` 字段，为将来云同步预留。

- 仓库：https://github.com/axdo/mumhelper
- 线上地址：https://axdo.github.io/mumhelper/
- 需求基线文档：`docs/requirements.md`

## 技术栈

- **Vite 8 + Vue 3（`<script setup lang="ts">`）+ TypeScript ~6**
- **Dexie.js 4**（IndexedDB 封装）
- **vite-plugin-pwa**（`registerType: 'autoUpdate'`）
- 无路由（单页）、无 UI 框架、无状态管理库：手写移动优先 CSS（`src/style.css` 全局设计变量 + 组件 scoped 样式），共享状态用模块级 `ref` 的 composable
- 无测试框架、无 linter（ESLint/Prettier 均未配置）

## 常用命令

```bash
npm install        # 安装依赖（CI 用 npm ci）
npm run dev        # 开发，默认 http://localhost:5173/mumhelper/（注意 base 子路径）
npm run build      # vue-tsc 类型检查 + vite build，产物到 dist/（含 Service Worker）
npm run preview    # 本地预览构建产物
```

注意事项：

- `npm run build` 先跑 `vue-tsc -b` 做类型检查，这是唯一的"质量门禁"——提交前务必跑通。
- dev 模式下 PWA 不生效属正常；验证 PWA 需 `npm run preview` 或线上 HTTPS 环境。
- 局域网手机调试：`npm run dev -- --host`（HTTP 下无法"安装"PWA，正常限制）。
- `node scripts/gen-icons.mjs`：一次性脚本，用纯 Node（无依赖）生成 `public/icons/` 下的 PNG 图标，一般不需要重跑。

## 目录结构与分层

```
src/
  main.ts              # 入口：createApp + 全局样式
  App.vue              # 根组件：HomeView + 全局 toast 容器
  types.ts             # 领域模型类型（纯类型，不依赖 Dexie，组件可直接引用）
  style.css            # 全局样式与 CSS 变量（主题色 --color-primary: #e8836b 珊瑚色系）
  db/database.ts       # Dexie 实例与表结构（数据库名 mumhelper，当前 version(3)，仅 feedings 表）
  repositories/        # 仓库层：feedingRepo（add / update / remove / listByRange）
  composables/         # useToast（全局轻提示）
  utils/time.ts        # 时间工具（起止日、格式化、datetime-local 互转）
  views/HomeView.vue   # 唯一页面：喂奶起止时间录入表单 + 今日记录列表
docs/                  # requirements.md（需求基线）；deployment.md 被 .gitignore 排除，仅本地
scripts/gen-icons.mjs  # PWA 图标生成脚本
public/icons/          # PWA 图标（提交进仓库）
```

## 核心架构约定（改动时必须遵守）

1. **组件不直接访问 Dexie**。所有数据读写必须经过 `src/repositories/` 仓库层；未来接入云同步只改这一层。仓库层负责补 `createdAt` / `updatedAt`（`Date.now()`）。
2. **所有时间字段统一使用 epoch 毫秒（number）**，格式化与日期边界计算走 `src/utils/time.ts`，不要在组件里散落 `new Date()` 格式化逻辑。
3. **`src/types.ts` 只放纯类型**（不 import Dexie），使组件层与持久层解耦。
4. **数据库 schema 变更必须递增 Dexie 版本号**（`this.version(N).stores(...)`），删除表用 `表名: null`。版本历史：v1 初版五表 → v2 移除 mother → v3 只保留 feedings。

## 代码风格

- Vue SFC 一律 `<script setup lang="ts">`；类型用 `import type` 引入。
- 命名：仓库对象为 `xxxRepo`；输入类型为 `XxxInput = Omit<XxxRecord, 'id' | 'createdAt' | 'updatedAt'>`。
- 样式：优先复用 `src/style.css` 中的全局类（`.page` / `.card` / `.btn` / `.field` 等）与 CSS 变量；组件特有样式写 `<style scoped>`。布局移动优先，内容最大宽度 540px 居中。
- tsconfig 开启 `noUnusedLocals` / `noUnusedParameters` / `erasableSyntaxOnly` / `noFallthroughCasesInSwitch`，未使用变量会导致构建失败。
- 注释用中文，只在关键决策处写（如" v3 只保留 feedings 表"）。

## 测试

**项目目前没有测试框架和测试文件**。改动后的验证方式是：

1. `npm run build` 通过（含 vue-tsc 类型检查）；
2. `npm run dev` / `npm run preview` 手动走查核心路径：保存记录（含时间校验）、今日列表展示与汇总、删除、刷新后数据仍在。

## 部署

- GitHub Actions（`.github/workflows/deploy.yml`）：push 到 `main` 即触发 `npm ci && npm run build`，`dist/` 发布到 GitHub Pages，无需手动操作。
- **子路径部署**：`vite.config.ts` 中 `base: '/mumhelper/'`，且 PWA manifest 的 `start_url` / `scope` 同为 `/mumhelper/`。**改仓库名时三处必须同步修改**，否则页面 404。
- PWA 更新策略为 autoUpdate：新版部署后用户端关闭重开即更新。

## 安全与隐私

- 核心卖点是**数据不出设备**：不要引入任何会把记录数据发往外部服务的代码（分析 SDK、远程日志等）；未来做云同步需先明确用户授权（见需求文档 §3）。
- 无后端、无密钥、无鉴权；不要往仓库提交任何凭证。
- `docs/deployment.md` 被 `.gitignore` 排除（含部署细节），勿强制提交。
