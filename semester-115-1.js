// 2026-09-07 semester data refresh for the production PWA.
// The legacy app keeps its data inline; this file applies the latest transcript
// after app.js loads, without changing the v2 UI/interaction code.

(() => {
    const BASE_EARNED = 115;
    const GRADUATION_CREDITS = 128;
    const BASE_REMAINING = GRADUATION_CREDITS - BASE_EARNED;
    const BASE_PERCENTAGE = Number((BASE_EARNED / GRADUATION_CREDITS * 100).toFixed(1));

    // 115-1 timetable is not published yet, so the simulator intentionally starts empty.
    currentSemesterCourses.splice(0, currentSemesterCourses.length);
    simulatedCourses.clear();
    currentEarned = BASE_EARNED;
    currentRemaining = BASE_REMAINING;
    currentPercentage = BASE_PERCENTAGE;

    const originalGetTreeData = getTreeData;

    const findNode = (root, name) => {
        if (!root) return null;
        if (root.name === name) return root;
        if (!root.children) return null;
        for (const child of root.children) {
            const found = findNode(child, name);
            if (found) return found;
        }
        return null;
    };

    const replaceCourse = (node, predicate, replacement) => {
        if (!node?.courses) return;
        const index = node.courses.findIndex(predicate);
        if (index >= 0) node.courses.splice(index, 1, replacement);
        else node.courses.push(replacement);
    };

    const removeCourse = (node, predicate) => {
        if (!node?.courses) return;
        node.courses = node.courses.filter(course => !predicate(course));
    };

    getTreeData = function getTreeData1151() {
        const tree = originalGetTreeData();

        tree.earned = BASE_EARNED;

        const schoolRequired = findNode(tree, '一、校共同必修');
        if (schoolRequired) schoolRequired.earned = 32;

        const liberal = findNode(tree, '博雅課程');
        if (liberal) {
            liberal.earned = 14;
            if (!liberal.courses.some(c => c.name === '當代社會與文化關鍵議題')) {
                liberal.courses.push({
                    name: '當代社會與文化關鍵議題',
                    grade: 'A-',
                    semester: '114-暑',
                    credits: 2,
                    completed: true
                });
            }
        }

        const physicalEducation = findNode(tree, '體育');
        if (physicalEducation) {
            physicalEducation.earned = 4;
            replaceCourse(
                physicalEducation,
                c => c.name === '體育（籃球初級）' && c.note?.includes('114-2'),
                {
                    name: '體育（籃球初級）',
                    grade: 'C',
                    semester: '114-2',
                    credits: 1,
                    completed: true
                }
            );
            removeCourse(physicalEducation, c => c.name === '還需修習');
        }

        const csRequired = findNode(tree, '二、系必修（資訊課程）');
        if (csRequired) {
            csRequired.earned = 12;
            replaceCourse(
                csRequired,
                c => c.name === '演算法',
                {
                    name: '演算法',
                    grade: 'X',
                    semester: '114-2',
                    credits: 3,
                    note: '114-2 未通過'
                }
            );
            replaceCourse(
                csRequired,
                c => c.name === '計算機結構',
                {
                    name: '計算機結構',
                    grade: 'C',
                    semester: '114-2',
                    credits: 3,
                    completed: true
                }
            );
        }

        const deptElectives = findNode(tree, '三、系選修');
        if (deptElectives) deptElectives.earned = 46;

        const mathRequired = findNode(tree, '數學必選修');
        if (mathRequired) {
            mathRequired.earned = 12;
            replaceCourse(
                mathRequired,
                c => c.name === '離散數學',
                {
                    name: '離散數學',
                    grade: 'C-',
                    semester: '114-2',
                    credits: 3,
                    completed: true
                }
            );
        }

        const projectRequired = findNode(tree, '資訊專題必選修');
        if (projectRequired) {
            projectRequired.earned = 3;
            replaceCourse(
                projectRequired,
                c => c.name === '資訊專題研究（二）：資訊系統',
                {
                    name: '資訊專題研究（二）：資訊系統',
                    grade: 'B-',
                    semester: '114-2',
                    credits: 3,
                    completed: true
                }
            );
        }

        const fieldElectives = findNode(tree, '領域選修');
        if (fieldElectives) fieldElectives.earned = 24;

        const hardware = findNode(tree, '資訊硬體領域');
        if (hardware) {
            hardware.earned = 3;
            // 數位邏輯 114-2 為 E；此領域既有 3 學分已滿足，所以不把失敗課程列成「還需修習」。
            removeCourse(hardware, c => c.name === '數位邏輯');
        }

        const multimedia = findNode(tree, '多媒體處理領域');
        if (multimedia) {
            multimedia.earned = 9;
            replaceCourse(
                multimedia,
                c => c.name === '計算機圖學',
                {
                    name: '計算機圖學',
                    grade: 'B',
                    semester: '114-2',
                    credits: 3,
                    completed: true
                }
            );
            replaceCourse(
                multimedia,
                c => c.name === '影像處理',
                {
                    name: '影像處理',
                    grade: 'C+',
                    semester: '114-2',
                    credits: 3,
                    completed: true
                }
            );
        }

        const departmentElectiveLeaf = findNode(tree, '系選修');
        if (departmentElectiveLeaf) {
            departmentElectiveLeaf.earned = 7;
            // 資安攻防演練 114-2 為 D；系選修 6 學分門檻已達成，不把它列成畢業缺口。
            removeCourse(departmentElectiveLeaf, c => c.name === '資安攻防演練');
        }

        const freeElectives = findNode(tree, '四、自由選修');
        if (freeElectives) {
            freeElectives.earned = 25;
            const overflow = freeElectives.courses.find(c => c.name === '通識超修學分');
            if (overflow) overflow.credits = 6;
            if (!freeElectives.courses.some(c => c.name === '跨國企業經營策略')) {
                freeElectives.courses.push({
                    name: '跨國企業經營策略',
                    grade: 'A+',
                    semester: '114-暑',
                    credits: 3,
                    completed: true
                });
            }
            removeCourse(freeElectives, c => c.name === '還需選修');
            freeElectives.courses.push({ name: '還需選修', credits: 2 });
        }

        return tree;
    };

    // No current courses means no meaningful "select all" action.
    ['select-all-btn', 'mobile-select-all-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = 'none';
    });

    // Re-render the simulator and tree from the updated base data.
    renderCurrentCourses();
    const treeRoot1151 = document.getElementById('tree-root');
    treeRoot1151.textContent = '';
    renderTree(getTreeData(), treeRoot1151, 0, true);

    const earnedEl = document.getElementById('total-earned');
    const remainingEl = document.getElementById('remaining');
    const completionEl = document.getElementById('completion');
    if (earnedEl) earnedEl.textContent = String(BASE_EARNED);
    if (remainingEl) remainingEl.textContent = String(BASE_REMAINING);
    if (completionEl) completionEl.textContent = `${BASE_PERCENTAGE.toFixed(1)}%`;

    updateTreeRealtime = function updateTreeRealtime1151() {
        currentEarned = BASE_EARNED;
        currentRemaining = BASE_REMAINING;
        currentPercentage = BASE_PERCENTAGE;
        if (earnedEl) earnedEl.textContent = String(BASE_EARNED);
        if (remainingEl) remainingEl.textContent = String(BASE_REMAINING);
        if (completionEl) completionEl.textContent = `${BASE_PERCENTAGE.toFixed(1)}%`;

        const root = document.getElementById('tree-root');
        root.textContent = '';
        renderTree(getTreeData(), root, 0, true);
    };

    CHANGELOG.unshift({
        version: 'v2.1.0',
        date: '2026-09-07',
        type: 'minor',
        changes: [
            '**更新 114-2 最終成績**：通過體育、離散數學、計算機圖學、計算機結構、資訊專題（二）與影像處理；未通過資安攻防演練、數位邏輯、演算法',
            '**加入 114 暑修**：當代社會與文化關鍵議題 A-、跨國企業經營策略 A+',
            '**畢業學分進度更新**：已修 *94 → 115*、剩餘 *34 → 13*、完成度 *73.4% → 89.8%*',
            '**115-1 課表尚未公布**：本學期選課模擬清空，等課表出來再補'
        ]
    });
})();
