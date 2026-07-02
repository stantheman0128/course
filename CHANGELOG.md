# Changelog

## repo 維護 — 2026-07-02

僅倉庫清理,不影響部署內容,不 bump SW 快取版本(仍是 `course-v2.0.5`),沒動 `sw.js`、`index.html` 或 `app/`。

- 移除整個 `tests/` 目錄(11 個測試檔)。這些是 React/TypeScript 時代的死測試,全數 `import` 自已不存在的 `../src/...`(src/ 早已刪除、git 未追蹤),且沒有 `package.json` / `vitest.config` 掛任何測試 runner,無法執行也與現行 vanilla JS PWA(`app/`)無關。
- `archive/` 保留不動。

## v2.0.5 — 2026-07-02

- 課程與版本資料抽離：把 `app/app.js` 內嵌的 `currentSemesterCourses`（114-2 學期課程）和 `CHANGELOG`（版本記錄）搬到獨立的 `app/data/courses.js`，在 `app.js` 之前用 `<script>` 載入。資料逐字照搬、邏輯零改動，`app.js` 從 1581 行降到 1352 行。
- Service worker 快取清單加入 `data/courses.js`，快取版本 bump 到 `course-v2.0.5`；`index.html` 的 `style.css` / `app.js` cache-bust query 一併更新為 `?v=2.0.5`。
