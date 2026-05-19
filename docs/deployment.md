# Deployment

> **Architecture note**：2026-05-18 之後 pivot 回單檔 HTML 架構（`index.html` at root）。
> React/Vite 版本封存於 `archive/react-attempt-2026-05-18/`。
> 本檔反映**現行的單檔 HTML 部署設定**。

## Cloudflare Pages (Git integration)

### One-time setup at https://dash.cloudflare.com

1. Workers & Pages → Create → Pages → Connect to Git
2. Select repo `stantheman0128/course`
3. Production branch: `main`
4. **Build command**: _(留空)_ — 沒有 build step
5. **Output directory**: `/` — index.html 在 repo root
6. Root directory: `/`
7. Save and Deploy

### 如果你之前已經連好 React 版本

需要去 CF dashboard 把 build 設定改成靜態：

1. Pages 專案 → Settings → Build & deployments
2. **Build command**: 清空
3. **Build output directory**: 改成 `/`（原本 `dist`）
4. 重新 deploy（觸發新 commit 或在 dashboard 點 Retry deployment）

### Custom domain

1. Pages project → Custom domains → Set up a custom domain
2. 輸入 `course.stan-shih.com`
3. Cloudflare 自動偵測 `stan-shih.com` zone 並建立 CNAME
4. SSL 憑證 30s–2min 內發放
5. 驗證：`https://course.stan-shih.com` 應該載入 v1.18+

## Continuous deployment

- Push 到 `main` → 自動 deploy production
- 開 PR → 自動 preview URL

## 推送現有開發成果

`html-v2` 是現行開發 branch。要把它推到 production：

```bash
git checkout main
git merge html-v2 --ff-only
git push origin main
```

CF Pages 偵測到 main 變動會自動 deploy。

## 後續 maintenance

新版本只需要 commit `index.html` 改動，push 即可：

```bash
git add index.html
git commit -m "feat: vX.Y.Z — <description>"
git push origin main
```

## 與舊版 React 部署的差異

| | React 版本 (archived) | 現行單檔 HTML |
|---|---|---|
| Build command | `npm run build` | _(none)_ |
| Output | `dist/` | `/` (root) |
| Deploy artifact | bundled JS/CSS | 單一 `index.html` |
| 新功能流程 | 修原始檔 + build + commit + push | 修 `index.html` + commit + push |
| 第三方資產 | Google Fonts via `<link>` 同 | 同（Noto Serif TC） |
