# Deployment

> **Architecture note**：2026-05-18 之後 pivot 回單檔 HTML 架構（`index.html` at root）。
> React/Vite 版本封存於 `archive/react-attempt-2026-05-18/`。

## 現行部署方式：Wrangler 直接上傳

course 系統用 **Cloudflare Pages direct upload**（不是 Git integration）。

- Pages 專案名稱：`course`
- 預設網址：`https://course-cvi.pages.dev`
- Cloudflare 帳號：stanshih888@gmail.com (account `97cf88bf307d6a78c496e80ae99677de`)
- 自訂網域：`course.stan-shih.com`（dashboard 設定，見下方）

### 部署指令

每次要 deploy 新版本：

```bash
# 1. 複製 index.html 到乾淨的 staging 資料夾（_deploy 已在 .gitignore）
mkdir -p _deploy && cp index.html _deploy/index.html

# 2. 上傳
npx wrangler pages deploy _deploy --project-name=course --branch=main --commit-dirty=true
```

`_deploy/` 只放 `index.html` — 避免把 `archive/`、`docs/`、`.git` 一起傳上去。

### 首次登入（一次性）

```bash
npx wrangler login
```

會開瀏覽器做 OAuth。登入狀態存在 `~/.wrangler/`，之後不用再登入。

## 自訂網域 course.stan-shih.com（dashboard 一次性設定）

`wrangler pages` 沒有 custom-domain 指令，所以這步要在 dashboard 做：

1. https://dash.cloudflare.com → **Workers & Pages** → **course**
2. **Custom domains** 分頁 → **Set up a custom domain**
3. 輸入 `course.stan-shih.com` → Continue
4. `stan-shih.com` zone 已在同一個 Cloudflare 帳號 → CF 自動建立 CNAME 記錄
5. 等 SSL 憑證發放（約 30 秒–2 分鐘）
6. 驗證：開 `https://course.stan-shih.com`

設定一次之後，每次 `wrangler pages deploy` 都會自動更新到這個網域。

## Git 現況

- `main` = production，`html-v2` = dev
- 兩個 branch 目前同步（fast-forward）
- 注意：Pages 專案是 direct-upload 模式，**push 到 GitHub 不會自動 deploy**，要手動跑 wrangler 指令

## 後續 maintenance

新版本流程：

```bash
# 改 index.html → commit → 在 html-v2 開發
git add index.html && git commit -m "feat: vX.Y.Z — ..."
git push origin html-v2

# 要 deploy 時：merge 到 main + 部署
git checkout main && git merge html-v2 --ff-only && git push origin main
git checkout html-v2
mkdir -p _deploy && cp index.html _deploy/index.html
npx wrangler pages deploy _deploy --project-name=course --branch=main --commit-dirty=true
```

## 與舊版 React 部署的差異

| | React 版本 (archived) | 現行單檔 HTML |
|---|---|---|
| 部署方式 | Git integration (push 自動 deploy) | Wrangler direct upload (手動指令) |
| Build command | `npm run build` | _(none)_ |
| Deploy artifact | bundled `dist/` | 單一 `index.html` |
