# 師大資工畢業學分檢核

師大資工系的畢業學分檢核與課程模擬工具，純前端 PWA，可離線使用。輸入或匯入成績後，工具會比對課程架構表與修業規定，算出各類別還缺多少學分、哪些必修還沒過，並讓你模擬之後要選的課，看會不會卡畢業門檻。

線上版：[course.stan-shih.com](https://course.stan-shih.com)

## 技術

零相依的 vanilla JS PWA，沒有 build 步驟、沒有打包工具。程式都在 `app/`：

- `app/index.html`：進入點
- `app/app.js`：全部邏輯與內嵌的課程／規定資料
- `app/style.css`：樣式
- `app/sw.js`：service worker，負責離線快取
- `app/manifest.webmanifest`：PWA manifest

要本機跑的話，用任何靜態伺服器指到 `app/` 就好，例如 `npx serve app`，不需要 `npm install`。

## 部署

部署在 Cloudflare Pages（direct upload，非 Git 自動部署），上傳的是整個 `app/` 目錄。push 到 GitHub 不會自動上線，要手動跑 wrangler。完整指令與自訂網域設定見 [`docs/deployment.md`](docs/deployment.md)。

## 目錄

- `app/`：現行 production PWA
- `docs/`：部署說明、課程架構表來源 PDF、版本盤點
- `archive/react-attempt-2026-05-18/`：早期 React + Vite 改寫嘗試，已封存不再維護
