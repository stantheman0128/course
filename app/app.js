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

        let simulatedCourses = new Set();
        let currentEarned = 94;
        let currentPercentage = 73.4;
        let currentRemaining = 34;
        let mobileCoursesOpen = false;
        
        // 滾動閾值（縮小）
        const SCROLL_THRESHOLD = 50;

        // Scroll監聽
        window.addEventListener('scroll', () => {
            const stats = document.getElementById('stats');
            const treeHeader = document.getElementById('tree-header');
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > SCROLL_THRESHOLD) {
                stats.classList.add('scrolled');
                treeHeader.classList.add('floating');
            } else {
                stats.classList.remove('scrolled');
                treeHeader.classList.remove('floating');
            }
        });

        // 快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                toggleFullscreen();
            } else if (e.key.toLowerCase() === 'c') {
                e.preventDefault();
                if (window.innerWidth < 1200) {
                    toggleMobileCourses();
                }
            } else if (e.key === 'Escape') {
                if (changelogOpen) {
                    closeChangelog();
                    return;
                }
                closeMobileCourses();
                const panel = document.getElementById('tree-panel');
                if (panel.classList.contains('fullscreen')) {
                    toggleFullscreen();
                }
            }
        });
        
        function showShortcutHint(text) {
            const hint = document.getElementById('shortcut-hint');
            hint.textContent = text;
            hint.classList.add('show');
            setTimeout(() => hint.classList.remove('show'), 1500);
        }

        // 豎屏選課切換
        function toggleMobileCourses() {
            if (mobileCoursesOpen) {
                closeMobileCourses();
            } else {
                openMobileCourses();
            }
        }
        
        function openMobileCourses() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // 滾動到安全位置
            if (scrollTop < SCROLL_THRESHOLD + 20) {
                window.scrollTo({ top: SCROLL_THRESHOLD + 30, behavior: 'smooth' });
                setTimeout(() => {
                    showPanel();
                }, 350);
            } else {
                showPanel();
            }
            
            function showPanel() {
                const overlay = document.getElementById('mobile-overlay');
                const panel = document.getElementById('mobile-panel');
                const btn = document.getElementById('course-btn');
                
                mobileCoursesOpen = true;
                overlay.classList.add('active');
                panel.classList.add('active');
                btn.classList.add('active');
            }
        }
        
        function closeMobileCourses() {
            const overlay = document.getElementById('mobile-overlay');
            const panel = document.getElementById('mobile-panel');
            const btn = document.getElementById('course-btn');
            
            mobileCoursesOpen = false;
            overlay.classList.remove('active');
            panel.classList.remove('active');
            btn.classList.remove('active');
        }

        // 全螢幕切換
        function toggleFullscreen() {
            const panel = document.getElementById('tree-panel');
            const btn = document.getElementById('fullscreen-btn');
            const canvas = document.getElementById('stellar-bg');
            const container = document.querySelector('.container');

            if (panel.classList.contains('fullscreen')) {
                // 退出全螢幕
                panel.classList.remove('fullscreen');
                document.body.classList.remove('fullscreen-mode');
                btn.innerHTML = '⛶';
                // 把 canvas 移回 container
                container.insertBefore(canvas, container.firstChild);
                showShortcutHint('退出全螢幕');
            } else {
                // 進入全螢幕
                panel.classList.add('fullscreen');
                document.body.classList.add('fullscreen-mode');
                btn.innerHTML = '✕';
                // 把 canvas 移到 tree-panel 內部最前面
                panel.insertBefore(canvas, panel.firstChild);
                showShortcutHint('全螢幕模式');
            }
            // v1.13.0: 按下時的 bounce 動畫，視覺更明顯
            btn.classList.remove('toggling');
            void btn.offsetWidth;
            btn.classList.add('toggling');
            setTimeout(() => btn.classList.remove('toggling'), 450);
        }

        // 課程架構數據
        function getTreeData() {
            let additionalCredits = 0;
            let peCredits = 0;
            let mathCoreCredits = 0;
            let csCoreCredits = 0;
            let hardwareCredits = 0;
            let multimediaCredits = 0;
            let projectCredits = 0;
            let deptElectiveCredits = 0;

            simulatedCourses.forEach(courseName => {
                const course = currentSemesterCourses.find(c => c.name === courseName);
                if (course) {
                    additionalCredits += course.credits;
                    if (course.type === 'pe') peCredits += course.credits;
                    if (course.type === 'math_core') mathCoreCredits += course.credits;
                    if (course.type === 'cs_core') csCoreCredits += course.credits;
                    if (course.type === 'hardware') hardwareCredits += course.credits;
                    if (course.type === 'multimedia') multimediaCredits += course.credits;
                    if (course.type === 'project') projectCredits += course.credits;
                    if (course.type === 'dept_elective') deptElectiveCredits += course.credits;
                }
            });

            // 114-1 結束 base: 博雅 18 (人文4+社會6+自然6+邏輯運算2)、跨域 4 (運算思維+奈米科技)
            const totalPe = 3 + peCredits;
            const totalGeneral = 18;
            const totalInterdisciplinary = 4;
            const totalGeneralEducation = totalGeneral + totalInterdisciplinary;
            const extraGeneralCredits = Math.max(0, totalGeneralEducation - 18);
            const totalFieldElective = 18 + hardwareCredits + multimediaCredits;
            const totalDeptElective = 7 + deptElectiveCredits;
            
            return {
                name: "畢業總學分",
                credits: 128,
                earned: 94 + additionalCredits,
                children: [
                    {
                        name: "一、校共同必修",
                        credits: 32,
                        earned: 31 + peCredits,
                        children: [
                            {
                                name: "中文",
                                credits: 4,
                                earned: 4,
                                courses: [
                                    {name: "中文閱讀與思辨", grade: "A-", semester: "112-1", credits: 2, completed: true},
                                    {name: "中文寫作與表達", grade: "A", semester: "112-2", credits: 2, completed: true}
                                ]
                            },
                            {
                                name: "英文",
                                credits: 6,
                                earned: 6,
                                courses: [
                                    {name: "英文（一）、（二）、（三）", grade: "抵免", credits: 6, completed: true}
                                ]
                            },
                            {
                                name: "通識課程",
                                credits: 18,
                                earned: Math.min(18, totalGeneralEducation),
                                children: [
                                    {
                                        name: "博雅課程",
                                        credits: 14,
                                        earned: Math.min(14, totalGeneral),
                                        courses: [
                                            {name: "亞裔美國文學", grade: "A-", semester: "112-2", credits: 2, completed: true},
                                            {name: "科技與社會", grade: "A-", semester: "112-1", credits: 2, completed: true},
                                            {name: "環境與傳播", grade: "A+", semester: "112-1", credits: 2, completed: true},
                                            {name: "科技與人文的對話", grade: "A-", semester: "113-1", credits: 2, completed: true},
                                            {name: "多元文化", grade: "A+", semester: "113-暑", credits: 2, completed: true},
                                            {name: "資料科學與程式設計", grade: "A+", semester: "113-暑", credits: 2, completed: true},
                                            {name: "個人投資理財", grade: "B+", semester: "111-1", credits: 2, completed: true},
                                            {name: "女性文學、性別平等理論與婦運", grade: "A-", semester: "114-1", credits: 2, completed: true},
                                            {name: "宇宙中的生命與太空環境", grade: "A", semester: "114-1", credits: 2, completed: true}
                                        ]
                                    },
                                    {
                                        name: "跨域探索",
                                        credits: 4,
                                        earned: Math.min(4, totalInterdisciplinary),
                                        courses: [
                                            {name: "運算思維與程式設計", grade: "C", semester: "113-2", credits: 2, completed: true},
                                            {name: "奈米科技", grade: "A+", semester: "114-1", credits: 2, completed: true}
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "體育",
                                credits: 4,
                                earned: totalPe,
                                courses: [
                                    {name: "體育（現代舞初級）", grade: "A-", semester: "112-1", credits: 1, completed: true},
                                    {name: "體育（籃球初級）", grade: "A+", semester: "113-2", credits: 1, completed: true},
                                    {name: "體育（羽球初級）", grade: "A-", semester: "114-1", credits: 1, completed: true},
                                    simulatedCourses.has("體育（籃球初級）") ? {name: "體育（籃球初級）", credits: 1, completed: true, isNew: true, semester: "114-2"} : {name: "體育（籃球初級）", credits: 1, note: "114-2修課中"},
                                    totalPe >= 4 ? null : {name: "還需修習", credits: 4 - totalPe}
                                ].filter(Boolean)
                            }
                        ]
                    },
                    {
                        name: "二、系必修（資訊課程）",
                        credits: 15,
                        earned: 9 + csCoreCredits,
                        courses: [
                            {name: "程式設計（一）", grade: "C-", semester: "112-1", credits: 3, completed: true},
                            {name: "程式設計（二）", grade: "C+", semester: "112-2", credits: 3, completed: true},
                            {name: "資料結構", grade: "C", semester: "113-1", credits: 3, completed: true},
                            simulatedCourses.has("演算法") ? {name: "演算法", credits: 3, completed: true, isNew: true} : {name: "演算法", credits: 3, note: "114-2修課中"},
                            simulatedCourses.has("計算機結構") ? {name: "計算機結構", credits: 3, completed: true, isNew: true} : {name: "計算機結構", credits: 3, note: "114-2修課中"}
                        ]
                    },
                    {
                        name: "三、系選修",
                        credits: 54,
                        earned: 34 + mathCoreCredits + hardwareCredits + multimediaCredits + projectCredits + deptElectiveCredits,
                        children: [
                            {
                                name: "數學必選修",
                                credits: 12,
                                earned: 9 + mathCoreCredits,
                                courses: [
                                    {name: "微積分乙（一）", grade: "C-", semester: "111-1", credits: 3, completed: true},
                                    simulatedCourses.has("離散數學") ? {name: "離散數學", credits: 3, completed: true, isNew: true} : {name: "離散數學", credits: 3, note: "114-2修課中"},
                                    {name: "機率論", grade: "C", semester: "112-1", credits: 3, completed: true},
                                    {name: "線性代數", grade: "C-", semester: "113-1", credits: 3, completed: true}
                                ]
                            },
                            {
                                name: "資訊專題必選修",
                                credits: 6,
                                earned: projectCredits,
                                note: "4選2",
                                courses: [
                                    {name: "資訊專題研究（一）：資訊理論", credits: 3, available: true},
                                    {name: "資訊專題研究（一）：資訊系統", credits: 3, note: "114-1 未通過"},
                                    {name: "資訊專題研究（二）：資訊理論", credits: 3, available: true},
                                    simulatedCourses.has("資訊專題研究（二）：資訊系統") ? {name: "資訊專題研究（二）：資訊系統", credits: 3, completed: true, isNew: true} : {name: "資訊專題研究（二）：資訊系統", credits: 3, note: "114-2修課中"}
                                ]
                            },
                            {
                                name: "領域選修",
                                credits: 30,
                                earned: totalFieldElective,
                                note: "每領域≥3學分",
                                children: [
                                    {
                                        name: "資訊理論領域",
                                        credits: 3,
                                        earned: 6,
                                        courses: [
                                            {name: "程式語言結構", grade: "C+", semester: "113-2", credits: 3, completed: true},
                                            {name: "資料庫理論", grade: "C", semester: "113-2", credits: 3, completed: true},
                                            {name: "計算機概論", credits: 3, available: true},
                                            {name: "物件導向分析與設計", credits: 3, available: true},
                                            {name: "自動機理論與正規語言", credits: 3, available: true}
                                        ]
                                    },
                                    {
                                        name: "資訊硬體領域",
                                        credits: 3,
                                        earned: 3 + hardwareCredits,
                                        courses: [
                                            {name: "類比數位運算元件（基礎電子學）", grade: "B+", semester: "112-1", credits: 3, completed: true},
                                            simulatedCourses.has("數位邏輯") ? {name: "數位邏輯", credits: 3, completed: true, isNew: true} : {name: "數位邏輯", credits: 3, note: "114-2修課中"},
                                            {name: "組合語言", credits: 3, available: true},
                                            {name: "電腦輔助VLSI設計", credits: 3, available: true}
                                        ]
                                    },
                                    {
                                        name: "資訊系統領域",
                                        credits: 3,
                                        earned: 3,
                                        courses: [
                                            {name: "系統程式", grade: "C", semester: "114-1", credits: 3, completed: true},
                                            {name: "軟體工程", credits: 3, available: true},
                                            {name: "資訊安全", credits: 3, available: true},
                                            {name: "作業系統", credits: 3, available: true},
                                            {name: "編譯系統設計", credits: 3, available: true}
                                        ]
                                    },
                                    {
                                        name: "電腦網路領域",
                                        credits: 3,
                                        earned: 3,
                                        courses: [
                                            {name: "區域性網路", grade: "C-", semester: "113-1", credits: 3, completed: true},
                                            {name: "計算機網路", credits: 3, available: true},
                                            {name: "資料通訊", credits: 3, available: true},
                                            {name: "無線通訊", credits: 3, available: true}
                                        ]
                                    },
                                    {
                                        name: "多媒體處理領域",
                                        credits: 3,
                                        earned: 3 + multimediaCredits,
                                        courses: [
                                            {name: "資料探勘", grade: "C+", semester: "114-1", credits: 3, completed: true},
                                            simulatedCourses.has("計算機圖學") ? {name: "計算機圖學", credits: 3, completed: true, isNew: true} : {name: "計算機圖學", credits: 3, note: "114-2修課中"},
                                            simulatedCourses.has("影像處理") ? {name: "影像處理", credits: 3, completed: true, isNew: true} : {name: "影像處理", credits: 3, note: "114-2修課中"},
                                            {name: "人工智慧", credits: 3, available: true}
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "系選修",
                                credits: 6,
                                earned: totalDeptElective,
                                courses: [
                                    {name: "類比數位運算元件實驗", grade: "A-", semester: "112-1", credits: 1, completed: true},
                                    {name: "網路計算與XML", grade: "B", semester: "114-1", credits: 3, completed: true},
                                    {name: "語音處理", grade: "A-", semester: "114-1", credits: 3, completed: true},
                                    simulatedCourses.has("資安攻防演練") ? {name: "資安攻防演練", credits: 3, completed: true, isNew: true} : {name: "資安攻防演練", credits: 3, note: "114-2修課中"},
                                    {name: "數值方法", credits: 3, available: true},
                                    {name: "工程數學", credits: 3, available: true},
                                    {name: "數理統計", credits: 3, available: true},
                                    {name: "函數語言程式設計", credits: 3, available: true},
                                    {name: "進階程式設計", credits: 3, available: true}
                                ]
                            }
                        ]
                    },
                    {
                        name: "四、自由選修",
                        credits: 27,
                        earned: 16 + extraGeneralCredits,
                        courses: [
                            {name: "大數據分析導論", grade: "A-", semester: "111-1", credits: 3, completed: true},
                            {name: "核天文物理介紹", grade: "B", semester: "111-1", credits: 2, completed: true},
                            {name: "中英筆譯（二）", grade: "B-", semester: "111-1", credits: 3, completed: true},
                            {name: "組織心理學", grade: "A", semester: "113-暑", credits: 2, completed: true},
                            {name: "自我覺察與成長", grade: "A", semester: "113-暑", credits: 2, completed: true},
                            {name: "數學產業實習", grade: "A", semester: "112-2", credits: 2, completed: true},
                            {name: "英語文職場實習", grade: "A+", semester: "112-2", credits: 2, completed: true},
                            extraGeneralCredits > 0 ? {name: "通識超修學分", credits: extraGeneralCredits, completed: true, isNew: true, detail: "博雅或跨域超過18學分的部分"} : null,
                            16 + extraGeneralCredits >= 27 ? null : {name: "還需選修", credits: 27 - 16 - extraGeneralCredits}
                        ].filter(Boolean)
                    }
                ]
            };
        }

        // 渲染課程
        function renderCurrentCourses() {
            const desktopContainer = document.getElementById('current-courses');
            const mobileContainer = document.getElementById('mobile-courses');
            
            const createCourseItem = (course, isMobile = false) => {
                const div = document.createElement('div');
                div.className = 'course-item-sim' + (isMobile ? ' mobile-course-item' : '');
                if (simulatedCourses.has(course.name)) {
                    div.classList.add('selected');
                }
                
                div.onclick = (e) => {
                    if (e.target.type !== 'checkbox') {
                        toggleCourse(course.name);
                    }
                };
                
                div.innerHTML = `
                    <input type="checkbox" ${simulatedCourses.has(course.name) ? 'checked' : ''} 
                           onchange="toggleCourse('${course.name}')">
                    <span class="course-name-sim">${course.name}</span>
                    <span class="course-credits-sim">${course.credits}學分</span>
                `;
                
                return div;
            };
            
            desktopContainer.innerHTML = '';
            mobileContainer.innerHTML = '';
            
            currentSemesterCourses.forEach(course => {
                desktopContainer.appendChild(createCourseItem(course, false));
                mobileContainer.appendChild(createCourseItem(course, true));
            });
        }

        // 切換課程選擇
        function toggleCourse(courseName) {
            if (simulatedCourses.has(courseName)) {
                simulatedCourses.delete(courseName);
            } else {
                simulatedCourses.add(courseName);
            }
            renderCurrentCourses();
            updateSelectAllBtnState();
            updateTreeRealtime();
        }

        function toggleAllCourses() {
            const allSelected = simulatedCourses.size === currentSemesterCourses.length;
            if (allSelected) {
                simulatedCourses.clear();
            } else {
                currentSemesterCourses.forEach(c => simulatedCourses.add(c.name));
            }
            renderCurrentCourses();
            updateSelectAllBtnState();
            updateTreeRealtime();
            // v1.12.0: bounce animation pulse on toggle for more obvious feedback
            ['select-all-btn', 'mobile-select-all-btn'].forEach(id => {
                const btn = document.getElementById(id);
                if (!btn) return;
                btn.classList.remove('toggling');
                void btn.offsetWidth; // force reflow so animation restarts
                btn.classList.add('toggling');
                setTimeout(() => btn.classList.remove('toggling'), 450);
            });
        }

        function updateSelectAllBtnState() {
            const allSelected = simulatedCourses.size === currentSemesterCourses.length;
            const text = allSelected ? '取消全選' : '全選';
            ['select-all-btn', 'mobile-select-all-btn'].forEach(id => {
                const btn = document.getElementById(id);
                if (!btn) return;
                btn.textContent = text;
                btn.classList.toggle('selected', allSelected);
            });
        }

        // ===== Changelog =====
        // 'theme' 標記：只有引入新視覺風格的版本才有切換按鈕
        // 後續若有純 CSS 視覺改動的版本，加上 theme: '<theme-id>' 即可
        // Markup: **bold**、__underline__、*italic*（renderMarkup 解析）
        const CHANGELOG = [
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

        let changelogOpen = false;

        function openChangelog() {
            renderChangelog();
            document.getElementById('changelog-overlay').classList.add('active');
            document.getElementById('changelog-modal').classList.add('active');
            changelogOpen = true;
        }

        function closeChangelog() {
            document.getElementById('changelog-overlay').classList.remove('active');
            document.getElementById('changelog-modal').classList.remove('active');
            changelogOpen = false;
        }

        // v1.16.0: Markdown-lite parser for changelog entries
        // Supports **bold**, __underline__, *italic*. Nested tags not supported.
        function renderMarkup(text, container) {
            let i = 0;
            const markers = ['**', '__', '*'];
            while (i < text.length) {
                let matched = false;
                // Try **bold** first (must come before *italic*)
                if (text.startsWith('**', i)) {
                    const end = text.indexOf('**', i + 2);
                    if (end !== -1) {
                        const el = document.createElement('strong');
                        el.textContent = text.substring(i + 2, end);
                        container.appendChild(el);
                        i = end + 2;
                        matched = true;
                    }
                }
                // Try __underline__
                if (!matched && text.startsWith('__', i)) {
                    const end = text.indexOf('__', i + 2);
                    if (end !== -1) {
                        const el = document.createElement('u');
                        el.textContent = text.substring(i + 2, end);
                        container.appendChild(el);
                        i = end + 2;
                        matched = true;
                    }
                }
                // Try *italic* (single asterisk, not part of **)
                if (!matched && text[i] === '*' && text[i + 1] !== '*') {
                    const end = text.indexOf('*', i + 1);
                    if (end !== -1) {
                        const el = document.createElement('em');
                        el.textContent = text.substring(i + 1, end);
                        container.appendChild(el);
                        i = end + 1;
                        matched = true;
                    }
                }
                if (!matched) {
                    // Plain text until next marker
                    let nextMarker = text.length;
                    for (const m of markers) {
                        const idx = text.indexOf(m, i + 1);
                        if (idx !== -1 && idx < nextMarker) nextMarker = idx;
                    }
                    if (nextMarker > i) {
                        container.appendChild(document.createTextNode(text.substring(i, nextMarker)));
                        i = nextMarker;
                    } else {
                        // Defensive: advance one char
                        container.appendChild(document.createTextNode(text[i]));
                        i++;
                    }
                }
            }
        }

        function renderChangelog() {
            const container = document.getElementById('changelog-content');
            container.textContent = '';
            const activeTheme = getCurrentTheme();

            CHANGELOG.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'changelog-entry';

                const versionRow = document.createElement('div');
                versionRow.className = 'changelog-version-row';

                const verSpan = document.createElement('span');
                verSpan.className = 'changelog-version';
                verSpan.textContent = entry.version;

                const dateSpan = document.createElement('span');
                dateSpan.className = 'changelog-date';
                dateSpan.textContent = entry.date;

                const tagSpan = document.createElement('span');
                tagSpan.className = 'changelog-tag ' + entry.type;
                tagSpan.textContent = entry.type.toUpperCase();

                versionRow.append(verSpan, dateSpan, tagSpan);

                const ul = document.createElement('ul');
                ul.className = 'changelog-list';
                entry.changes.forEach(c => {
                    const li = document.createElement('li');
                    renderMarkup(c, li);
                    ul.appendChild(li);
                });

                entryDiv.append(versionRow, ul);

                // 只有引入新視覺風格的版本顯示切換按鈕
                if (entry.theme) {
                    const btn = document.createElement('button');
                    btn.className = 'theme-switch-btn';
                    const isActive = entry.theme === activeTheme;
                    btn.textContent = isActive ? '📍 已套用此樣式' : '切換到此樣式 →';
                    if (isActive) btn.classList.add('active');
                    btn.onclick = () => {
                        setTheme(entry.theme);
                        renderChangelog();
                    };
                    entryDiv.appendChild(btn);
                    const clearDiv = document.createElement('div');
                    clearDiv.style.clear = 'both';
                    entryDiv.appendChild(clearDiv);
                }

                container.appendChild(entryDiv);
            });
        }

        // ===== v1.11.0: Theme Switching =====
        function getCurrentTheme() {
            return localStorage.getItem('course-theme') || 'current';
        }

        function setTheme(themeName) {
            document.body.classList.remove('theme-classic', 'theme-v1-10');
            if (themeName === 'classic') {
                document.body.classList.add('theme-classic');
            } else if (themeName === 'v1-10') {
                document.body.classList.add('theme-v1-10');
            }
            localStorage.setItem('course-theme', themeName);
        }

        // ===== v1.17.0: Font Size Slider (replaces v1.16 cycle button) =====
        const FONT_ZOOM_MIN = 0.85;
        const FONT_ZOOM_MAX = 1.35;

        function setFontZoom(zoom) {
            zoom = Math.max(FONT_ZOOM_MIN, Math.min(FONT_ZOOM_MAX, zoom));
            document.body.style.zoom = zoom;
            localStorage.setItem('font-zoom', String(zoom));
            const slider = document.getElementById('font-size-slider');
            if (slider) {
                if (parseFloat(slider.value) !== zoom) slider.value = zoom;
                const fillPct = ((zoom - FONT_ZOOM_MIN) / (FONT_ZOOM_MAX - FONT_ZOOM_MIN)) * 100;
                slider.style.setProperty('--slider-fill', fillPct + '%');
            }
        }

        function initFontSize() {
            const saved = parseFloat(localStorage.getItem('font-zoom'));
            const zoom = (Number.isFinite(saved) && saved >= FONT_ZOOM_MIN && saved <= FONT_ZOOM_MAX) ? saved : 1.0;
            setFontZoom(zoom);
        }

        function initTheme() {
            setTheme(getCurrentTheme());
        }

        // 實時更新
        function updateTreeRealtime() {
            let additionalCredits = 0;
            simulatedCourses.forEach(courseName => {
                const course = currentSemesterCourses.find(c => c.name === courseName);
                if (course) additionalCredits += course.credits;
            });
            
            const newTotal = 94 + additionalCredits;
            const newPercentage = (newTotal / 128 * 100).toFixed(1);
            const newRemaining = 128 - newTotal;
            
            document.querySelectorAll('.stat-item').forEach(item => item.classList.add('highlight'));
            setTimeout(() => {
                document.querySelectorAll('.stat-item').forEach(item => item.classList.remove('highlight'));
            }, 500);
            
            animateNumber('total-earned', currentEarned, newTotal, 600);
            animateNumber('remaining', currentRemaining, newRemaining, 600);
            animatePercentage('completion', currentPercentage, parseFloat(newPercentage), 600);

            // v1.13.0: progress-bar 元素已移除（user 不再要這個視覺）
            currentEarned = newTotal;
            currentRemaining = newRemaining;
            currentPercentage = parseFloat(newPercentage);
            
            setTimeout(() => {
                const treeRoot = document.getElementById('tree-root');
                walkUpdate(treeRoot, getTreeData());
            }, 100);
        }

        function animateNumber(id, start, end, duration) {
            const element = document.getElementById(id);
            const range = end - start;
            const startTime = performance.now();
            
            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(start + range * eased);
                element.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }
            
            requestAnimationFrame(update);
        }

        function animatePercentage(id, start, end, duration) {
            const element = document.getElementById(id);
            const range = end - start;
            const startTime = performance.now();
            
            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = start + range * eased;
                element.textContent = current.toFixed(1) + '%';
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }
            
            requestAnimationFrame(update);
        }

        function calculateStatus(node) {
            if (node.children) {
                node.children.forEach(child => calculateStatus(child));
            }
            
            const earned = node.earned || 0;
            const required = node.credits || 0;
            
            if (earned === 0) {
                node.status = 'incomplete';
            } else if (earned >= required) {
                node.status = 'completed';
            } else {
                node.status = 'partial';
            }
        }

        function shouldAutoExpand(node) {
            return node.status === 'incomplete' || node.status === 'partial';
        }

        // 切換已修課程展開
        function toggleCompletedCourses(summaryEl) {
            const listEl = summaryEl.nextElementSibling;
            const toggleIcon = summaryEl.querySelector('.completed-summary-toggle');

            listEl.classList.toggle('show');
            toggleIcon.classList.toggle('expanded');
        }

        function buildCourseDetail(course, variant) {
            const courseDiv = document.createElement('div');
            courseDiv.className = 'course-detail' + (variant === 'completed' ? ' completed'
                                                  : variant === 'new' ? ' new'
                                                  : variant === 'available' ? ' available' : '');
            if (variant === 'incomplete') {
                courseDiv.style.background = 'linear-gradient(135deg, #fee2e2, #fecaca)';
                courseDiv.style.borderLeftColor = '#ef4444';
            }

            const nameSpan = document.createElement('span');
            nameSpan.textContent = course.name;
            courseDiv.appendChild(nameSpan);

            if (variant === 'available') {
                const creditsSpan = document.createElement('span');
                creditsSpan.textContent = `${course.credits}學分`;
                courseDiv.appendChild(creditsSpan);
                return courseDiv;
            }

            const info = document.createElement('div');
            info.className = 'course-info';

            const creditsSpan = document.createElement('span');
            creditsSpan.textContent = `${course.credits}學分`;
            info.appendChild(creditsSpan);

            if (course.grade) {
                const gradeTag = document.createElement('span');
                gradeTag.className = 'course-tag tag-grade';
                gradeTag.textContent = course.grade;
                info.appendChild(gradeTag);
            }
            if (course.semester) {
                const semTag = document.createElement('span');
                semTag.className = 'course-tag tag-semester';
                semTag.textContent = course.semester;
                info.appendChild(semTag);
            }
            if (variant === 'new') {
                const newTag = document.createElement('span');
                newTag.className = 'course-tag tag-new';
                newTag.textContent = 'NEW';
                info.appendChild(newTag);
            }
            if (course.note && variant === 'incomplete') {
                const noteTag = document.createElement('span');
                noteTag.className = 'course-tag';
                noteTag.style.background = '#fef3c7';
                noteTag.style.color = '#92400e';
                noteTag.textContent = course.note;
                info.appendChild(noteTag);
            }
            courseDiv.appendChild(info);

            if (course.detail && variant === 'new') {
                const detailDiv = document.createElement('div');
                detailDiv.style.cssText = 'font-size:11px;color:#6b7280;margin-top:4px;';
                detailDiv.textContent = course.detail;
                courseDiv.appendChild(detailDiv);
            }

            return courseDiv;
        }

        // v1.17.0: compute sections as data，supports diff-update with expand/collapse animation
        function computeSections(node) {
            const completed = node.courses.filter(c => c.completed && !c.isNew);
            const newCs = node.courses.filter(c => c.isNew);
            const available = node.courses.filter(c => c.available);
            const incomplete = node.courses.filter(c => !c.completed && !c.available);

            const sections = [];
            if (completed.length > 0) sections.push({ key: 'completed', courses: completed });
            if (newCs.length > 0) sections.push({ key: 'new', courses: newCs });
            if (incomplete.length > 0) {
                const isCurrentSem = incomplete.some(c => c.note && c.note.includes('114-2'));
                sections.push({ key: isCurrentSem ? 'current-sem' : 'incomplete', courses: incomplete });
            }
            if (available.length > 0) sections.push({ key: 'available', courses: available });
            return sections;
        }

        function populateSectionInner(inner, section) {
            inner.textContent = '';
            if (section.key === 'completed') {
                const summaryDiv = document.createElement('div');
                summaryDiv.className = 'completed-summary';
                summaryDiv.onclick = () => toggleCompletedCourses(summaryDiv);
                const summaryText = document.createElement('span');
                summaryText.className = 'completed-summary-text';
                summaryText.textContent = `✓ 已修 ${section.courses.length} 門課程`;
                summaryDiv.appendChild(summaryText);
                const summaryToggle = document.createElement('span');
                summaryToggle.className = 'completed-summary-toggle';
                summaryToggle.textContent = '▼';
                summaryDiv.appendChild(summaryToggle);
                inner.appendChild(summaryDiv);

                const listDiv = document.createElement('div');
                listDiv.className = 'completed-courses-list';
                const listInner = document.createElement('div');
                listInner.className = 'completed-courses-inner';
                section.courses.forEach(course => {
                    listInner.appendChild(buildCourseDetail(course, 'completed'));
                });
                listDiv.appendChild(listInner);
                inner.appendChild(listDiv);
            } else {
                const headerText = {
                    'new': '✨ 新增課程',
                    'current-sem': '📝 本學期修課中',
                    'incomplete': '✗ 還需修習',
                    'available': '💡 可選課程'
                }[section.key];
                const headerLi = document.createElement('li');
                headerLi.className = 'section-header';
                headerLi.textContent = headerText;
                inner.appendChild(headerLi);

                const variant = section.key === 'new' ? 'new'
                              : section.key === 'available' ? 'available'
                              : 'incomplete';
                section.courses.forEach(course => {
                    const courseLi = document.createElement('li');
                    courseLi.appendChild(buildCourseDetail(course, variant));
                    inner.appendChild(courseLi);
                });
            }
        }

        function createCourseSection(section) {
            const div = document.createElement('div');
            div.className = 'course-section';
            div.dataset.sectionKey = section.key;
            const inner = document.createElement('div');
            inner.className = 'course-section-inner';
            populateSectionInner(inner, section);
            div.appendChild(inner);
            return div;
        }

        function renderCourseList(node, innerDiv) {
            const sections = computeSections(node);
            sections.forEach(section => {
                const el = createCourseSection(section);
                el.classList.add('show'); // 初始 render 直接顯示，不跑進場動畫
                innerDiv.appendChild(el);
            });
        }

        // v1.17.0: walkUpdate 對 sections 做 diff-update（取代 innerDiv.textContent = '' + rebuild）
        // 新增 section → expand 動畫；移除 section → collapse 動畫；保留 section → 更新內容（snap）
        function syncCourseSections(innerDiv, newSections) {
            const existingMap = new Map();
            innerDiv.querySelectorAll(':scope > .course-section').forEach(el => {
                existingMap.set(el.dataset.sectionKey, el);
            });

            let prevEl = null;
            newSections.forEach(section => {
                let el = existingMap.get(section.key);
                if (el) {
                    // 已存在：更新內容，確保 .show
                    const inner = el.querySelector(':scope > .course-section-inner');
                    if (inner) populateSectionInner(inner, section);
                    el.classList.add('show');
                    existingMap.delete(section.key);
                    // 確保位置正確
                    const expectedAfter = prevEl ? prevEl.nextElementSibling : innerDiv.firstChild;
                    if (expectedAfter !== el) {
                        if (prevEl) prevEl.insertAdjacentElement('afterend', el);
                        else innerDiv.insertBefore(el, innerDiv.firstChild);
                    }
                } else {
                    // 新增：建立 + 插入正確位置 + 下一個 frame 加 .show 觸發 expand
                    el = createCourseSection(section);
                    if (prevEl) prevEl.insertAdjacentElement('afterend', el);
                    else innerDiv.insertBefore(el, innerDiv.firstChild);
                    requestAnimationFrame(() => el.classList.add('show'));
                }
                prevEl = el;
            });

            // 剩下的 existingMap 條目代表「應該移除的 section」→ collapse 動畫後 remove
            existingMap.forEach(el => {
                el.classList.remove('show');
                setTimeout(() => { if (el.parentNode) el.remove(); }, 420);
            });
        }

        function renderTree(node, parentElement, level = 0, isSimulation = false, parentPath = '') {
            const nodeKey = parentPath ? `${parentPath}/${node.name}` : node.name;
            const li = document.createElement('li');
            li.className = 'tree-node';
            li.dataset.nodeKey = nodeKey;
            
            const content = document.createElement('div');
            content.className = 'node-content';
            
            calculateStatus(node);
            
            const icon = document.createElement('div');
            icon.className = `node-icon status-${node.status}`;
            icon.textContent = node.status === 'completed' ? '✓' : 
                              node.status === 'partial' ? '⚠' : '✗';
            content.appendChild(icon);
            
            const label = document.createElement('div');
            label.className = 'node-label';
            label.textContent = node.name;
            content.appendChild(label);
            
            if (node.credits) {
                const credits = document.createElement('div');
                credits.className = 'node-credits';
                
                const earned = document.createElement('span');
                earned.className = 'credits-earned';
                earned.textContent = `${node.earned || 0}`;
                credits.appendChild(earned);
                
                const separator = document.createElement('span');
                separator.textContent = ' / ';
                separator.style.color = '#d1d5db';
                credits.appendChild(separator);
                
                const required = document.createElement('span');
                required.className = 'credits-required';
                required.textContent = `${node.credits}`;
                credits.appendChild(required);
                
                content.appendChild(credits);
            }
            
            if (node.note) {
                const badge = document.createElement('span');
                badge.className = `badge ${node.status === 'incomplete' ? 'badge-danger' : node.status === 'partial' ? 'badge-warning' : 'badge-info'}`;
                badge.textContent = node.note;
                content.appendChild(badge);
            }
            
            if (node.children || node.courses) {
                const toggle = document.createElement('div');
                toggle.className = 'toggle-icon';
                toggle.textContent = '▶';
                content.appendChild(toggle);
                
                content.onclick = (e) => {
                    e.stopPropagation();
                    const childrenEl = li.querySelector(':scope > .tree-children');
                    if (childrenEl) {
                        childrenEl.classList.toggle('show');
                        toggle.classList.toggle('expanded');
                    }
                };
            }
            
            li.appendChild(content);
            
            if (node.courses || node.children) {
                const childrenUl = document.createElement('ul');
                childrenUl.className = 'tree-children';
                
                // 內層包裝（用於grid動畫）
                const innerDiv = document.createElement('div');
                innerDiv.className = 'tree-children-inner';
                
                if (level === 0 || (isSimulation && shouldAutoExpand(node))) {
                    childrenUl.classList.add('show');
                    content.querySelector('.toggle-icon')?.classList.add('expanded');
                }
                
                if (node.courses) {
                    renderCourseList(node, innerDiv);
                } else if (node.children) {
                    node.children.forEach(child => {
                        renderTree(child, innerDiv, level + 1, isSimulation, nodeKey);
                    });
                }
                
                childrenUl.appendChild(innerDiv);
                li.appendChild(childrenUl);
            }

            parentElement.appendChild(li);
        }

        function walkUpdate(treeRoot, newData) {
            const domMap = new Map();
            treeRoot.querySelectorAll('[data-node-key]').forEach(el => {
                domMap.set(el.dataset.nodeKey, el);
            });

            calculateStatus(newData);

            function visit(node, parentPath) {
                const nodeKey = parentPath ? `${parentPath}/${node.name}` : node.name;
                const li = domMap.get(nodeKey);
                if (!li) return;

                // status icon
                const icon = li.querySelector(':scope > .node-content > .node-icon');
                if (icon) {
                    icon.className = `node-icon status-${node.status}`;
                    icon.textContent = node.status === 'completed' ? '✓'
                                     : node.status === 'partial' ? '⚠' : '✗';
                }

                // credits text
                const credits = li.querySelector(':scope > .node-content > .node-credits');
                if (credits && node.credits) {
                    const earnedSpan = credits.querySelector('.credits-earned');
                    const requiredSpan = credits.querySelector('.credits-required');
                    if (earnedSpan) earnedSpan.textContent = `${node.earned || 0}`;
                    if (requiredSpan) requiredSpan.textContent = `${node.credits}`;
                }

                // badge — add/update/remove
                const content = li.querySelector(':scope > .node-content');
                let badge = content?.querySelector(':scope > .badge');
                if (node.note) {
                    const badgeClass = `badge ${node.status === 'incomplete' ? 'badge-danger' : node.status === 'partial' ? 'badge-warning' : 'badge-info'}`;
                    if (!badge) {
                        badge = document.createElement('span');
                        const toggle = content.querySelector(':scope > .toggle-icon');
                        content.insertBefore(badge, toggle || null);
                    }
                    badge.className = badgeClass;
                    badge.textContent = node.note;
                } else if (badge) {
                    badge.remove();
                }

                // .show class + toggle-icon expanded — fires CSS transition
                const childrenUl = li.querySelector(':scope > .tree-children');
                const toggleIcon = li.querySelector(':scope > .node-content > .toggle-icon');
                if (childrenUl) {
                    const isRoot = !parentPath;
                    const shouldShow = isRoot || shouldAutoExpand(node);
                    childrenUl.classList.toggle('show', shouldShow);
                    if (toggleIcon) toggleIcon.classList.toggle('expanded', shouldShow);
                }

                // v1.17.0: leaf with courses — diff-update sections (expand/collapse animation)
                if (node.courses && childrenUl) {
                    const innerDiv = childrenUl.querySelector(':scope > .tree-children-inner');
                    if (innerDiv) {
                        syncCourseSections(innerDiv, computeSections(node));
                    }
                }

                // recurse
                if (node.children) {
                    node.children.forEach(child => visit(child, nodeKey));
                }
            }

            visit(newData, '');
        }

        // 初始化
        initTheme();
        initFontSize();
        renderCurrentCourses();
        const treeRoot = document.getElementById('tree-root');
        const initialTree = getTreeData();
        renderTree(initialTree, treeRoot, 0, true);
        
        // ===== 星星網絡背景動畫 =====
        (function initStellarBackground() {
            const canvas = document.getElementById('stellar-bg');
            const ctx = canvas.getContext('2d');
            
            let width, height;
            let stars = [];
            let shootingStars = [];
            let ripples = [];
            let mouse = { x: null, y: null };
            let time = 0;
            
            // 星星顏色調色盤
            const starColors = [
                { r: 102, g: 126, b: 234 },  // 主紫藍
                { r: 118, g: 75, b: 162 },   // 深紫
                { r: 147, g: 197, b: 253 },  // 淡藍
                { r: 196, g: 181, b: 253 },  // 淡紫
                { r: 165, g: 180, b: 252 },  // 靛藍
            ];
            
            const config = {
                // v1.12.0: starCount 130 → 143 (+10%)；亮度 +20% 由 #stellar-bg opacity 0.7 → 0.84 提供
                starCount: 143,
                minStarSize: 0.6,
                maxStarSize: 4,
                connectionDistance: 150,
                mouseRadius: 200,
                baseSpeed: 0.15,
                shootingStarInterval: 12000,
                shootingStarChance: 0.4,
            };
            
            function resize() {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            }
            
            function createStars() {
                stars = [];
                for (let i = 0; i < config.starCount; i++) {
                    const sizeRandom = Math.random();
                    let size;
                    if (sizeRandom < 0.6) {
                        size = config.minStarSize + Math.random() * 1;
                    } else if (sizeRandom < 0.9) {
                        size = 1.5 + Math.random() * 1.5;
                    } else {
                        size = 2.5 + Math.random() * (config.maxStarSize - 2.5);
                    }
                    
                    const depthFactor = size / config.maxStarSize;
                    const speed = config.baseSpeed * (0.3 + depthFactor * 0.7);
                    const color = starColors[Math.floor(Math.random() * starColors.length)];
                    
                    stars.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        vx: (Math.random() - 0.5) * speed,
                        vy: (Math.random() - 0.5) * speed,
                        size: size,
                        baseOpacity: size > 2.5 ? 0.4 + Math.random() * 0.2 : 0.5 + Math.random() * 0.4,
                        color: color,
                        twinkleSpeed: 0.02 + Math.random() * 0.03,
                        twinklePhase: Math.random() * Math.PI * 2,
                        twinkleAmount: 0.2 + Math.random() * 0.3,
                    });
                }
            }
            
            function createShootingStar() {
                if (Math.random() > config.shootingStarChance) return;
                const startX = Math.random() * width * 0.7;
                const startY = Math.random() * height * 0.3;
                const angle = Math.PI / 6 + Math.random() * Math.PI / 6;
                const speed = 8 + Math.random() * 6;
                shootingStars.push({
                    x: startX, y: startY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1, decay: 0.015 + Math.random() * 0.01,
                    length: 80 + Math.random() * 60,
                    size: 1.5 + Math.random() * 1,
                });
            }
            
            function createRipple(x, y) {
                ripples.push({
                    x: x, y: y, radius: 0,
                    maxRadius: 150 + Math.random() * 100,
                    life: 1, decay: 0.02,
                });
            }
            
            function drawStar(star) {
                const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
                const opacity = star.baseOpacity + twinkle * star.twinkleAmount * star.baseOpacity;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${Math.max(0.1, opacity)})`;
                ctx.fill();
            }
            
            function drawShootingStar(star) {
                const gradient = ctx.createLinearGradient(
                    star.x, star.y,
                    star.x - star.vx * star.length / 10,
                    star.y - star.vy * star.length / 10
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${star.life * 0.9})`);
                gradient.addColorStop(0.3, `rgba(200, 210, 255, ${star.life * 0.6})`);
                gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x - star.vx * star.length / 10, star.y - star.vy * star.length / 10);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = star.size * star.life;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * star.life * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.life})`;
                ctx.fill();
            }
            
            function drawRipple(ripple) {
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(102, 126, 234, ${ripple.life * 0.3})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            function drawConnection(star1, star2, distance) {
                const opacity = 1 - (distance / config.connectionDistance);
                ctx.beginPath();
                ctx.moveTo(star1.x, star1.y);
                ctx.lineTo(star2.x, star2.y);
                ctx.strokeStyle = `rgba(102, 126, 234, ${opacity * 0.18})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
            
            function update() {
                time++;
                stars.forEach(star => {
                    star.x += star.vx;
                    star.y += star.vy;
                    if (star.x < 0 || star.x > width) star.vx *= -1;
                    if (star.y < 0 || star.y > height) star.vy *= -1;
                    if (mouse.x !== null && mouse.y !== null) {
                        const dx = mouse.x - star.x;
                        const dy = mouse.y - star.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < config.mouseRadius) {
                            const force = (config.mouseRadius - dist) / config.mouseRadius;
                            star.x -= dx * force * 0.015;
                            star.y -= dy * force * 0.015;
                        }
                    }
                    ripples.forEach(ripple => {
                        const dx = ripple.x - star.x;
                        const dy = ripple.y - star.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (Math.abs(dist - ripple.radius) < 30) {
                            const force = (1 - Math.abs(dist - ripple.radius) / 30) * ripple.life;
                            star.x -= dx / dist * force * 2;
                            star.y -= dy / dist * force * 2;
                        }
                    });
                });
                shootingStars.forEach(star => {
                    star.x += star.vx;
                    star.y += star.vy;
                    star.life -= star.decay;
                });
                shootingStars = shootingStars.filter(s => s.life > 0);
                ripples.forEach(ripple => {
                    ripple.radius += 4;
                    ripple.life -= ripple.decay;
                });
                ripples = ripples.filter(r => r.life > 0);
            }
            
            function draw() {
                ctx.clearRect(0, 0, width, height);
                for (let i = 0; i < stars.length; i++) {
                    for (let j = i + 1; j < stars.length; j++) {
                        const dx = stars[i].x - stars[j].x;
                        const dy = stars[i].y - stars[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < config.connectionDistance) {
                            drawConnection(stars[i], stars[j], distance);
                        }
                    }
                    if (mouse.x !== null && mouse.y !== null) {
                        const dx = stars[i].x - mouse.x;
                        const dy = stars[i].y - mouse.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < config.mouseRadius) {
                            ctx.beginPath();
                            ctx.moveTo(stars[i].x, stars[i].y);
                            ctx.lineTo(mouse.x, mouse.y);
                            const opacity = 1 - (distance / config.mouseRadius);
                            ctx.strokeStyle = `rgba(118, 75, 162, ${opacity * 0.25})`;
                            ctx.lineWidth = 0.8;
                            ctx.stroke();
                        }
                    }
                }
                ripples.forEach(drawRipple);
                stars.forEach(drawStar);
                shootingStars.forEach(drawShootingStar);
            }
            
            function animate() {
                update();
                draw();
                requestAnimationFrame(animate);
            }
            
            window.addEventListener('resize', () => { resize(); createStars(); });
            window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
            window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
            window.addEventListener('click', (e) => { createRipple(e.clientX, e.clientY); });
            setInterval(createShootingStar, config.shootingStarInterval);
            
            resize();
            createStars();
            animate();
            setTimeout(createShootingStar, 2000);
        })();

        // ===== v2.0.0: PWA — 註冊 service worker（離線快取 + 可安裝）=====
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').catch((err) => {
                    console.warn('Service worker 註冊失敗:', err);
                });
            });
        }
