# Changelog

## v2.0.5 — 2026-07-02

- 課程與版本資料抽離：把 `app/app.js` 內嵌的 `currentSemesterCourses`（114-2 學期課程）和 `CHANGELOG`（版本記錄）搬到獨立的 `app/data/courses.js`，在 `app.js` 之前用 `<script>` 載入。資料逐字照搬、邏輯零改動，`app.js` 從 1581 行降到 1352 行。
- Service worker 快取清單加入 `data/courses.js`，快取版本 bump 到 `course-v2.0.5`；`index.html` 的 `style.css` / `app.js` cache-bust query 一併更新為 `?v=2.0.5`。
