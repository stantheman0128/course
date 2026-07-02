/* 資工系畢業學分檢核系統 — 課程與版本資料
   自 app.js 抽離的純資料常數，供 app.js 在其之前載入引用。
   這裡只放資料（不含邏輯）：114-2 學期可模擬課程清單 + 版本變動記錄。
   內容與抽離前的 app.js 逐字相同，僅位置搬移。 */

        // 114-2學期課程（依學分 desc → 必修優先順序排列）
        const currentSemesterCourses = [
            {name: "計算機結構", credits: 3, type: "cs_core"},
            {name: "演算法", credits: 3, type: "cs_core"},
            {name: "離散數學", credits: 3, type: "math_core"},
            {name: "資訊專題研究（二）：資訊系統", credits: 3, type: "project"},
            {name: "數位邏輯", credits: 3, type: "hardware"},
            {name: "影像處理", credits: 3, type: "multimedia"},
            {name: "計算機圖學", credits: 3, type: "multimedia"},
            {name: "資安攻防演練", credits: 3, type: "dept_elective"},
            {name: "體育（籃球初級）", credits: 1, type: "pe"}
        ];

        // ===== Changelog =====
        // 'theme' 標記：只有引入新視覺風格的版本才有切換按鈕
        // 後續若有純 CSS 視覺改動的版本，加上 theme: '<theme-id>' 即可
        // Markup: **bold**、__underline__、*italic*（renderMarkup 解析）
        const CHANGELOG = [
            {
                version: 'v2.0.5',
                date: '2026-07-02',
                type: 'patch',
                changes: [
                    '**課程與版本資料抽離**:把 app.js 內嵌的 `currentSemesterCourses`(114-2 課程)與 `CHANGELOG`(版本記錄)搬到獨立的 *data/courses.js*,在 app.js 之前載入。資料逐字照搬、邏輯零改動,app.js 從 1581 行降到 1352 行',
                    'service worker 快取清單加入 `data/courses.js`、快取版本 bump 到 *course-v2.0.5*'
                ]
            },
            {
                version: 'v2.0.3',
                date: '2026-05-20',
                type: 'patch',
                changes: [
                    '__修正裝成 App 後離線「無法連線」__:Cloudflare Pages 把 `/index.html` 308 重導向到 `/`,service worker `cache.addAll()` 抓到 redirected response 會整批 reject → SW 安裝失敗 → 離線全掛',
                    '**改用正規 URL**:manifest `start_url` 改 `./`(原 `./index.html`);SW 預快取清單拿掉 `./index.html` 只留 `./`;離線 fallback 也改 `./`',
                    '**SW 安裝改 `Promise.allSettled`**:單一檔案抓取失敗不再拖垮整個安裝,離線快取更穩固'
                ]
            },
            {
                version: 'v2.0.2',
                date: '2026-05-20',
                type: 'patch',
                changes: [
                    '**手機 header 標題縮字**:11 字標題在手機直向會斷兩行 → ≤600px 縮到 *25px*、≤380px 縮到 *22px*,維持單行',
                    '**滾動 sticky bar 改 2 排式（≤780px）**:標題列(標題 + 字級 slider)+ 數據列(4 格)。__標題與 slider 不再隱藏__ — 直向觀看標題一樣會併入 bar(之前只有橫向會)',
                    '__修正手機滾動壓縮卡頓__:`.stats` / `.stat-item` / `.stat-number` 的 *font-size / padding* 過渡會逐幀 reflow,手機上(≤780px)關掉這些過渡,狀態切換改瞬間完成',
                    '字級 slider 在手機直向恢復顯示(v2.0.1 曾因擠不下而隱藏,改 2 排後有空間了)'
                ]
            },
            {
                version: 'v2.0.1',
                date: '2026-05-20',
                type: 'patch',
                changes: [
                    '__修正窄螢幕 CJK 文字逐字直排 bug__:`.stat-number` / `.stat-label` 加上 *white-space: nowrap*,文字不再因空間不足而一字一行變直式',
                    '**修好失效的響應式 media query**:舊的 `@media` 寫 `.stats { grid-template-columns }`,但 `.stats` 自 v1.12 起是 *flex* 不是 grid → 整段失效。改成對真正的 grid 容器 `.stats-grid` 做 RWD',
                    '**窄螢幕 stats 4 格 → 2 格**(≤640px)、字體分級縮小(≤640px / ≤430px)',
                    '**滾動 sticky bar 窄螢幕處理**:≤820px 藏標題(header 已有完整標題)、縮字縮距;≤430px 連字體 slider 也收起,只留 4 格數據',
                    '*style.css* / *app.js* 連結加版本 query(`?v=2.0.1`)做 cache-busting,改版時瀏覽器確實抓新檔'
                ]
            },
            {
                version: 'v2.0.0',
                date: '2026-05-20',
                type: 'major',
                changes: [
                    '__架構大改：單檔 → 多檔__。原本 3,382 行的單一 index.html 拆成 *index.html*（markup）+ *style.css*（樣式）+ *app.js*（邏輯）三個檔案,純機械式分離、行為 100% 不變',
                    '**PWA 支援**:新增 *manifest.webmanifest* + *sw.js*（service worker）+ *icon.svg*,變成可安裝的 Progressive Web App',
                    '**可安裝**:桌面 / 手機都能「加到主畫面」,開啟後是獨立視窗、無瀏覽器網址列,像原生 App',
                    '**離線可用**:service worker 用 cache-first 策略快取 index.html / style.css / app.js / 字體,沒網路也能開',
                    '*app.js* 用一般 `<script>` 載入（非 module）,確保 HTML 裡的 inline onclick handler 仍能解析全域函式 — 拆檔不破壞結構的關鍵',
                    '檔案放在 *app/* 資料夾,根目錄舊版單檔 index.html 保留不動'
                ]
            },
            {
                version: 'v1.18.0',
                date: '2026-05-20',
                type: 'minor',
                theme: 'current',
                changes: [
                    '**Header bg 改全透明**：跟 footer 一樣 *transparent*；container 上方 95-132px 加 transparent 過渡到 white zone，body 紫色 gradient 從 header 區域顯現',
                    '**Blur 過渡延伸到 4 stats 上緣**：container 的紫→白 fade 在 *110px (50%)* → *120px (85%)* → *132px (純白)* — 4 stats 上緣 (約 120px) 剛好在過渡尾端',
                    '**白色卡片邊緣感加強**：*.stat-item*、*.simulator-panel*、*.tree-header*、*.node-content* 的 border *1px → 1.5px*、alpha *0.5→0.7-0.8*、加多層 box-shadow 製造立體感',
                    '**頁尾縮小**：footer padding *40/25/50 → 18/25/24*（垂直 90px → 42px）；font-size *13→12px*；subtitle margin-top *8→5px*、font-size *12→11px*'
                ]
            },
            {
                version: 'v1.17.0',
                date: '2026-05-20',
                type: 'minor',
                changes: [
                    '**Course section 真正的 expand/collapse 動畫**：refactor *renderCourseList* — 每個 section（新增課程 / 本學期修課中 / 可選課程 / 已修）包進 *.course-section* wrapper，用 *grid-template-rows 0fr→1fr* 過渡（跟 tree-children 一樣的展開動畫）',
                    '**walkUpdate diff-update sections**：取代原本 *innerDiv.textContent=\'\'* + rebuild，改用 *syncCourseSections* 比對 section keys。新 section 進場展開、舊 section 退場收合、保留 section 內容 snap 更新',
                    '__移除 v1.16 fade-in flicker keyframe__（被新展開動畫取代）',
                    '**Header bg 改回 gradient**：solid *#764ba2* (user 覺得偏藍) → *linear-gradient(135deg, #667eea, #764ba2)*，跟 body 一致',
                    '**Header 高度回到 v1.7 比例**：padding *35px 30px 45px* → *25px 30px 28px*；h1 字體 *36px w900* → *32px w800*；emoji *38px* → *34px*；mask fade *22px* → *14px*',
                    '**字體大小 slider 取代 A 按鈕**：footer 的 *A / A+ / A++* cycle button 拿掉，改用 sticky bar 右側 *滑桿*（連續 0.85x–1.35x，step 0.05）。__僅滾動時顯示__；用 *body.style.zoom* 直接控制；localStorage \'font-zoom\' 記住',
                    '**Slider 樣式**：白色 thumb + 紫色 *#6d28d9* 邊框 + 紫色填充軌道；左右各一個 *A* 字 icon（小→大）標示方向'
                ]
            },
            {
                version: 'v1.16.0',
                date: '2026-05-20',
                type: 'minor',
                changes: [
                    '**頁尾漸層 smoother**：container 底部 fade 從 2-stop linear 改用 6-stop ease 過渡，fade zone 拉長到 *280px*（原 220px）',
                    '**Sticky bar title 字體**改用 *Noto Serif TC w900*，跟 header 同款（原 Microsoft JhengHei）',
                    '**Header 紫色化**：*#667eea* (偏藍 indigo) → __#764ba2__（更明確的紫色）',
                    '**Changelog 移除 emojis**，改用 markup parser 解析 **bold**、__底線__、*斜體*',
                    '**新增課程 / 本學期修課中動畫**：walkUpdate 重建 leaf 內 course list 時，所有 *li* 觸發 *courseEnter* fade-in (translateY -4px → 0)',
                    '**字體大小切換**：footer 加 *A / A+ / A++* 按鈕，cycle 三種大小（zoom *1 / 1.1 / 1.2*），__localStorage 記住__',
                    '*Simulator panel* mask 起點 calc(100%-190px) → *calc(100%-250px)*；*tree-panel* 90px → *150px*，對齊新的 280px container fade'
                ]
            },
            {
                version: 'v1.15.0',
                date: '2026-05-20',
                type: 'minor',
                changes: [
                    '**Header 重設計**參考 *v1.7*：solid 紫色 *#667eea* 純底色 + 白字（不用漸層）',
                    '**Header 字體**用 *Noto Serif TC w900 36px*（保留 v1.12 試的好看襯線字）',
                    '紫色 header 與白色內容的交接處用 *mask-image* fade 出 **blur 效果**（22px 漸層透明，不是整個漸層）',
                    '**Sticky bar 4 格中間加 | 分隔線**（border-right 1px 淡紫）',
                    'Sticky bar 4 格位置在 title 以外的空白**置中**（stats-grid *flex:1 + justify-center*）',
                    '*Simulator panel* mask 漸層起點調整為 *calc(100% - 190px)* 對齊 container 底部 fade 起點',
                    '*Tree panel* mask 漸層起點調整為 *calc(100% - 90px)* 對齊 container 底部 fade 起點',
                    '__v1.14.0 theme tag 拿掉__（其視覺已被 v1.15 取代）；v1.15.0 接手 *theme: current*'
                ]
            },
            {
                version: 'v1.14.0',
                date: '2026-05-20',
                type: 'minor',
                changes: [
                    '__Revert v1.12 fancy serif 實驗__：header h1 改回 *Microsoft JhengHei 32px* white 純文字（拿掉 gradient text / glow / Noto Serif TC）',
                    '__Revert v1.12 紫色 sticky bar__：scrolled bar 改回 v1.10 風格白玻璃 + 紫色 stat numbers + 灰色 labels',
                    '__Revert v1.13 「無紫色頂部」__：container 恢復上方透明 zone，body 紫色 gradient 從頂部露出（白字 header on purple body）',
                    '__Revert v1.12 header padding__：55px→35px (compact，回到 v1.10 高度)',
                    '**Sticky bar title** 改紫色 (*#4f46e5*)、字體 *Microsoft JhengHei 18px* (配合白玻璃 bar)',
                    '**移除 progress-bar 殘留 CSS + JS**（v1.13 拿掉 HTML 元素時遺漏的）',
                    '保留 v1.12 的所有 features：*title morph、stat 對齊修復、star bumps、tree mask、theme transition、toggle bounce*',
                    '__v1.12.0 theme tag 拿掉__（其視覺實驗已 revert，不再保留為 reachable theme）'
                ]
            },
            {
                version: 'v1.13.0',
                date: '2026-05-20',
                type: 'minor',
                changes: [
                    '**拿掉上方紫色漸層**：container 從頂部就是白底，只在 footer 區域才漸層透出紫色',
                    '**Header h1 gradient** 改用深紫色 (*#4f46e5 → #6d28d9 → #7c3aed*) 配合白底有對比',
                    '**Sticky bar 加大**：title 字體 *16→21px*、stat-number *17→20px*、stat-label *12→14px*',
                    '拿掉 sticky bar 內的 cell **垂直分隔線**，4 格融入 bar 為連續整體',
                    '**移除「已修學分」格下方的小 progress-bar**',
                    '**全螢幕按鈕加入 bounce 動畫**（含 rotate 變化），按下時視覺更明顯',
                    '**Theme 拆分**：v1.10.0 → 「v1-10」獨立 theme（透明 header、白玻璃 scrolled bar、無 title morph）；v1.12.0 → 「current」（latest）'
                ]
            },
            {
                version: 'v1.12.0',
                date: '2026-05-20',
                type: 'minor',
                changes: [
                    '**Header 重設計**：紫色 bar 拿掉、星空當背景、*Noto Serif TC* 學術襯線字體 + 紫色 gradient text + 多層 glow（__v1.14 已 revert__）',
                    '**Sticky bar 滾動形變**：滾動時標題縮入 bar 靠左、4 stats 靠右、整條 bar 變紫色漸層、字色翻白',
                    '**修正第一格 stat-item 內容上下對齊**（progress-bar 改 *absolute*、不再擠壓 flex centering）',
                    '**星空 +10% 數量** (*130→143*) + **+20% 亮度** (canvas opacity *0.7→0.84*)',
                    '*Tree panel* 與 *simulator panel* 底部 **mask fade**，向下滾動時白色 block 邊界自然溶入紫色頁尾',
                    '**Theme 切換**加入 0.45s smooth transition（bg、color、border、padding 都會緩動）',
                    '**「全選 ↔ 取消全選」按鈕**新增 *toggle bounce* 動畫，狀態切換視覺更明顯',
                    '**Classic theme 同步更新**：h1 在 classic 退回 v1.7 白字樣式、scrolled bar 維持原本白玻璃'
                ]
            },
            {
                version: 'v1.11.0',
                date: '2026-05-20',
                type: 'minor',
                changes: [
                    '**Changelog modal** 加入「切換到此樣式」按鈕，可即時在不同視覺版本間切換',
                    '選擇用 *localStorage* 記住，重新整理後保留設定',
                    '規則：__只有引入新視覺風格的版本__顯示切換按鈕（v1.10.0 → current，v1.7.0 → classic）'
                ]
            },
            {
                version: 'v1.10.0',
                date: '2026-05-20',
                type: 'minor',
                theme: 'v1-10',
                changes: [
                    '**按鈕設計改版**：「全選」改 *outline + glass*，「全螢幕」改 *ghost* 風格',
                    '**Header 與 Footer 改為透明**，融入紫色漸層 + 星空背景',
                    '**Container 改為上下紫色帶** + 中間白色內容區，消除視覺斷層',
                    '星空 canvas opacity 從 *0.6* 提升至 *0.7*',
                    '「取消全選」狀態改用 *amber* 而非 red，視覺更柔和'
                ]
            },
            {
                version: 'v1.9.0',
                date: '2026-05-20',
                type: 'minor',
                changes: [
                    '樹狀圖改用 diff-update：保留 DOM 結構不重建，只更新數字、狀態與展開類別',
                    '勾選或取消課程後，已完成的節點會像手動點箭頭一樣平滑收合（grid-template-rows 過渡）',
                    '層級式收合：當勾選課程讓「校共同必修」也滿足時，子節點與父節點會一起依層級收上去',
                    '抽出 renderCourseList 與 buildCourseDetail 兩個 helper，移除原本 inline 的 innerHTML 寫法'
                ]
            },
            {
                version: 'v1.8.1',
                date: '2026-05-19',
                type: 'patch',
                changes: [
                    '優化滾動收合動畫：移除 transition: all 並指定具體屬性，避免 display/box-shadow/border 等不可動畫屬性造成的閃跳',
                    '統一 stat-item 為 flex 布局（column → row），淡出邊框與背景而非瞬間移除',
                    '樹狀圖更新加入整體淡入淡出過渡，緩解砍掉重建造成的閃跳感'
                ]
            },
            {
                version: 'v1.8.0',
                date: '2026-05-19',
                type: 'minor',
                changes: [
                    '更新至 114-2 學期，新增本學期 9 門課程',
                    '通識分類修正（依 NTNU 官方分類）',
                    '加入英文 6 學分抵免',
                    '加入「全選 / 取消全選」按鈕',
                    '課程列表依學分與必修優先順序排序',
                    '加入版本變動記錄'
                ]
            },
            {
                version: 'v1.7.0',
                date: '2026-05-19',
                type: 'major',
                theme: 'classic',
                changes: [
                    '從 React 重構嘗試 pivot 回 v1.7 單檔架構',
                    '以 v1.7 為新基線重啟開發',
                    '此版本的視覺風格（solid 紫色 header、實心按鈕、灰底 footer）即為 classic theme 基準'
                ]
            }
        ];
