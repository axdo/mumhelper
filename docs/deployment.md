# 部署说明（GitHub Pages）

本文档记录「妈妈帮手」的部署方式、日常发布流程和常见问题。

## 概览

- **托管**：GitHub Pages（项目站点），地址 https://axdo.github.io/mumhelper/
- **仓库**：https://github.com/axdo/mumhelper
- **发布方式**：GitHub Actions 自动部署（工作流文件 `.github/workflows/deploy.yml`），push 到 `main` 分支即触发，无需手动操作
- **构建**：`npm ci && npm run build`，产物 `dist/` 由 Actions 发布到 Pages

## 日常发布流程（每次改完代码）

```bash
git add -A
git commit -m "改动说明"
git push
```

推送后 1–2 分钟自动完成部署。在 https://github.com/axdo/mumhelper/actions 查看运行状态，绿色即成功。

## 本地开发

```bash
npm install        # 首次克隆后安装依赖
npm run dev        # 开发模式，默认 http://localhost:5173/mumhelper/
npm run build      # 构建产物到 dist/（含 TS 类型检查）
npm run preview    # 本地预览构建产物
```

手机局域网调试：`npm run dev -- --host`，手机浏览器访问 `http://<电脑IP>:5173/mumhelper/`。
注意：HTTP 环境下 PWA 不生效（无法"安装"为全屏应用），属于正常限制。

## 一次性配置记录（已完成，仅供回溯）

1. GitHub 网页新建仓库 `mumhelper`（不勾选 README/.gitignore/License）
2. 本地初始化并推送：
   ```bash
   git init -b main
   git add -A
   git commit -m "首次提交"
   git remote add origin https://github.com/axdo/mumhelper.git
   git push -u origin main
   ```
3. 仓库 **Settings → Pages → Source 选择 "GitHub Actions"**（工作流中 `actions/configure-pages` 的 `enablement: true` 参数也可自动开启）
4. `vite.config.ts` 中 `base: '/mumhelper/'`——项目站点部署在子路径，**若改仓库名需同步修改此处**及 manifest 的 `start_url`/`scope`

## 手机端安装为应用（PWA）

1. 手机 Edge/Chrome 打开 https://axdo.github.io/mumhelper/
2. 浏览器菜单 →「添加到手机」→ 选择**「安装」**（不是"添加快捷方式"）
3. 从桌面图标打开：全屏无地址栏，离线可用
4. 之后每次部署新版，App 会自动更新（若打开还是旧版，关闭重开一次即可）

## 常见问题

| 问题 | 原因与解决 |
|---|---|
| Actions 报 `Get Pages site failed / Not Found` | Pages 未启用或 Source 不是 GitHub Actions → Settings → Pages 设置后 Re-run 工作流 |
| 页面打开 404 | 检查 `vite.config.ts` 的 `base` 是否与仓库名一致 |
| 手机上是旧版本 | Service Worker 后台更新机制，关闭 App 重开即可 |
| 本地局域网访问无法"安装" | HTTP 不支持 PWA 安装，必须用 HTTPS 地址（即线上地址） |
| 部署成功但样式/脚本 404 | 确认构建产物路径带 `/mumhelper/` 前缀（`npm run build` 后检查 `dist/index.html`） |
