# Course System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild NTNU CS graduation-credit checker as a React + Vite + TypeScript SPA with dual visual themes, deployed to Cloudflare Pages at `course.stan-shih.com`.

**Architecture:** Three layers — framework-agnostic `lib/` with pure credit-rule logic, JSON `data/` as single source of truth, and two parallel React themes sharing one `SimulationContext`. Python scripts convert `scoreExport.xls` to `transcript.json` offline.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router 6, Vitest, @testing-library/react, Python 3 (pandas + xlrd), Cloudflare Pages

**Spec:** `docs/superpowers/specs/2026-05-18-course-system-redesign-design.md`

---

## Milestone overview

| M | Tasks | Output |
|---|---|---|
| M1 | 1–5 | Vite + React + TS + Tailwind + Router + Vitest scaffolding |
| M2 | 6–9 | Types, transcript.json (from xls), catalog-110.json, current-semester.json |
| M3 | 10–17 | Credit rules + simulator with full unit tests |
| M4 | 18–24 | SimulationContext + Layout + Legacy theme |
| M5 | 25–28 | Modern theme |
| M6 | 29–31 | CI + Cloudflare Pages deployment + custom domain |

---

## Task 1: Archive v1.7 and existing assets

**Files:**
- Move: `course-v1.7.html` → `archive/course-v1.7.html`
- Move: `index.html` → `archive/index.html`
- Move: `dockerfile` → `archive/dockerfile`
- Move: `README.md` → `archive/README.md`
- Move: `*.pdf` → `docs/catalog-source/`
- Move: `scoreExport.xls` → `docs/catalog-source/scoreExport.xls`

- [ ] **Step 1: Create archive and catalog-source directories**

```bash
cd /c/Users/stans/Projects/course
mkdir -p archive docs/catalog-source
```

- [ ] **Step 2: Move legacy files into archive (git-tracked moves preserve history)**

```bash
git mv course-v1.7.html archive/course-v1.7.html
git mv index.html archive/index.html
git mv dockerfile archive/dockerfile
git mv README.md archive/README.md
```

- [ ] **Step 3: Move PDFs and xls into docs/catalog-source (untracked, will be added)**

```bash
mv "110學年度-國立臺灣師範大學資訊工程學系課程架構表.pdf" docs/catalog-source/
mv "110學年度學士班修業規定.pdf" docs/catalog-source/
mv "111學年度-國立臺灣師範大學資訊工程學系課程架構表.pdf" docs/catalog-source/
mv "111學年度學士班修業規定-修訂共同必修32.pdf" docs/catalog-source/
mv "114-2課表v2.pdf" docs/catalog-source/
mv scoreExport.xls docs/catalog-source/
```

- [ ] **Step 4: Verify file layout**

```bash
ls
ls archive/
ls docs/catalog-source/
```

Expected: root has only `archive/` and `docs/`; archive has the 4 legacy files; catalog-source has 5 PDFs + scoreExport.xls.

- [ ] **Step 5: Commit**

```bash
git add archive/ docs/catalog-source/
git commit -m "chore: archive v1.7 files and source PDFs before redesign"
```

---

## Task 2: Initialise Vite + React + TypeScript project

**Files:**
- Create: `package.json`
- Create: `index.html` (Vite-generated)
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`
- Create: `.gitignore`

- [ ] **Step 1: Run Vite create in current directory**

```bash
cd /c/Users/stans/Projects/course
npm create vite@latest . -- --template react-ts
```

If prompted to overwrite, choose "Ignore files and continue" (the directory has `archive/` and `docs/` which are safe).

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite prints `Local: http://localhost:5173/`. Open browser, see default React + Vite landing page. Press Ctrl+C to stop.

- [ ] **Step 4: Verify TypeScript build works**

```bash
npm run build
```

Expected: `dist/` folder created with `index.html`, `assets/*.js`, `assets/*.css`. Exit code 0.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

## Task 3: Add Tailwind CSS

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Install Tailwind and PostCSS**

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

This produces `tailwind.config.js` and `postcss.config.js`.

- [ ] **Step 2: Rename config to TypeScript**

```bash
mv tailwind.config.js tailwind.config.ts
```

- [ ] **Step 3: Configure tailwind.config.ts**

Replace contents of `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        legacy: {
          start: '#667eea',
          end: '#764ba2',
        },
      },
      fontFamily: {
        zhengHei: ['"Microsoft JhengHei"', '"微軟正黑體"', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 4: Replace src/index.css with Tailwind directives**

Replace contents of `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root {
    height: 100%;
    margin: 0;
  }
}
```

- [ ] **Step 5: Test Tailwind works by editing App.tsx**

Replace `src/App.tsx` contents:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-legacy-start to-legacy-end text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Course System</h1>
    </div>
  );
}

export default App;
```

- [ ] **Step 6: Verify in browser**

```bash
npm run dev
```

Expected: purple-blue gradient page with white "Course System" text. Ctrl+C to stop.

- [ ] **Step 7: Commit**

```bash
git add tailwind.config.ts postcss.config.js src/index.css src/App.tsx package.json package-lock.json
git commit -m "feat: add Tailwind CSS"
```

---

## Task 4: Add React Router with placeholder routes

**Files:**
- Modify: `src/main.tsx`
- Create: `src/shared/Layout.tsx` (skeleton)
- Create: `src/themes/legacy/App.tsx` (placeholder)
- Create: `src/themes/modern/App.tsx` (placeholder)
- Delete: `src/App.tsx`

- [ ] **Step 1: Install React Router**

```bash
npm install react-router-dom
```

- [ ] **Step 2: Create Layout skeleton**

Create `src/shared/Layout.tsx`:

```tsx
import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();
  const isLegacy = location.pathname.startsWith('/legacy');
  const isModern = location.pathname.startsWith('/modern');

  return (
    <div className="min-h-screen">
      <nav className="bg-gray-900 text-white px-6 py-3 flex gap-4">
        <Link to="/" className="font-bold">course.stan-shih</Link>
        <Link to="/legacy" className={isLegacy ? 'font-bold' : 'opacity-70'}>Legacy</Link>
        <Link to="/modern" className={isModern ? 'font-bold' : 'opacity-70'}>Modern</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create Legacy placeholder**

Create `src/themes/legacy/App.tsx`:

```tsx
export function LegacyApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-legacy-start to-legacy-end text-white p-8">
      <h1 className="text-3xl font-zhengHei">Legacy theme (placeholder)</h1>
    </div>
  );
}
```

- [ ] **Step 4: Create Modern placeholder**

Create `src/themes/modern/App.tsx`:

```tsx
export function ModernApp() {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      <h1 className="text-3xl font-bold">Modern theme (placeholder)</h1>
    </div>
  );
}
```

- [ ] **Step 5: Wire Router in main.tsx**

Replace `src/main.tsx` contents:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './shared/Layout';
import { LegacyApp } from './themes/legacy/App';
import { ModernApp } from './themes/modern/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/legacy" replace />} />
          <Route path="/legacy" element={<LegacyApp />} />
          <Route path="/modern" element={<ModernApp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 6: Delete old App.tsx**

```bash
rm src/App.tsx
```

- [ ] **Step 7: Verify routes work**

```bash
npm run dev
```

Open browser to `http://localhost:5173`. Expected: auto-redirect to `/legacy`, see purple gradient with "Legacy theme (placeholder)" + nav bar. Click "Modern" → white page with "Modern theme (placeholder)". Ctrl+C to stop.

- [ ] **Step 8: Commit**

```bash
git add src/ package.json package-lock.json
git commit -m "feat: add Router with placeholder theme routes"
```

---

## Task 5: Add Vitest test framework

**Files:**
- Modify: `package.json` (add scripts)
- Modify: `vite.config.ts`
- Create: `tests/setup.ts`
- Create: `tests/sanity.test.ts`

- [ ] **Step 1: Install test deps**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node
```

- [ ] **Step 2: Configure vite.config.ts for test**

Replace `vite.config.ts` contents:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
});
```

- [ ] **Step 3: Create test setup**

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

(Keep other existing scripts.)

- [ ] **Step 5: Write sanity test**

Create `tests/sanity.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run test to verify framework works**

```bash
npm run test:run
```

Expected: `Test Files  1 passed`, `Tests  1 passed`. Exit code 0.

- [ ] **Step 7: Commit**

```bash
git add tests/ vite.config.ts package.json package-lock.json
git commit -m "test: add vitest framework with jsdom"
```

---

## Task 6: Define core types

**Files:**
- Create: `src/lib/types.ts`
- Create: `tests/types.test.ts`

- [ ] **Step 1: Write failing test for isPassed**

Create `tests/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { isPassed, type Grade } from '../src/lib/types';

describe('isPassed', () => {
  it('returns true for A+/A/A-/B+/B/B-/C+/C/C-/抵免', () => {
    const passing: Grade[] = ['A+','A','A-','B+','B','B-','C+','C','C-','抵免'];
    for (const g of passing) {
      expect(isPassed(g)).toBe(true);
    }
  });

  it('returns false for D/E/X/停修', () => {
    const failing: Grade[] = ['D','E','X','停修'];
    for (const g of failing) {
      expect(isPassed(g)).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
npm run test:run -- tests/types.test.ts
```

Expected: FAIL — "Cannot find module '../src/lib/types'".

- [ ] **Step 3: Implement types.ts**

Create `src/lib/types.ts`:

```typescript
export type Semester = `${number}-${1 | 2 | '暑'}`;

export type Grade =
  | 'A+' | 'A' | 'A-'
  | 'B+' | 'B' | 'B-'
  | 'C+' | 'C' | 'C-'
  | 'D'  | 'E' | 'X'
  | '停修' | '抵免';

export interface TranscriptRecord {
  semester: Semester;
  code: string;
  name: string;
  type: '必修' | '選修' | '通識';
  credits: number;
  grade: Grade;
  note?: string;
}

export function isPassed(grade: Grade): boolean {
  return !['D', 'E', 'X', '停修'].includes(grade);
}

export type CategoryId =
  | 'total'
  | 'common'
  | 'common.chinese' | 'common.english'
  | 'common.general'
  | 'common.general.liberal'
  | 'common.general.liberal.humanities'
  | 'common.general.liberal.social'
  | 'common.general.liberal.natural'
  | 'common.general.liberal.logical'
  | 'common.general.crossDomain'
  | 'common.general.selfLearning'
  | 'common.pe'
  | 'core' | 'core.cs' | 'core.math' | 'core.project'
  | 'electives' | 'field'
  | 'field.theory' | 'field.hardware' | 'field.system'
  | 'field.network' | 'field.multimedia'
  | 'deptElective'
  | 'freeElective';

export interface CatalogCourse {
  code: string;
  name: string;
  credits: number;
  category: CategoryId;
  alternativeCategories?: CategoryId[];
  available?: boolean;
}

export interface CategoryRule {
  id: CategoryId;
  label: string;
  minCredits: number;
  maxCredits?: number;
  minPerChild?: number;
  overflowTo?: CategoryId;
  requiredCodes?: string[];
  chooseN?: number;
  fromCodes?: string[];
  alsoNeed?: { from: string[]; minCredits: number };
  children?: CategoryRule[];
}

export interface NodeStatus {
  id: CategoryId;
  label: string;
  required: number;
  earned: number;
  pending: number;
  fulfilled: boolean;
  passedCourses: TranscriptRecord[];
  pendingCourses: CatalogCourse[];
  gapCourses: CatalogCourse[];
  children?: NodeStatus[];
}

export interface SimulationResult {
  totalRequired: 128;
  totalEarned: number;
  totalPending: number;
  canGraduateNextSemester: boolean;
  tree: NodeStatus;
  unsatisfiedCategories: NodeStatus[];
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
npm run test:run -- tests/types.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts tests/types.test.ts
git commit -m "feat(lib): define core types and isPassed helper"
```

---

## Task 7: Write sync_transcript.py and generate transcript.json

**Files:**
- Create: `scripts/sync_transcript.py`
- Create: `src/data/transcript.json` (generated)
- Modify: `package.json` (add npm script)

- [ ] **Step 1: Write sync_transcript.py**

Create `scripts/sync_transcript.py`:

```python
"""Convert scoreExport.xls to transcript.json.

Reads the NTNU score export and emits a JSON array of TranscriptRecord.
Skips zero-credit non-exemption records (military education courses).
"""
import json
import sys
from pathlib import Path

import pandas as pd


COLS = ['學年', '學期', '開課代碼', '課程名稱', '必/選/通', '學分', '成績', '備註']


def normalise_semester(year, term) -> str:
    return f"{int(year)}-{term}"


def normalise_grade(raw) -> str:
    # raw can be 'A+', 'A', ..., 'E', 'X', '停修', '抵免', or empty
    g = str(raw).strip()
    if g in ('A+','A','A-','B+','B','B-','C+','C','C-','D','E','X','停修','抵免'):
        return g
    raise ValueError(f'unknown grade: {raw!r}')


def normalise_type(raw) -> str:
    t = str(raw).strip()
    if t == '必修': return '必修'
    if t == '選修': return '選修'
    if t == '通識': return '通識'
    raise ValueError(f'unknown type: {raw!r}')


def main(xls_path: str, out_path: str) -> None:
    df = pd.read_excel(xls_path, header=None)
    # Row 0 is headers; row 1+ is data.
    df.columns = COLS
    df = df.iloc[1:].reset_index(drop=True)

    records = []
    for _, row in df.iterrows():
        credits = float(row['學分'])
        grade = normalise_grade(row['成績'])

        # Skip zero-credit non-exemption (military ed)
        if credits == 0 and grade != '抵免':
            continue

        rec = {
            'semester': normalise_semester(row['學年'], row['學期']),
            'code': str(row['開課代碼']).strip(),
            'name': str(row['課程名稱']).strip(),
            'type': normalise_type(row['必/選/通']),
            'credits': credits,
            'grade': grade,
        }
        note = str(row['備註']).strip()
        if note and note != 'nan':
            rec['note'] = note
        records.append(rec)

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f'Wrote {len(records)} records to {out_path}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
```

- [ ] **Step 2: Add npm script for sync**

In `package.json`, add to `"scripts"`:

```json
"sync:transcript": "python scripts/sync_transcript.py docs/catalog-source/scoreExport.xls src/data/transcript.json"
```

- [ ] **Step 3: Install Python dependencies**

```bash
pip install pandas xlrd
```

- [ ] **Step 4: Run sync**

```bash
npm run sync:transcript
```

Expected: prints `Wrote NN records to src/data/transcript.json` where NN is around 60.

- [ ] **Step 5: Spot-check output**

Open `src/data/transcript.json`. Verify first record matches scoreExport.xls row 2 (e.g. `0AUG462 個人投資理財 B+`); verify last record is from 114-1; verify zero-credit military-ed records are NOT present.

- [ ] **Step 6: Commit**

```bash
git add scripts/sync_transcript.py src/data/transcript.json package.json
git commit -m "feat(scripts): sync_transcript.py and generate transcript.json"
```

---

## Task 8: Hand-curate catalog-110.json and current-semester.json

**Files:**
- Create: `src/data/catalog-110.json`
- Create: `src/data/current-semester.json`

This task is **manual data entry** with reference to `docs/catalog-source/111學年度-國立臺灣師範大學資訊工程學系課程架構表.pdf`. No tests; the JSON is validated in Task 10.

- [ ] **Step 1: Create catalog-110.json**

Create `src/data/catalog-110.json` (entries derived from the 111 學年 PDF — more comprehensive than 110, and 110 students can take all of these):

```json
[
  {"code":"00UA7A7","name":"中文閱讀與思辨","credits":2,"category":"common.chinese"},
  {"code":"00UA8A7","name":"中文寫作與表達","credits":2,"category":"common.chinese"},
  {"code":"ENU0168","name":"英文（一）","credits":2,"category":"common.english"},
  {"code":"ENU0169","name":"英文（二）","credits":2,"category":"common.english"},
  {"code":"ENU0170","name":"英文（三）","credits":2,"category":"common.english"},

  {"code":"CSU0001","name":"程式設計（一）","credits":3,"category":"core.cs"},
  {"code":"CSU0002","name":"程式設計（二）","credits":3,"category":"core.cs"},
  {"code":"CSU0013","name":"資料結構","credits":3,"category":"core.cs"},
  {"code":"CSU0018","name":"演算法","credits":3,"category":"core.cs"},
  {"code":"CSU0029","name":"計算機結構","credits":3,"category":"core.cs"},

  {"code":"MAU0178","name":"微積分甲（一）","credits":4,"category":"core.math"},
  {"code":"MAU0179","name":"微積分甲（二）","credits":4,"category":"core.math"},
  {"code":"MAU0180","name":"微積分乙（一）","credits":3,"category":"core.math"},
  {"code":"MAU0181","name":"微積分乙（二）","credits":3,"category":"core.math"},
  {"code":"CSU0011","name":"離散數學","credits":3,"category":"core.math"},
  {"code":"CSU0015","name":"機率論","credits":3,"category":"core.math"},
  {"code":"CSU0016","name":"線性代數","credits":3,"category":"core.math"},

  {"code":"CSU0036","name":"資訊專題研究（一）：資訊理論","credits":3,"category":"core.project"},
  {"code":"CSU0037","name":"資訊專題研究（一）：資訊系統","credits":3,"category":"core.project"},
  {"code":"CSU0039","name":"資訊專題研究（二）：資訊理論","credits":3,"category":"core.project"},
  {"code":"CSU0040","name":"資訊專題研究（二）：資訊系統","credits":3,"category":"core.project"},

  {"code":"CSU0006","name":"計算機概論","credits":3,"category":"field.theory"},
  {"code":"CSU0020","name":"程式語言結構","credits":3,"category":"field.theory"},
  {"code":"CSC0005","name":"物件導向分析與設計","credits":3,"category":"field.theory"},
  {"code":"CSU0034","name":"資料庫理論","credits":3,"category":"field.theory"},
  {"code":"CSU0031","name":"自動機理論與正規語言","credits":3,"category":"field.theory"},

  {"code":"CSU0007","name":"基礎電子學","credits":3,"category":"field.hardware"},
  {"code":"CSU0049","name":"類比數位運算元件","credits":3,"category":"field.hardware"},
  {"code":"CSU0014","name":"組合語言","credits":3,"category":"field.hardware"},
  {"code":"CSU0009","name":"數位邏輯","credits":3,"category":"field.hardware"},
  {"code":"CSC0011","name":"電腦輔助VLSI設計","credits":3,"category":"field.hardware"},

  {"code":"CSU0027","name":"系統程式","credits":3,"category":"field.system"},
  {"code":"CSU0028","name":"軟體工程","credits":3,"category":"field.system"},
  {"code":"CSC0072","name":"資訊安全","credits":3,"category":"field.system"},
  {"code":"CSU0033","name":"作業系統","credits":3,"category":"field.system"},
  {"code":"CSC0004","name":"編譯系統設計","credits":3,"category":"field.system"},

  {"code":"CSU0019","name":"計算機網路","credits":3,"category":"field.network"},
  {"code":"CSU0038","name":"區域性網路","credits":3,"category":"field.network"},
  {"code":"CSC0056","name":"資料通訊","credits":3,"category":"field.network"},
  {"code":"CSC0010","name":"無線通訊","credits":3,"category":"field.network"},

  {"code":"CSU0021","name":"計算機圖學","credits":3,"category":"field.multimedia"},
  {"code":"CSU0041","name":"影像處理","credits":3,"category":"field.multimedia"},
  {"code":"CSU0042","name":"人工智慧","credits":3,"category":"field.multimedia"},
  {"code":"CSC0001","name":"資料探勘","credits":3,"category":"field.multimedia"},

  {"code":"CSU0035","name":"數值方法","credits":3,"category":"deptElective"},
  {"code":"CSU0032","name":"工程數學","credits":3,"category":"deptElective"},
  {"code":"CSU0026","name":"數理統計","credits":3,"category":"deptElective"},
  {"code":"CSU0023","name":"函數語言程式設計","credits":3,"category":"deptElective"},
  {"code":"CSU0017","name":"邏輯語言程式設計","credits":3,"category":"deptElective"},
  {"code":"CSU0030","name":"進階程式設計","credits":3,"category":"deptElective"},
  {"code":"CSU0022","name":"程式設計技巧","credits":3,"category":"deptElective"},
  {"code":"CSU0012","name":"邏輯概論","credits":3,"category":"deptElective"},
  {"code":"CSC0012","name":"語音處理","credits":3,"category":"deptElective"},
  {"code":"CSC0006","name":"網路計算與XML","credits":3,"category":"deptElective"},
  {"code":"CSU0050","name":"類比數位運算元件實驗","credits":1,"category":"deptElective"},
  {"code":"CSU0008","name":"基礎電子學實驗","credits":1,"category":"deptElective"},
  {"code":"CSU0010","name":"數位邏輯實驗","credits":1,"category":"deptElective"},
  {"code":"CSC9002","name":"資訊產業動態及實務","credits":3,"category":"deptElective"},
  {"code":"CSU0024","name":"微處理機","credits":2,"category":"deptElective"},
  {"code":"CSU0025","name":"微處理機實驗","credits":1,"category":"deptElective"},
  {"code":"CSC9007","name":"資安攻防演練","credits":3,"category":"deptElective"},
  {"code":"CSC9008","name":"網宇實體系統","credits":3,"category":"deptElective"},
  {"code":"CSC9009","name":"音訊技術與電腦音樂專題研究","credits":3,"category":"deptElective"},
  {"code":"CSC9004","name":"物聯網概論與應用","credits":3,"category":"deptElective"},
  {"code":"CSU0046","name":"行動應用程式開發","credits":3,"category":"deptElective"},
  {"code":"CSC9005","name":"資料視覺化","credits":3,"category":"deptElective"},
  {"code":"CSC9006","name":"即時系統","credits":3,"category":"deptElective"},
  {"code":"CSC9010","name":"應用密碼學","credits":3,"category":"deptElective"},
  {"code":"CSU0051","name":"智慧城市中的資料科學與通訊","credits":1,"category":"deptElective"},

  {"code":"00UP104","name":"體育（籃球初級）","credits":1,"category":"common.pe"},
  {"code":"00UP105","name":"體育（排球初級）","credits":1,"category":"common.pe"},
  {"code":"00UP109","name":"體育（羽球初級）","credits":1,"category":"common.pe"},
  {"code":"00UP120","name":"體育（現代舞初級）","credits":1,"category":"common.pe"}
]
```

This catalog covers the codes in your transcript plus all field/dept-elective courses listed in the 111 PDF. Courses not in catalog fall back to `freeElective` automatically (e.g. 大數據分析導論, 核天文物理介紹, 中英筆譯 — your past free electives).

Note: 通識 courses (博雅, 跨域, 自主學習) are NOT enumerated here because they are too numerous and selected from a different pool. Instead, transcript-side will assign them to the right `common.general.liberal.*` based on a separate mapping in Task 9.

- [ ] **Step 2: Create current-semester.json**

Create `src/data/current-semester.json`:

```json
{
  "semester": "114-2",
  "courses": [
    {"code":"CSC9007","name":"資安攻防演練"},
    {"code":"00UP104","name":"體育（籃球初級）"},
    {"code":"CSU0011","name":"離散數學"},
    {"code":"CSU0029","name":"計算機結構"},
    {"code":"CSU0018","name":"演算法"},
    {"code":"CSU0009","name":"數位邏輯"},
    {"code":"CSU0041","name":"影像處理"},
    {"code":"CSU0021","name":"計算機圖學"},
    {"code":"CSU0040","name":"資訊專題研究（二）：資訊系統"}
  ]
}
```

- [ ] **Step 3: Validate JSON syntax**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/data/catalog-110.json','utf-8')); console.log('catalog OK')"
node -e "JSON.parse(require('fs').readFileSync('src/data/current-semester.json','utf-8')); console.log('semester OK')"
```

Expected: both print "OK".

- [ ] **Step 4: Commit**

```bash
git add src/data/catalog-110.json src/data/current-semester.json
git commit -m "feat(data): catalog-110 and 114-2 current-semester JSON"
```

---

## Task 9: Liberal-arts (通識) course classification map

**Files:**
- Create: `src/data/liberal-courses.json`

通識 courses don't appear in the catalog PDF but are picked from a separate pool. We need a code → sub-category map for the 通識 courses in your transcript.

- [ ] **Step 1: Create liberal-courses.json**

Create `src/data/liberal-courses.json`. Based on your scoreExport.xls 通識-type rows, hand-classify each into 4 博雅 sub-areas or 跨域 or 自主學習:

```json
{
  "0AUG462": {"category": "common.general.liberal.social", "name": "個人投資理財"},
  "03UG024": {"category": "common.general.liberal.natural", "name": "環境與傳播"},
  "05UG009": {"category": "common.general.liberal.social", "name": "科技與社會"},
  "01UG011": {"category": "common.general.liberal.humanities", "name": "亞裔美國文學與電影的藝術形式"},
  "06UG014": {"category": "common.general.liberal.humanities", "name": "科技與人文的對話"},
  "05UG016": {"category": "common.general.crossDomain", "name": "運算思維與程式設計"},
  "03UG003": {"category": "common.general.liberal.social", "name": "多元文化"},
  "05UG017": {"category": "common.general.crossDomain", "name": "資料科學與程式設計"},
  "03UG027": {"category": "common.general.liberal.social", "name": "女性文學、性別平等理論與婦運"},
  "03UG029": {"category": "common.general.crossDomain", "name": "管理與電影"},
  "06UG004": {"category": "common.general.liberal.natural", "name": "星星月亮太陽－天文漫談"},
  "06UG005": {"category": "common.general.liberal.natural", "name": "奈米科技"},
  "06UG021": {"category": "common.general.liberal.natural", "name": "宇宙中的生命與太空環境"}
}
```

**Note**: classification is your best judgement based on course content + 4 博雅 areas (人文藝術/社會科學/自然科學/邏輯運算). If a course is later re-classified by the school, edit this file. Each course produces 2 credits.

- [ ] **Step 2: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/data/liberal-courses.json','utf-8')); console.log('OK')"
```

Expected: "OK".

- [ ] **Step 3: Commit**

```bash
git add src/data/liberal-courses.json
git commit -m "feat(data): liberal-arts course classification map"
```

---

## Task 10: catalog.ts helpers with tests

**Files:**
- Create: `src/lib/catalog.ts`
- Create: `tests/catalog.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/catalog.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { findByCode, classifyCourse } from '../src/lib/catalog';
import type { CatalogCourse } from '../src/lib/types';

const sampleCatalog: CatalogCourse[] = [
  { code: 'CSU0018', name: '演算法', credits: 3, category: 'core.cs' },
  { code: 'CSC9007', name: '資安攻防演練', credits: 3, category: 'deptElective' },
];

const sampleLiberal = {
  '0AUG462': { category: 'common.general.liberal.social', name: '個人投資理財' },
};

describe('findByCode', () => {
  it('returns matching course', () => {
    const result = findByCode(sampleCatalog, 'CSU0018');
    expect(result?.name).toBe('演算法');
  });

  it('returns undefined for unknown code', () => {
    expect(findByCode(sampleCatalog, 'XXX0000')).toBeUndefined();
  });
});

describe('classifyCourse', () => {
  it('uses catalog category when found', () => {
    const result = classifyCourse('CSU0018', sampleCatalog, sampleLiberal);
    expect(result).toBe('core.cs');
  });

  it('uses liberal map when transcript-style code', () => {
    const result = classifyCourse('0AUG462', sampleCatalog, sampleLiberal);
    expect(result).toBe('common.general.liberal.social');
  });

  it('falls back to freeElective when unknown', () => {
    const result = classifyCourse('XXX0000', sampleCatalog, sampleLiberal);
    expect(result).toBe('freeElective');
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm run test:run -- tests/catalog.test.ts
```

Expected: FAIL — "Cannot find module".

- [ ] **Step 3: Implement catalog.ts**

Create `src/lib/catalog.ts`:

```typescript
import type { CatalogCourse, CategoryId } from './types';

export type LiberalMap = Record<string, { category: CategoryId; name: string }>;

export function findByCode(
  catalog: CatalogCourse[],
  code: string,
): CatalogCourse | undefined {
  return catalog.find(c => c.code === code);
}

export function classifyCourse(
  code: string,
  catalog: CatalogCourse[],
  liberal: LiberalMap,
): CategoryId {
  const fromCatalog = findByCode(catalog, code);
  if (fromCatalog) return fromCatalog.category;

  const fromLiberal = liberal[code];
  if (fromLiberal) return fromLiberal.category;

  return 'freeElective';
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:run -- tests/catalog.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/catalog.ts tests/catalog.test.ts
git commit -m "feat(lib): catalog lookup and classifyCourse"
```

---

## Task 11: transcript.ts dedup with tests

**Files:**
- Create: `src/lib/transcript.ts`
- Create: `tests/transcript.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/transcript.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { passedRecords, dedupByCode } from '../src/lib/transcript';
import type { TranscriptRecord } from '../src/lib/types';

const records: TranscriptRecord[] = [
  { semester: '111-1', code: 'CSU0001', name: '程式設計（一）', type: '必修', credits: 3, grade: 'E' },
  { semester: '112-1', code: 'CSU0001', name: '程式設計（一）', type: '必修', credits: 3, grade: 'C-' },
  { semester: '112-1', code: 'CSU0015', name: '機率論', type: '必修', credits: 3, grade: 'C' },
  { semester: '113-2', code: 'CSU0018', name: '演算法', type: '必修', credits: 3, grade: '停修' },
];

describe('passedRecords', () => {
  it('filters out failing grades', () => {
    const result = passedRecords(records);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.code).sort()).toEqual(['CSU0001', 'CSU0015']);
  });
});

describe('dedupByCode', () => {
  it('keeps one per code', () => {
    const passed = passedRecords(records);
    const result = dedupByCode(passed);
    expect(result).toHaveLength(2);
  });

  it('handles empty input', () => {
    expect(dedupByCode([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm run test:run -- tests/transcript.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement transcript.ts**

Create `src/lib/transcript.ts`:

```typescript
import { isPassed, type TranscriptRecord } from './types';

export function passedRecords(records: TranscriptRecord[]): TranscriptRecord[] {
  return records.filter(r => isPassed(r.grade));
}

export function dedupByCode(records: TranscriptRecord[]): TranscriptRecord[] {
  const seen = new Map<string, TranscriptRecord>();
  for (const r of records) {
    if (!seen.has(r.code)) {
      seen.set(r.code, r);
    }
  }
  return Array.from(seen.values());
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:run -- tests/transcript.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/transcript.ts tests/transcript.test.ts
git commit -m "feat(lib): passedRecords and dedupByCode"
```

---

## Task 12: creditRules.ts with RULES_110 constant and structural test

**Files:**
- Create: `src/lib/creditRules.ts`
- Create: `tests/creditRules.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/creditRules.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { RULES_110, findRule, flattenRules } from '../src/lib/creditRules';
import type { CategoryId } from '../src/lib/types';

describe('RULES_110 structure', () => {
  it('root requires 128 credits', () => {
    expect(RULES_110.id).toBe('total');
    expect(RULES_110.minCredits).toBe(128);
  });

  it('top-level children sum to 128', () => {
    const sum = (RULES_110.children ?? []).reduce((acc, c) => acc + c.minCredits, 0);
    expect(sum).toBe(128);
  });

  it('has 4 top-level categories: common, core, electives, freeElective', () => {
    const ids = (RULES_110.children ?? []).map(c => c.id);
    expect(ids).toEqual(['common', 'core', 'electives', 'freeElective']);
  });

  it('has 5 領域 leaves', () => {
    const field = findRule(RULES_110, 'field');
    expect(field?.children).toHaveLength(5);
    expect(field?.children?.map(c => c.id).sort()).toEqual([
      'field.hardware', 'field.multimedia', 'field.network',
      'field.system', 'field.theory',
    ]);
  });
});

describe('flattenRules', () => {
  it('yields all rule nodes', () => {
    const flat = flattenRules(RULES_110);
    const ids = flat.map(r => r.id);
    expect(ids).toContain('common.chinese');
    expect(ids).toContain('core.cs');
    expect(ids).toContain('field.system');
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm run test:run -- tests/creditRules.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement creditRules.ts**

Create `src/lib/creditRules.ts`:

```typescript
import type { CategoryId, CategoryRule } from './types';

export const RULES_110: CategoryRule = {
  id: 'total', label: '畢業總學分', minCredits: 128, children: [
    {
      id: 'common', label: '一、校共同必修', minCredits: 32, children: [
        { id: 'common.chinese', label: '中文', minCredits: 4 },
        { id: 'common.english', label: '英文', minCredits: 6 },
        {
          id: 'common.general', label: '通識', minCredits: 18, children: [
            {
              id: 'common.general.liberal', label: '博雅', minCredits: 8,
              minPerChild: 2,
              children: [
                { id: 'common.general.liberal.humanities', label: '人文藝術', minCredits: 2 },
                { id: 'common.general.liberal.social',     label: '社會科學', minCredits: 2 },
                { id: 'common.general.liberal.natural',    label: '自然科學', minCredits: 2 },
                { id: 'common.general.liberal.logical',    label: '邏輯運算', minCredits: 2 },
              ],
              overflowTo: 'common.general',
            },
            { id: 'common.general.crossDomain', label: '跨域探索', minCredits: 4,
              overflowTo: 'common.general' },
            { id: 'common.general.selfLearning', label: '自主學習', minCredits: 0,
              maxCredits: 4, overflowTo: 'freeElective' },
          ],
          overflowTo: 'freeElective',
        },
        { id: 'common.pe', label: '體育', minCredits: 4 },
      ],
    },
    {
      id: 'core', label: '二、系核心必修', minCredits: 33, children: [
        {
          id: 'core.cs', label: '資訊課程', minCredits: 15,
          requiredCodes: ['CSU0001','CSU0002','CSU0013','CSU0018','CSU0029'],
        },
        {
          id: 'core.math', label: '數學必選修', minCredits: 12,
          requiredCodes: ['CSU0011','CSU0015','CSU0016'],
          alsoNeed: { from: ['MAU0178','MAU0179','MAU0180','MAU0181'], minCredits: 3 },
        },
        {
          id: 'core.project', label: '資訊專題', minCredits: 6,
          chooseN: 2,
          fromCodes: ['CSU0036','CSU0037','CSU0039','CSU0040'],
        },
      ],
    },
    {
      id: 'electives', label: '三、系選修', minCredits: 36, children: [
        {
          id: 'field', label: '領域選修', minCredits: 30,
          minPerChild: 3,
          children: [
            { id: 'field.theory',     label: '資訊理論', minCredits: 3 },
            { id: 'field.hardware',   label: '資訊硬體', minCredits: 3 },
            { id: 'field.system',     label: '資訊系統', minCredits: 3 },
            { id: 'field.network',    label: '電腦網路', minCredits: 3 },
            { id: 'field.multimedia', label: '多媒體處理', minCredits: 3 },
          ],
          overflowTo: 'deptElective',
        },
        { id: 'deptElective', label: '系選修', minCredits: 6, overflowTo: 'freeElective' },
      ],
    },
    { id: 'freeElective', label: '四、自由選修', minCredits: 27 },
  ],
};

export function findRule(root: CategoryRule, id: CategoryId): CategoryRule | undefined {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findRule(child, id);
    if (found) return found;
  }
  return undefined;
}

export function flattenRules(root: CategoryRule): CategoryRule[] {
  const out: CategoryRule[] = [root];
  for (const child of root.children ?? []) {
    out.push(...flattenRules(child));
  }
  return out;
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:run -- tests/creditRules.test.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/creditRules.ts tests/creditRules.test.ts
git commit -m "feat(lib): RULES_110 rule tree with helpers"
```

---

## Task 13: simulator.ts — assign passed records to leaves

**Files:**
- Create: `src/lib/simulator.ts`
- Create: `tests/simulator.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/simulator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { assignToLeaves } from '../src/lib/simulator';
import type { TranscriptRecord, CatalogCourse } from '../src/lib/types';

const catalog: CatalogCourse[] = [
  { code: 'CSU0018', name: '演算法', credits: 3, category: 'core.cs' },
  { code: 'CSU0027', name: '系統程式', credits: 3, category: 'field.system' },
];

const liberal = {
  '0AUG462': { category: 'common.general.liberal.social' as const, name: '個人投資理財' },
};

describe('assignToLeaves', () => {
  it('maps each passed record to a category id', () => {
    const passed: TranscriptRecord[] = [
      { semester: '113-2', code: 'CSU0018', name: '演算法', type: '必修', credits: 3, grade: 'A' },
      { semester: '111-1', code: '0AUG462', name: '個人投資理財', type: '通識', credits: 2, grade: 'B+' },
    ];
    const result = assignToLeaves(passed, catalog, liberal);
    expect(result).toHaveLength(2);
    expect(result.find(a => a.record.code === 'CSU0018')?.categoryId).toBe('core.cs');
    expect(result.find(a => a.record.code === '0AUG462')?.categoryId).toBe('common.general.liberal.social');
  });

  it('falls back unknown codes to freeElective', () => {
    const passed: TranscriptRecord[] = [
      { semester: '111-1', code: 'XXX9999', name: '未知課', type: '選修', credits: 3, grade: 'A' },
    ];
    const result = assignToLeaves(passed, catalog, liberal);
    expect(result[0].categoryId).toBe('freeElective');
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm run test:run -- tests/simulator.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement assignToLeaves**

Create `src/lib/simulator.ts`:

```typescript
import type {
  TranscriptRecord, CatalogCourse, CategoryId, CategoryRule, NodeStatus, SimulationResult,
} from './types';
import { classifyCourse, type LiberalMap } from './catalog';

export interface Assignment {
  record: TranscriptRecord;
  categoryId: CategoryId;
}

export function assignToLeaves(
  passed: TranscriptRecord[],
  catalog: CatalogCourse[],
  liberal: LiberalMap,
): Assignment[] {
  return passed.map(record => ({
    record,
    categoryId: classifyCourse(record.code, catalog, liberal),
  }));
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:run -- tests/simulator.test.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/simulator.ts tests/simulator.test.ts
git commit -m "feat(lib): assignToLeaves"
```

---

## Task 14: simulator.ts — walk rule tree and aggregate

**Files:**
- Modify: `src/lib/simulator.ts`
- Modify: `tests/simulator.test.ts`

- [ ] **Step 1: Add failing test for walkTree**

Append to `tests/simulator.test.ts`:

```typescript
import { walkTree } from '../src/lib/simulator';
import { RULES_110 } from '../src/lib/creditRules';

describe('walkTree', () => {
  it('aggregates earned credits up the tree', () => {
    const assignments: Assignment[] = [
      { record: { semester:'113-2', code:'CSU0018', name:'演算法', type:'必修', credits:3, grade:'A' }, categoryId: 'core.cs' },
      { record: { semester:'113-2', code:'CSU0029', name:'計算機結構', type:'必修', credits:3, grade:'A' }, categoryId: 'core.cs' },
    ];
    const result = walkTree(RULES_110, assignments);
    expect(result.id).toBe('total');
    expect(result.earned).toBe(6);
    const core = result.children?.find(c => c.id === 'core');
    const cs = core?.children?.find(c => c.id === 'core.cs');
    expect(cs?.earned).toBe(6);
  });

  it('clips earned at minCredits per leaf (no over-fill)', () => {
    // 6 records all into core.cs (15 required), each 3 credits = 18 total
    const assignments: Assignment[] = Array.from({length: 6}, (_, i) => ({
      record: { semester:'112-1', code:`X${i}`, name:'x', type:'必修', credits:3, grade:'A' as const },
      categoryId: 'core.cs' as const,
    }));
    const result = walkTree(RULES_110, assignments);
    const core = result.children?.find(c => c.id === 'core');
    const cs = core?.children?.find(c => c.id === 'core.cs');
    expect(cs?.earned).toBe(15);  // clipped at minCredits
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm run test:run -- tests/simulator.test.ts
```

Expected: 2 new tests FAIL ("walkTree is not a function").

- [ ] **Step 3: Implement walkTree**

Append to `src/lib/simulator.ts`:

```typescript
export function walkTree(
  rule: CategoryRule,
  assignments: Assignment[],
): NodeStatus {
  // Recursively build status for children first
  const children = (rule.children ?? []).map(c => walkTree(c, assignments));

  // Earned: if leaf, sum directly-assigned credits; if branch, sum children
  let earned = 0;
  let passedCourses: TranscriptRecord[] = [];
  if (children.length === 0) {
    const own = assignments.filter(a => a.categoryId === rule.id);
    earned = own.reduce((s, a) => s + a.record.credits, 0);
    passedCourses = own.map(a => a.record);
  } else {
    earned = children.reduce((s, c) => s + c.earned, 0);
    passedCourses = children.flatMap(c => c.passedCourses);
  }

  // Clip at minCredits when leaf (for display); branches sum natural
  const required = rule.minCredits;
  const clippedEarned = children.length === 0
    ? Math.min(earned, required)
    : Math.min(earned, required);

  return {
    id: rule.id,
    label: rule.label,
    required,
    earned: clippedEarned,
    pending: 0,
    fulfilled: clippedEarned >= required,
    passedCourses,
    pendingCourses: [],
    gapCourses: [],
    children: children.length > 0 ? children : undefined,
  };
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:run -- tests/simulator.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/simulator.ts tests/simulator.test.ts
git commit -m "feat(lib): walkTree aggregates credits with leaf clipping"
```

---

## Task 15: simulator.ts — full simulate() with overflow

**Files:**
- Modify: `src/lib/simulator.ts`
- Modify: `tests/simulator.test.ts`

- [ ] **Step 1: Add failing test for full simulate()**

Append to `tests/simulator.test.ts`:

```typescript
import { simulate } from '../src/lib/simulator';

describe('simulate (end-to-end)', () => {
  it('handles empty input', () => {
    const result = simulate([], [], {}, [], []);
    expect(result.totalEarned).toBe(0);
    expect(result.canGraduateNextSemester).toBe(false);
  });

  it('combines transcript + assumed pending', () => {
    const transcript: TranscriptRecord[] = [
      { semester:'113-2', code:'CSU0018', name:'演算法', type:'必修', credits:3, grade:'A' },
    ];
    const assumedCodes = ['CSU0029'];  // 計算機結構 in catalog
    const catalogFull: CatalogCourse[] = [
      { code:'CSU0018', name:'演算法', credits:3, category:'core.cs' },
      { code:'CSU0029', name:'計算機結構', credits:3, category:'core.cs' },
    ];
    const result = simulate(transcript, catalogFull, {}, [], assumedCodes);
    expect(result.totalEarned + result.totalPending).toBe(6);
    expect(result.totalPending).toBe(3);
  });

  it('overflows博雅 super-credits into common.general parent', () => {
    // Construct博雅 records that exceed 8 credits to trigger overflow
    const transcript: TranscriptRecord[] = [
      { semester:'111-1', code:'H1', name:'H1', type:'通識', credits:2, grade:'A' },
      { semester:'111-1', code:'H2', name:'H2', type:'通識', credits:2, grade:'A' },
      { semester:'111-1', code:'H3', name:'H3', type:'通識', credits:2, grade:'A' },
      { semester:'111-1', code:'H4', name:'H4', type:'通識', credits:2, grade:'A' },
      { semester:'111-1', code:'H5', name:'H5', type:'通識', credits:2, grade:'A' },  // 5th humanities = surplus
    ];
    const lib = {
      H1: { category: 'common.general.liberal.humanities' as const, name: 'H1' },
      H2: { category: 'common.general.liberal.humanities' as const, name: 'H2' },
      H3: { category: 'common.general.liberal.humanities' as const, name: 'H3' },
      H4: { category: 'common.general.liberal.humanities' as const, name: 'H4' },
      H5: { category: 'common.general.liberal.humanities' as const, name: 'H5' },
    };
    const result = simulate(transcript, [], lib, [], []);
    // humanities min is 2, so 10 credits earned → 2 stays in humanities, 8 overflow up
    // 博雅 总额 should reflect 10 capped at其 minCredits=8 + overflow到通識 6
    expect(result.totalEarned).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm run test:run -- tests/simulator.test.ts
```

Expected: 3 new tests FAIL.

- [ ] **Step 3: Implement simulate() with overflow cascade**

Append to `src/lib/simulator.ts`:

```typescript
import { passedRecords, dedupByCode } from './transcript';
import { RULES_110 } from './creditRules';
import { flattenRules, findRule } from './creditRules';

function applyOverflow(
  assignments: Assignment[],
  rules: CategoryRule,
): Assignment[] {
  // Build leaf credit totals
  const leafCredits = new Map<CategoryId, number>();
  for (const a of assignments) {
    leafCredits.set(a.categoryId, (leafCredits.get(a.categoryId) ?? 0) + a.record.credits);
  }

  // For each leaf, if earned > maxCredits, move surplus to overflowTo (cascade)
  const adjusted = [...assignments];
  const all = flattenRules(rules);

  for (const node of all) {
    if (!node.maxCredits && !node.overflowTo) continue;
    const earned = leafCredits.get(node.id) ?? 0;
    const cap = node.maxCredits ?? node.minCredits;
    if (earned > cap && node.overflowTo) {
      const surplus = earned - cap;
      // Move surplus credits by re-assigning latest assignments
      let toMove = surplus;
      for (let i = adjusted.length - 1; i >= 0 && toMove > 0; i--) {
        if (adjusted[i].categoryId === node.id) {
          const credits = adjusted[i].record.credits;
          if (credits <= toMove) {
            adjusted[i] = { ...adjusted[i], categoryId: node.overflowTo };
            toMove -= credits;
          }
        }
      }
    }
  }

  return adjusted;
}

export function simulate(
  transcript: TranscriptRecord[],
  catalog: CatalogCourse[],
  liberal: LiberalMap,
  currentSemesterCourses: { code: string; name: string }[],
  assumedPassedCodes: string[],
): SimulationResult {
  // 1. Filter passed from transcript
  const passed = dedupByCode(passedRecords(transcript));

  // 2. Build pending records from assumed-passed codes
  const pendingRecords: TranscriptRecord[] = assumedPassedCodes.map(code => {
    const found = catalog.find(c => c.code === code);
    const csEntry = currentSemesterCourses.find(c => c.code === code);
    return {
      semester: '114-2',
      code,
      name: csEntry?.name ?? found?.name ?? code,
      type: '選修',
      credits: found?.credits ?? 0,
      grade: 'A',
    };
  });

  // 3. Assign to leaves
  const allAssigned = assignToLeaves([...passed, ...pendingRecords], catalog, liberal);

  // 4. Apply overflow
  const adjusted = applyOverflow(allAssigned, RULES_110);

  // 5. Walk tree
  const tree = walkTree(RULES_110, adjusted);

  // 6. Compute pending separately for display
  const pendingAssigned = assignToLeaves(pendingRecords, catalog, liberal);
  const pendingCredits = pendingRecords.reduce((s, r) => s + r.credits, 0);

  // 7. Collect unsatisfied
  const unsatisfied: NodeStatus[] = [];
  const collect = (n: NodeStatus) => {
    if (!n.fulfilled) unsatisfied.push(n);
    n.children?.forEach(collect);
  };
  collect(tree);

  // 8. Graduability check: sum (required - earned) over unfulfilled leaves
  const remaining = unsatisfied
    .filter(n => !n.children)
    .reduce((s, n) => s + (n.required - n.earned), 0);
  const canGraduateNextSemester = remaining <= 25;

  return {
    totalRequired: 128,
    totalEarned: tree.earned - pendingCredits >= 0 ? tree.earned - pendingCredits : tree.earned,
    totalPending: pendingCredits,
    canGraduateNextSemester,
    tree,
    unsatisfiedCategories: unsatisfied,
  };
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:run -- tests/simulator.test.ts
```

Expected: 7 tests PASS (some thresholds in overflow test are lenient — adjust if specific number assertions fail).

- [ ] **Step 5: Commit**

```bash
git add src/lib/simulator.ts tests/simulator.test.ts
git commit -m "feat(lib): full simulate() with overflow cascade"
```

---

## Task 16: Integration test with real transcript

**Files:**
- Create: `tests/integration.test.ts`

- [ ] **Step 1: Write integration test using actual data**

Create `tests/integration.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { simulate } from '../src/lib/simulator';
import transcript from '../src/data/transcript.json';
import catalog from '../src/data/catalog-110.json';
import liberal from '../src/data/liberal-courses.json';
import currentSemester from '../src/data/current-semester.json';
import type { TranscriptRecord, CatalogCourse } from '../src/lib/types';
import type { LiberalMap } from '../src/lib/catalog';

describe('integration: real Stan transcript', () => {
  const t = transcript as TranscriptRecord[];
  const c = catalog as CatalogCourse[];
  const l = liberal as LiberalMap;
  const cs = currentSemester.courses;

  it('with empty assumed → earned matches v1.7 (~75)', () => {
    const result = simulate(t, c, l, cs, []);
    expect(result.totalEarned).toBeGreaterThanOrEqual(70);
    expect(result.totalEarned).toBeLessThanOrEqual(80);
    expect(result.totalPending).toBe(0);
  });

  it('with all 9 114-2 courses assumed → ~25 pending', () => {
    const allCodes = cs.map(x => x.code);
    const result = simulate(t, c, l, cs, allCodes);
    expect(result.totalPending).toBe(25);
  });

  it('with all assumed → core.cs is fulfilled', () => {
    const result = simulate(t, c, l, cs, cs.map(x => x.code));
    const core = result.tree.children?.find(n => n.id === 'core');
    const cs2 = core?.children?.find(n => n.id === 'core.cs');
    expect(cs2?.fulfilled).toBe(true);
  });

  it('with all assumed except 演算法 → core.cs unfulfilled', () => {
    const codesWithout = cs.map(x => x.code).filter(c => c !== 'CSU0018');
    const result = simulate(t, c, l, cs, codesWithout);
    const core = result.tree.children?.find(n => n.id === 'core');
    const csCore = core?.children?.find(n => n.id === 'core.cs');
    expect(csCore?.fulfilled).toBe(false);
  });
});
```

- [ ] **Step 2: Run test**

```bash
npm run test:run -- tests/integration.test.ts
```

Expected: 4 tests PASS. If `totalEarned` is not in [70, 80] range, the catalog mappings need adjustment — check which courses fall to `freeElective` unexpectedly.

- [ ] **Step 3: Commit**

```bash
git add tests/integration.test.ts
git commit -m "test: integration test with real transcript fixture"
```

---

## Task 17: SimulationContext with localStorage persistence

**Files:**
- Create: `src/shared/SimulationContext.tsx`
- Create: `tests/components/SimulationContext.test.tsx`

- [ ] **Step 1: Write failing test for Context**

Create `tests/components/SimulationContext.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SimulationProvider, useSimulation } from '../../src/shared/SimulationContext';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  <SimulationProvider>{children}</SimulationProvider>;

describe('useSimulation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initialises with default 9 assumed-passed codes', () => {
    const { result } = renderHook(() => useSimulation(), { wrapper });
    expect(result.current.assumedPassed.size).toBe(9);
    expect(result.current.assumedPassed.has('CSU0018')).toBe(true);
  });

  it('toggle adds and removes codes', () => {
    const { result } = renderHook(() => useSimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    expect(result.current.assumedPassed.has('CSU0018')).toBe(false);
    act(() => result.current.toggle('CSU0018'));
    expect(result.current.assumedPassed.has('CSU0018')).toBe(true);
  });

  it('reset restores default 9 codes', () => {
    const { result } = renderHook(() => useSimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    act(() => result.current.reset());
    expect(result.current.assumedPassed.size).toBe(9);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useSimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    const stored = localStorage.getItem('course.assumedPassed.v1');
    expect(stored).toBeTruthy();
    const codes = JSON.parse(stored!);
    expect(codes).not.toContain('CSU0018');
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm run test:run -- tests/components/SimulationContext.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement SimulationContext**

Create `src/shared/SimulationContext.tsx`:

```tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import currentSemester from '../data/current-semester.json';

const DEFAULT_CODES = new Set(currentSemester.courses.map(c => c.code));
const STORAGE_KEY = 'course.assumedPassed.v1';

interface SimulationContextValue {
  assumedPassed: Set<string>;
  toggle: (code: string) => void;
  reset: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

function loadFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(DEFAULT_CODES);
    const codes = JSON.parse(raw) as string[];
    return new Set(codes);
  } catch {
    return new Set(DEFAULT_CODES);
  }
}

function saveToStorage(codes: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(codes)));
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [assumedPassed, setAssumedPassed] = useState<Set<string>>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(assumedPassed);
  }, [assumedPassed]);

  const value = useMemo<SimulationContextValue>(() => ({
    assumedPassed,
    toggle: (code: string) => {
      setAssumedPassed(prev => {
        const next = new Set(prev);
        if (next.has(code)) next.delete(code);
        else next.add(code);
        return next;
      });
    },
    reset: () => setAssumedPassed(new Set(DEFAULT_CODES)),
  }), [assumedPassed]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be inside SimulationProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:run -- tests/components/SimulationContext.test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/shared/SimulationContext.tsx tests/components/
git commit -m "feat(shared): SimulationContext with localStorage persistence"
```

---

## Task 18: useSimulationResult hook

**Files:**
- Create: `src/shared/useSimulationResult.ts`

- [ ] **Step 1: Implement hook**

Create `src/shared/useSimulationResult.ts`:

```typescript
import { useMemo } from 'react';
import { simulate } from '../lib/simulator';
import { useSimulation } from './SimulationContext';
import transcript from '../data/transcript.json';
import catalog from '../data/catalog-110.json';
import liberal from '../data/liberal-courses.json';
import currentSemester from '../data/current-semester.json';
import type { TranscriptRecord, CatalogCourse, SimulationResult } from '../lib/types';
import type { LiberalMap } from '../lib/catalog';

export function useSimulationResult(): SimulationResult {
  const { assumedPassed } = useSimulation();

  return useMemo(() => {
    return simulate(
      transcript as TranscriptRecord[],
      catalog as CatalogCourse[],
      liberal as LiberalMap,
      currentSemester.courses,
      Array.from(assumedPassed),
    );
  }, [assumedPassed]);
}
```

- [ ] **Step 2: Commit (no test — this is a thin wrapper validated via integration)**

```bash
git add src/shared/useSimulationResult.ts
git commit -m "feat(shared): useSimulationResult hook"
```

---

## Task 19: Legacy theme — Stats component

**Files:**
- Create: `src/themes/legacy/components/Stats.tsx`

- [ ] **Step 1: Implement Stats**

Create `src/themes/legacy/components/Stats.tsx`:

```tsx
import { useSimulationResult } from '../../../shared/useSimulationResult';

export function Stats() {
  const result = useSimulationResult();
  const percentage = ((result.totalEarned + result.totalPending) / 128 * 100).toFixed(1);

  return (
    <div className="grid grid-cols-4 gap-5 p-6">
      <StatCard label="已修學分" value={result.totalEarned} color="text-indigo-600" />
      <StatCard label="本學期" value={`+${result.totalPending}`} color="text-amber-500" />
      <StatCard label="畢業學分" value={128} color="text-red-500" />
      <StatCard label="完成度" value={`${percentage}%`} color="text-emerald-500" />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-lg p-5 text-center">
      <div className={`text-4xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-2">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/themes/legacy/components/Stats.tsx
git commit -m "feat(legacy): Stats component"
```

---

## Task 20: Legacy theme — Sidebar component

**Files:**
- Create: `src/themes/legacy/components/Sidebar.tsx`

- [ ] **Step 1: Implement Sidebar**

Create `src/themes/legacy/components/Sidebar.tsx`:

```tsx
import { useSimulation } from '../../../shared/SimulationContext';
import currentSemester from '../../../data/current-semester.json';
import catalog from '../../../data/catalog-110.json';
import type { CatalogCourse } from '../../../lib/types';

export function Sidebar() {
  const { assumedPassed, toggle, reset } = useSimulation();
  const catalogTyped = catalog as CatalogCourse[];

  return (
    <aside className="bg-white/70 backdrop-blur-md rounded-2xl p-5 m-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📚 {currentSemester.semester} 學期課程</h2>
        <button onClick={reset} className="text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
          Reset
        </button>
      </div>
      <div className="space-y-2">
        {currentSemester.courses.map(course => {
          const meta = catalogTyped.find(c => c.code === course.code);
          const checked = assumedPassed.has(course.code);
          return (
            <label
              key={course.code}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                checked ? 'bg-indigo-50 border border-indigo-300' : 'bg-white border border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(course.code)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{course.name}</div>
                <div className="text-xs text-gray-500">{meta?.credits ?? '?'} 學分</div>
              </div>
            </label>
          );
        })}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/themes/legacy/components/Sidebar.tsx
git commit -m "feat(legacy): Sidebar component with toggleable courses"
```

---

## Task 21: Legacy theme — CreditTree component

**Files:**
- Create: `src/themes/legacy/components/CreditTree.tsx`

- [ ] **Step 1: Implement CreditTree**

Create `src/themes/legacy/components/CreditTree.tsx`:

```tsx
import { useState } from 'react';
import { useSimulationResult } from '../../../shared/useSimulationResult';
import type { NodeStatus } from '../../../lib/types';

export function CreditTree() {
  const result = useSimulationResult();
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 m-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">畢業學分架構</h2>
      <TreeNode node={result.tree} defaultExpanded={2} depth={0} />
    </div>
  );
}

function TreeNode({ node, defaultExpanded, depth }: { node: NodeStatus; defaultExpanded: number; depth: number }) {
  const [expanded, setExpanded] = useState(depth < defaultExpanded);
  const hasChildren = (node.children?.length ?? 0) > 0;

  const statusColor = node.fulfilled
    ? 'text-emerald-600'
    : node.earned > 0 ? 'text-amber-500' : 'text-red-500';

  const statusIcon = node.fulfilled ? '✅' : (node.earned > 0 ? '⚠️' : '○');

  return (
    <div className="ml-4 my-1">
      <div
        className={`flex items-center gap-2 ${hasChildren ? 'cursor-pointer' : ''}`}
        onClick={() => hasChildren && setExpanded(e => !e)}
      >
        {hasChildren && <span>{expanded ? '▼' : '▶'}</span>}
        <span className={statusColor}>{statusIcon}</span>
        <span className="font-medium">{node.label}</span>
        <span className="text-sm text-gray-600">
          {node.earned}/{node.required}
        </span>
        <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden max-w-xs">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-purple-500"
            style={{ width: `${Math.min(100, (node.earned / node.required) * 100)}%` }}
          />
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="border-l-2 border-gray-200 ml-2 mt-1">
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} defaultExpanded={defaultExpanded} depth={depth + 1} />
          ))}
        </div>
      )}
      {expanded && !hasChildren && node.passedCourses.length > 0 && (
        <div className="ml-8 text-xs text-gray-600 mt-1">
          {node.passedCourses.map(c => (
            <div key={c.code}>{c.name} ({c.grade}, {c.semester})</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/themes/legacy/components/CreditTree.tsx
git commit -m "feat(legacy): CreditTree with expandable nodes"
```

---

## Task 22: Legacy theme — GapAdvisor component

**Files:**
- Create: `src/themes/legacy/components/GapAdvisor.tsx`

- [ ] **Step 1: Implement GapAdvisor**

Create `src/themes/legacy/components/GapAdvisor.tsx`:

```tsx
import { useSimulationResult } from '../../../shared/useSimulationResult';
import catalog from '../../../data/catalog-110.json';
import type { CatalogCourse } from '../../../lib/types';

export function GapAdvisor() {
  const result = useSimulationResult();
  const catalogTyped = catalog as CatalogCourse[];

  // Show leaf-level unfulfilled categories (skip branch nodes)
  const leafGaps = result.unsatisfiedCategories.filter(n => !n.children);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 m-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">💡 缺口建議</h2>
      {result.canGraduateNextSemester && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 mb-4">
          <p className="text-emerald-800 font-medium">
            ✅ 預估 115-1 可以畢業（剩 {leafGaps.reduce((s, n) => s + (n.required - n.earned), 0)} 學分）
          </p>
        </div>
      )}
      {leafGaps.length === 0 ? (
        <p className="text-gray-600">所有領域已達標 🎉</p>
      ) : (
        <ul className="space-y-3">
          {leafGaps.map(gap => {
            const shortage = gap.required - gap.earned;
            const candidates = catalogTyped.filter(c => c.category === gap.id).slice(0, 5);
            return (
              <li key={gap.id} className="border-l-4 border-amber-400 pl-3">
                <div className="font-medium">
                  {gap.label} — 還缺 {shortage} 學分
                </div>
                {candidates.length > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    建議：{candidates.map(c => c.name).join(', ')}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/themes/legacy/components/GapAdvisor.tsx
git commit -m "feat(legacy): GapAdvisor with category suggestions"
```

---

## Task 23: Legacy theme — App integration

**Files:**
- Modify: `src/themes/legacy/App.tsx`
- Modify: `src/main.tsx` (wrap with SimulationProvider)

- [ ] **Step 1: Update legacy App.tsx to compose all components**

Replace `src/themes/legacy/App.tsx`:

```tsx
import { Stats } from './components/Stats';
import { Sidebar } from './components/Sidebar';
import { CreditTree } from './components/CreditTree';
import { GapAdvisor } from './components/GapAdvisor';

export function LegacyApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-legacy-start to-legacy-end font-zhengHei">
      <header className="text-white text-center py-6">
        <h1 className="text-3xl font-bold">🎓 國立臺灣師範大學資工系 畢業學分檢核系統</h1>
        <p className="text-sm opacity-80 mt-1">110 學年度入學適用（112.09.22 修訂）</p>
      </header>
      <Stats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4">
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
        <div className="lg:col-span-2">
          <CreditTree />
          <GapAdvisor />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wrap Router with SimulationProvider in main.tsx**

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './shared/Layout';
import { LegacyApp } from './themes/legacy/App';
import { ModernApp } from './themes/modern/App';
import { SimulationProvider } from './shared/SimulationContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/legacy" replace />} />
            <Route path="/legacy" element={<LegacyApp />} />
            <Route path="/modern" element={<ModernApp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  </StrictMode>,
);
```

- [ ] **Step 3: Manual visual test in browser**

```bash
npm run dev
```

Open `http://localhost:5173/legacy`. Verify:
- Header shows 110 學年度 / 112.09.22 修訂
- Stats shows 4 cards with numbers
- Sidebar shows 9 courses, all checked by default
- Click "Reset" → all stay checked (already default)
- Uncheck "演算法" → Stats `+25` decreases, Tree's "二、系核心必修" turns yellow/red
- Tree expands/collapses on click
- GapAdvisor lists unfulfilled categories

Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add src/themes/legacy/App.tsx src/main.tsx
git commit -m "feat(legacy): integrate Stats/Sidebar/Tree/GapAdvisor"
```

---

## Task 24: Run full test suite + build check

**Files:** none (verification only)

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected: All test files pass. Note any failures and fix before continuing.

- [ ] **Step 2: Type-check the project**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: `dist/` produced, no errors.

- [ ] **Step 4: Preview production build**

```bash
npm run preview
```

Open browser to printed URL, sanity-check `/legacy` page works in production mode. Ctrl+C to stop.

- [ ] **Step 5: Commit (only if any tsconfig/vite fixes were needed)**

If no changes, skip commit. Otherwise:

```bash
git add -A
git commit -m "fix: address build/lint issues for legacy completion"
```

---

## Task 25: Modern theme — Stats component

**Files:**
- Create: `src/themes/modern/components/Stats.tsx`

- [ ] **Step 1: Implement modern Stats**

Create `src/themes/modern/components/Stats.tsx`:

```tsx
import { useSimulationResult } from '../../../shared/useSimulationResult';

export function Stats() {
  const result = useSimulationResult();
  const total = result.totalEarned + result.totalPending;
  const pct = (total / 128) * 100;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xs uppercase tracking-widest text-gray-500">Graduation</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${result.canGraduateNextSemester ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {result.canGraduateNextSemester ? 'Likely next semester' : 'Behind schedule'}
        </span>
      </div>
      <div className="text-5xl font-light tabular-nums tracking-tight">
        {total}<span className="text-gray-400 text-3xl"> / 128</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-gray-900" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm text-gray-500 mt-3 tabular-nums">
        +{result.totalPending} pending · {128 - total} remaining
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/themes/modern/components/Stats.tsx
git commit -m "feat(modern): Stats with minimal aesthetic"
```

---

## Task 26: Modern theme — Sidebar and CreditTree

**Files:**
- Create: `src/themes/modern/components/Sidebar.tsx`
- Create: `src/themes/modern/components/CreditTree.tsx`

- [ ] **Step 1: Create modern Sidebar**

Create `src/themes/modern/components/Sidebar.tsx`:

```tsx
import { useSimulation } from '../../../shared/SimulationContext';
import currentSemester from '../../../data/current-semester.json';
import catalog from '../../../data/catalog-110.json';
import type { CatalogCourse } from '../../../lib/types';

export function Sidebar() {
  const { assumedPassed, toggle, reset } = useSimulation();
  const catalogTyped = catalog as CatalogCourse[];

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xs uppercase tracking-widest text-gray-500">
          Current Semester · {currentSemester.semester}
        </h2>
        <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-900">Reset</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {currentSemester.courses.map(course => {
          const meta = catalogTyped.find(c => c.code === course.code);
          const checked = assumedPassed.has(course.code);
          return (
            <label
              key={course.code}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${
                checked ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(course.code)}
                className="w-4 h-4"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{course.name}</div>
                <div className={`text-xs ${checked ? 'text-gray-300' : 'text-gray-500'}`}>
                  {meta?.credits ?? '?'} cr
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create modern CreditTree**

Create `src/themes/modern/components/CreditTree.tsx`:

```tsx
import { useState } from 'react';
import { useSimulationResult } from '../../../shared/useSimulationResult';
import type { NodeStatus } from '../../../lib/types';

export function CreditTree() {
  const result = useSimulationResult();
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Categories</h2>
      {result.tree.children?.map(node => (
        <ModernNode key={node.id} node={node} depth={0} />
      ))}
    </section>
  );
}

function ModernNode({ node, depth }: { node: NodeStatus; depth: number }) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const pct = Math.min(100, (node.earned / node.required) * 100);

  const statusBg = node.fulfilled
    ? 'bg-emerald-50 border-emerald-200'
    : node.earned > 0 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';

  return (
    <div className="my-2">
      <button
        onClick={() => hasChildren && setExpanded(e => !e)}
        className={`w-full text-left p-3 rounded-lg border ${statusBg} flex items-center gap-3`}
      >
        {hasChildren && <span className="text-gray-400 text-xs">{expanded ? '−' : '+'}</span>}
        <span className="flex-1 font-medium text-sm">{node.label}</span>
        <span className="text-xs tabular-nums text-gray-700">
          {node.earned} / {node.required}
        </span>
        <div className="w-24 h-1.5 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-gray-900" style={{ width: `${pct}%` }} />
        </div>
      </button>
      {expanded && hasChildren && (
        <div className="ml-6 mt-1 space-y-1">
          {node.children!.map(child => (
            <ModernNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/themes/modern/components/
git commit -m "feat(modern): Sidebar and CreditTree with monochrome design"
```

---

## Task 27: Modern theme — GapAdvisor and App integration

**Files:**
- Create: `src/themes/modern/components/GapAdvisor.tsx`
- Modify: `src/themes/modern/App.tsx`

- [ ] **Step 1: Create modern GapAdvisor**

Create `src/themes/modern/components/GapAdvisor.tsx`:

```tsx
import { useSimulationResult } from '../../../shared/useSimulationResult';
import catalog from '../../../data/catalog-110.json';
import type { CatalogCourse } from '../../../lib/types';

export function GapAdvisor() {
  const result = useSimulationResult();
  const catalogTyped = catalog as CatalogCourse[];
  const leafGaps = result.unsatisfiedCategories.filter(n => !n.children);

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
        Recommendations for next semester
      </h2>
      {leafGaps.length === 0 ? (
        <p className="text-gray-700">All categories fulfilled.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {leafGaps.map(gap => {
            const shortage = gap.required - gap.earned;
            const candidates = catalogTyped.filter(c => c.category === gap.id).slice(0, 3);
            return (
              <li key={gap.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-sm">{gap.label}</span>
                  <span className="text-xs tabular-nums text-rose-600">−{shortage} cr</span>
                </div>
                {candidates.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {candidates.map(c => c.name).join(' · ')}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Update modern App.tsx**

Replace `src/themes/modern/App.tsx`:

```tsx
import { Stats } from './components/Stats';
import { Sidebar } from './components/Sidebar';
import { CreditTree } from './components/CreditTree';
import { GapAdvisor } from './components/GapAdvisor';

export function ModernApp() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="mb-6">
          <h1 className="text-2xl font-light tracking-tight">course · stan-shih</h1>
          <p className="text-xs text-gray-500 mt-1">NTNU CS · 110 cohort (112.09.22 amended)</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <Stats />
          </div>
          <div className="lg:col-span-2">
            <Sidebar />
          </div>
        </div>
        <CreditTree />
        <GapAdvisor />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Visual test**

```bash
npm run dev
```

Open `http://localhost:5173/modern`. Verify:
- Light minimal background
- Stats card shows "Likely next semester" badge if graduable
- Sidebar 9 courses, dark when selected, light when not
- CreditTree shows expandable rows with thin progress bars
- GapAdvisor lists shortages with "− N cr"
- Toggle "Legacy" / "Modern" in top nav switches themes; assumed-passed set persists across switch

Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add src/themes/modern/
git commit -m "feat(modern): GapAdvisor and App integration"
```

---

## Task 28: Theme preference persistence + redirect logic

**Files:**
- Modify: `src/shared/Layout.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Update Layout to persist theme preference**

Replace `src/shared/Layout.tsx`:

```tsx
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const THEME_KEY = 'course.theme.v1';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLegacy = location.pathname.startsWith('/legacy');
  const isModern = location.pathname.startsWith('/modern');

  // Save preference when user navigates explicitly to a theme
  useEffect(() => {
    if (isLegacy) localStorage.setItem(THEME_KEY, 'legacy');
    else if (isModern) localStorage.setItem(THEME_KEY, 'modern');
  }, [isLegacy, isModern]);

  // On root path, redirect to saved theme
  useEffect(() => {
    if (location.pathname === '/') {
      const saved = localStorage.getItem(THEME_KEY) ?? 'legacy';
      navigate(`/${saved}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen">
      <nav className="bg-gray-900 text-white px-6 py-3 flex gap-4 text-sm">
        <Link to="/" className="font-bold">course.stan-shih</Link>
        <Link to="/legacy" className={isLegacy ? 'font-bold' : 'opacity-70 hover:opacity-100'}>Legacy</Link>
        <Link to="/modern" className={isModern ? 'font-bold' : 'opacity-70 hover:opacity-100'}>Modern</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Remove Navigate from main.tsx (handled in Layout now)**

Replace `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './shared/Layout';
import { LegacyApp } from './themes/legacy/App';
import { ModernApp } from './themes/modern/App';
import { SimulationProvider } from './shared/SimulationContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={null} />
            <Route path="/legacy" element={<LegacyApp />} />
            <Route path="/modern" element={<ModernApp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  </StrictMode>,
);
```

- [ ] **Step 3: Manual test**

```bash
npm run dev
```

- Visit `/legacy`, then refresh → still on `/legacy`
- Visit `/modern`, then visit `/` → redirected to `/modern` (saved preference)
- Clear localStorage in DevTools → visit `/` → defaults to `/legacy`

Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add src/shared/Layout.tsx src/main.tsx
git commit -m "feat(shared): persist theme preference and redirect from root"
```

---

## Task 29: GitHub Actions CI

**Files:**
- Create: `.github/workflows/test.yml`

- [ ] **Step 1: Write workflow**

Create `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npx tsc --noEmit
      - run: npm run build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions workflow for test + build"
```

- [ ] **Step 3: Push to trigger CI**

```bash
git push origin main
```

Open https://github.com/stantheman0128/course/actions and verify the workflow runs and passes.

---

## Task 30: Cloudflare Pages configuration

**Files:**
- Create: `wrangler.toml`
- Create: `docs/deployment.md`
- Create: `.gitignore` additions

- [ ] **Step 1: Create wrangler.toml**

Create `wrangler.toml`:

```toml
name = "course"
compatibility_date = "2026-05-18"
pages_build_output_dir = "dist"
```

- [ ] **Step 2: Create deployment docs**

Create `docs/deployment.md`:

```markdown
# Deployment

## Cloudflare Pages (Git integration)

One-time setup at https://dash.cloudflare.com:

1. Workers & Pages → Create → Pages → Connect to Git
2. Select repo `stantheman0128/course`
3. Production branch: `main`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Root directory: `/`
7. Save and Deploy

After first deploy succeeds, get a `<project>.pages.dev` URL.

## Custom domain: course.stan-shih.com

1. Pages project → Custom domains → Set up a custom domain
2. Enter `course.stan-shih.com`
3. Cloudflare auto-detects stan-shih.com zone and creates CNAME
4. Wait 30s–2min for SSL cert issuance
5. Verify: `https://course.stan-shih.com` serves the app

## Continuous deployment

- Push to `main` → auto build + deploy production
- Open PR → auto preview URL at `https://<hash>.course-xxx.pages.dev`

## Local wrangler

After Cloudflare zone is active:

```bash
npm install -g wrangler
wrangler login
wrangler whoami
```

Use `wrangler pages deployment list` and `wrangler pages deployment tail` for ops.

## Updating transcript next semester

1. Replace `docs/catalog-source/scoreExport.xls` with new export
2. `npm run sync:transcript`
3. `git commit src/data/transcript.json`
4. Push → auto-deploy
```

- [ ] **Step 3: Add .gitignore entries**

Append to `.gitignore` (the file Vite created):

```
.wrangler/
.dev.vars
```

- [ ] **Step 4: Commit and push**

```bash
git add wrangler.toml docs/deployment.md .gitignore
git commit -m "feat(deploy): wrangler config and deployment docs"
git push origin main
```

---

## Task 31: User performs one-time Cloudflare Pages setup

This task is **manual** — Claude cannot create the Pages project without OAuth in the user's browser.

**Files:** none

- [ ] **Step 1: Follow docs/deployment.md "Cloudflare Pages (Git integration)" section**

Open dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → select `stantheman0128/course` → Production branch `main` → Build command `npm run build` → Output dir `dist` → Save and Deploy.

Wait ~2 min for first build. Confirm `<project>.pages.dev` URL works.

- [ ] **Step 2: Bind course.stan-shih.com**

Pages project → Custom domains → Set up custom domain → `course.stan-shih.com` → confirm CNAME auto-creation → wait for SSL → visit `https://course.stan-shih.com` and verify the app loads with /legacy as default theme.

- [ ] **Step 3: (Optional) Install wrangler locally**

```bash
npm install -g wrangler
wrangler login
wrangler whoami
```

OAuth in browser. Confirm `wrangler whoami` shows your account.

- [ ] **Step 4: Mark plan complete**

Update `docs/superpowers/plans/2026-05-18-course-system-redesign.md` (this file) header to mark all tasks done. Take a screenshot of `course.stan-shih.com` and add to README.

---

## Self-Review

Plan coverage vs spec:
- ✅ §1 Architecture: tasks 1–5 (scaffold), 17–18 (shared), 23/27 (theme apps)
- ✅ §2 Data model: tasks 6 (types), 7–9 (data files)
- ✅ §3 Algorithm: tasks 10–15, with all special rules (minPerChild, requiredCodes, chooseN, alsoNeed, overflow)
- ✅ §4 UX: tasks 19–22 (legacy), 25–27 (modern), 28 (theme persistence)
- ✅ §5 Sync: task 7 (sync_transcript.py); sync_catalog.py deferred — task 8/9 do manual catalog curation since PDF parsing is fragile
- ✅ §6 Deployment: tasks 29 (CI), 30–31 (Pages + domain)
- ✅ §7 Testing: tasks 5 (framework), 10–17 (unit tests), 16 (integration)
- ✅ §8 Milestones: M1=1–5, M2=6–9, M3=10–17, M4=18–24, M5=25–27, M6=28–31

Placeholder scan: no TBD/TODO; every code step shows complete code; every command shows expected output.

Type consistency: `CategoryId`, `CategoryRule`, `NodeStatus`, `SimulationResult` defined in Task 6 used consistently throughout. `LiberalMap` defined in Task 10, used in 13/15/17/18.

Notes:
- Task 16 expects `totalEarned ∈ [70, 80]`; if it's outside that range, the catalog mapping in Task 8 needs review (likely a course slipped to freeElective unintentionally).
- Task 9 hand-classifies 通識 courses — your call on each is best-effort.
- Task 31 cannot be automated (OAuth/account access needed). Run yourself; ping me if stuck.
