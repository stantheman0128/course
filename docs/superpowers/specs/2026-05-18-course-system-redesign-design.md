# Course System Redesign — Design Spec

**Date**: 2026-05-18
**Author**: Stan Shih + Claude (brainstorming session)
**Status**: Draft for user review

## Background

`course-v1.7.html` is an 2047-line single-file HTML/CSS/JS app that visualises Stan's graduation credit progress at 國立臺灣師範大學資工系 (NTNU CS). It contains a glassmorphic UI with a stellar canvas background, a 4-card stats panel, a tappable sidebar of "current semester" courses, and a tree view of the graduation requirements. It currently shows 114-1 (Fall 2025) courses as "in progress", but Stan has since completed 114-1 (with two failed courses he was unaware of) and is now nearing the end of 114-2 (Spring 2026).

### Problems with v1.7

1. Footer says "110 學年度入學適用" but Stan is actually a **111 學年度** entrant — wrong rule set referenced.
2. Sidebar 114-1 courses still marked "修課中" — stale; in reality these are done (with 星星月亮太陽 E + 資訊專題（一）：資訊系統 E failed).
3. Category structure mixes "系必修 15 + 系選修 54" instead of the official "系核心必修 33 + 系選修 36"; numbers add to 128 but display structure does not match official rules.
4. Historical transcript is hand-curated in inline JS — missing all 停修 (withdrawn) and 不及格 (failed) records, no retake history. Not maintainable.
5. No graduation-prediction capability beyond toggling 114-1 simulation.
6. Single HTML file — hard to test, hard to refactor, hard to add features.

### Goals

1. Use **`scoreExport.xls`** as single source of truth for transcript history.
2. Encode **111 學年度 official rules** verbatim from the PDF; structure matches the official document.
3. Show **114-2 (Spring 2026)** courses in the sidebar with "assume passed" simulation, mirroring v1.7's interaction model.
4. Add a **graduation-gap predictor**: if the user unchecks a 114-2 course (assuming non-pass), the tree shows the category it would have satisfied, and the GapAdvisor lists what 115-1 courses the user can use to fill that category.
5. Refactor from single HTML to **React + Vite + TypeScript** modular project; allow the credit-rule logic to be unit-tested in isolation.
6. **Two visual themes side by side** (`/legacy` re-using v1.7's glassmorphic style, `/modern` a clean new design) for comparison.
7. Deploy to **Cloudflare Pages** at `course.stan-shih.com` (NS already on Cloudflare; registrar transfer deferred — Squarespace pricing matches Cloudflare's at-cost rate).

### Non-goals

- Multi-academic-year rule switching (111 only for now).
- Bilingual i18n.
- PDF export.
- Multi-user accounts.
- Registrar transfer (deferred; revisit if price gap appears).

## §1 — Overall Architecture

### Directory layout

```
course/
├─ src/
│  ├─ lib/                          # Framework-agnostic core (pure TS, unit-tested)
│  │  ├─ types.ts                   # Course, Grade, CategoryNode types
│  │  ├─ creditRules.ts             # 111 學年規則: tree, minCredits, overflow
│  │  ├─ catalog.ts                 # Course-catalog helpers (code → category)
│  │  ├─ transcript.ts              # TranscriptRecord → categorised assignment
│  │  └─ simulator.ts               # assumedPassed → SimulationResult
│  ├─ data/
│  │  ├─ transcript.json            # From scoreExport.xls (script-generated)
│  │  ├─ catalog-111.json           # 111 學年 course catalog (PDF → JSON)
│  │  └─ current-semester.json      # 114-2 enrolled courses
│  ├─ themes/
│  │  ├─ legacy/
│  │  │  ├─ App.tsx
│  │  │  └─ components/             # Stats, Sidebar, Tree, GapAdvisor (v1.7 look)
│  │  └─ modern/
│  │     ├─ App.tsx
│  │     └─ components/             # New look
│  ├─ shared/
│  │  ├─ Layout.tsx                 # Top bar with theme toggle
│  │  └─ SimulationContext.tsx      # React Context: assumedPassed + toggle
│  └─ main.tsx                      # React Router: /, /legacy, /modern
├─ scripts/
│  ├─ sync_transcript.py            # xls → transcript.json
│  └─ sync_catalog.py               # PDF → catalog-111.json (semi-auto)
├─ tests/
│  ├─ creditRules.test.ts
│  ├─ simulator.test.ts             # Uses real transcript as fixture
│  ├─ regression.test.ts            # Snapshot-based
│  └─ components/                   # Component tests for key interactions
├─ docs/
│  ├─ catalog-source/               # Original PDFs preserved
│  │  ├─ 111學年度-...課程架構表.pdf
│  │  └─ 111學年度學士班修業規定...pdf
│  ├─ deployment.md                 # Cloudflare Pages procedure
│  └─ superpowers/specs/            # This spec lives here
├─ public/
├─ index.html
├─ vite.config.ts
├─ tailwind.config.ts
├─ tsconfig.json
├─ package.json
├─ wrangler.toml                    # Cloudflare Pages config
└─ README.md
```

### Layering

| Layer | Purpose | React-aware |
|---|---|---|
| `lib/` | Pure TS credit-rule evaluation | No |
| `data/` | Static JSON | No |
| `themes/legacy/` | v1.7-style UI | Yes |
| `themes/modern/` | New-style UI | Yes |
| `shared/` | Theme-agnostic Context, Layout, theme toggle | Yes |
| `scripts/` | Offline build-time tools (Python) | — |

### Routing

- `/` — `<Layout>` showing default theme (localStorage preference, default `legacy`).
- `/legacy` — Force legacy theme.
- `/modern` — Force modern theme.

### State management

Single `SimulationContext` providing `assumedPassed: Set<string>` and `toggle(code)`, `reset()`. Persisted to localStorage key `course.assumedPassed.v1`. Credit calculation is a pure function from `(transcript, catalog, assumedPassed)` → `SimulationResult`; no Redux/Zustand needed.

## §2 — Data Model

### Core types (`src/lib/types.ts`)

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
  type: '必修' | '選修' | '通識';   // From xls; reference only
  credits: number;
  grade: Grade;
  note?: string;
}

export function isPassed(g: Grade): boolean {
  return !['D', 'E', 'X', '停修'].includes(g);
}

export type CategoryId =
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
  | 'freeElective'
  | 'total';

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

### JSON shapes

`transcript.json`: array of `TranscriptRecord`.
`catalog-111.json`: array of `CatalogCourse`.
`current-semester.json`: `{ semester: "114-2", courses: [{ code, name }, ...] }`. `credits` and `category` looked up from catalog.

### Course → category mapping

- Primary key: `code`. The xls `type` column (必修/選修/通識) is reference-only because it does not capture sub-categories (e.g. 資料探勘 is xls "選修" but actually 領域選修-多媒體).
- Lookup: `catalog.find(c => c.code === record.code)`. Not found → `freeElective` fallback.

### Edge cases

| Case | Handling |
|---|---|
| Retake (111-1 程設一 E → 112-1 程設一 C-) | dedup by code, keep first passed record; credits only count once |
| Same name, different code | Doesn't happen; code is unique |
| Zero-credit course (全民國防 A-) | **Excluded** from total; not in tree (Q1 decision) |
| Overflow (博雅超 8) | `overflowTo` cascade; surplus credits move to parent then to freeElective |
| Exemption (抵免, 英文一二三 6 學分) | `grade: '抵免'`, `isPassed: true`, credits counted normally |

### Resolved questions

- **Q1 — Military-education courses**: zero-credit; excluded from rule tree and credit totals. Kept in `transcript.json` for record only.
- **Q2 — 通識 18-credit composition**: 博雅 ≥ 8 (each of 4 sub-areas ≥ 2) + 跨域 ≥ 4 + 自主學習 ≤ 4; total must reach 18. Shortfall covered by 博雅 or 跨域 overflow. Surplus beyond 18 → freeElective.

## §3 — Credit Rule Algorithm

### Rule tree (`src/lib/creditRules.ts`)

```typescript
export const RULES_111: CategoryRule = {
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
            { id: 'common.general.crossDomain',  label: '跨域探索', minCredits: 4,
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
        { id: 'deptElective', label: '系選修', minCredits: 6,
          overflowTo: 'freeElective' },
      ],
    },
    { id: 'freeElective', label: '四、自由選修', minCredits: 27 },
  ],
};
```

### Algorithm (`src/lib/simulator.ts`)

```
simulate(transcript, catalog, assumedPassedCodes) → SimulationResult

Pass 1 — Combine real passed + assumed passed into one list
Pass 2 — dedupByCode: same code multiple records → keep first isPassed
Pass 3 — assignToLeaves: each record → leaf via catalog lookup
         Cascade overflow when leaf.earned > maxCredits
Pass 4 — walkUp: from leaves to root, aggregate earned (clipped to max)
         Check minPerChild constraints
         Check requiredCodes (all must be present)
         Check chooseN (at least N from fromCodes)
         Check alsoNeed (subset must satisfy its own minCredits)
Pass 5 — collectGaps: for each unsatisfied leaf, list available catalog courses
Pass 6 — checkGraduability:
         For each unfulfilled leaf, sum (required - earned)
         If sum ≤ 25 AND no leaf depends on unavailable courses → canGraduate
```

### Special-rule encoding

| Rule | Encoded as | Algorithm step |
|---|---|---|
| 博雅 4 領域各 ≥ 2 | `minPerChild: 2` | walkUp checks each child individually |
| 領域選修 30 + 每領域 ≥ 3 | `minCredits: 30, minPerChild: 3` | Same; AND condition |
| 資訊專題 4 選 2 | `chooseN: 2, fromCodes: [...]` | Count intersection of passed codes ∩ fromCodes |
| 微積分至少 3 學分 | `alsoNeed: { from, minCredits: 3 }` | Subset must satisfy its own min |
| 自主學習至多 4 | `maxCredits: 4` | Overflow at 4 |

### Overflow cascade

```
course → leaf X
leaf X.earned += credits
if leaf X.earned > X.maxCredits:
    surplus = X.earned - X.maxCredits
    X.earned = X.maxCredits
    target = X.overflowTo
    target.earned += surplus
    recurse on target
```

## §4 — Simulation & Prediction UX

### Interaction model

A single `assumedPassed: Set<string>` in `SimulationContext`. All UI components read from it; `<Sidebar>` is the only one that writes (via `toggle(code)`).

```
              SimulationContext
                  │
       ┌──────────┼──────────┐
       │          │          │
   <Sidebar>  <Tree>     <Stats>
   toggle    re-renders  re-renders
                  │
              <GapAdvisor>
```

### Default state

```typescript
DEFAULT_ASSUMED_PASSED = new Set([
  // All 9 courses from current-semester.json (114-2)
  'CSC9007','00UP104','CSU0011','CSU0029','CSU0018',
  'CSU0009','CSU0041','CSU0021','CSU0040',
]);
```

Persisted to `localStorage['course.assumedPassed.v1']`. Theme switch does not reset assumption set.

### Component responsibilities

| Component | Reads | Writes |
|---|---|---|
| `<Sidebar>` | `current-semester.json` + `assumedPassed` | toggles assumedPassed via checkbox |
| `<Stats>` | `SimulationResult` (earned, pending, canGraduate) | — |
| `<CreditTree>` | `SimulationResult.tree` | — |
| `<GapAdvisor>` | `SimulationResult.unsatisfiedCategories` | — |

### Behavioural decisions

| Decision | Choice |
|---|---|
| Retake badge (e.g. "was D") | **Not displayed**; user prefers cleaner sidebar |
| Graduation threshold | If total remaining credits to fill ≤ 25 (a realistic semester load) → `canGraduate: true` |
| Tree default expand | Legacy: 2 levels expanded; Modern: collapsed by default |
| Reset behaviour | Returns to DEFAULT_ASSUMED_PASSED (all checked) |

### Theme differences (visual only — logic shared)

| Aspect | Legacy | Modern |
|---|---|---|
| Layout | Top stats, left sidebar, right tree, bottom GapAdvisor | Top hero, card grid, bottom recommendations |
| Palette | Purple-blue gradient `#667eea→#764ba2` | Dark sidebar + white main (dark default) |
| Effects | Glassmorphism `backdrop-filter: blur(16px)`, stellar canvas | Soft shadows, no background animation |
| Mobile | iOS-style bottom sheet for sidebar | Hamburger collapse |
| Font | Microsoft JhengHei | System sans + tabular numbers |

### Edge-case behaviour

| Situation | UX reaction |
|---|---|
| All unchecked | Stats `+0 pending`, tree matches current passed state, GapAdvisor lists 53 remaining credits |
| Overflow occurs | Tree shows "14/8 (超修 6 → 自由選修)" inline |
| Critical course unchecked (e.g. 演算法) | Corresponding core.cs leaf turns red, GapAdvisor flags "必修未過", `canGraduate: false` |
| Catalog miss (foreign-dept course) | Auto-assigned to `freeElective` |

## §5 — Data Sync Pipeline

### Python scripts

`scripts/sync_transcript.py scoreExport.xls src/data/transcript.json`:
- Read xls via pandas + xlrd
- Normalise 學年/學期 → standard Semester format
- Parse grade column
- Skip zero-credit non-exemption records (military-education courses)
- Output JSON with utf-8, indent=2

`scripts/sync_catalog.py docs/catalog-source/*.pdf src/data/catalog-111.json`:
- Extract text via pdfplumber
- Regex-find `^[A-Z]{2,4}\d{4}\s+課程名\s+\d+\.\d+`
- Assign category from PDF section header context
- Output intermediate JSON; **manual review and correction required** before becoming canonical

### npm scripts

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "test": "vitest",
  "preview": "vite preview",
  "sync:transcript": "python scripts/sync_transcript.py scoreExport.xls src/data/transcript.json",
  "sync:catalog": "python scripts/sync_catalog.py docs/catalog-source/*.pdf src/data/catalog-111.json"
}
```

### Maintenance contract

| Scenario | Action |
|---|---|
| New semester grades arrive | Replace `scoreExport.xls`, run `npm run sync:transcript`, commit JSON change |
| Rules change for newer cohorts | Add `creditRules-112.ts` and `catalog-112.json`; keep 111 as legacy |
| Next-semester preview | Edit `src/data/current-semester.json` to swap 114-2 → 115-1 list |

## §6 — Deployment

### Cloudflare Pages via Git integration

One-time setup:
1. Push to GitHub (`stantheman0128/course`, main branch)
2. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
3. Production branch: `main`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Save and deploy

Custom domain:
1. Pages project → Custom domains → Set up
2. Enter `course.stan-shih.com`
3. Cloudflare auto-creates CNAME, issues SSL within 1-2 min

### Continuous deployment

- Push to `main` → auto build + deploy
- Pull request → auto preview URL (e.g. `https://abc.course-xxx.pages.dev`)

### `wrangler.toml`

```toml
name = "course"
compatibility_date = "2026-05-18"
pages_build_output_dir = "dist"
```

### wrangler CLI usage

Pages run via Git integration; wrangler used for:
- `wrangler pages deployment list` — deployment history
- `wrangler pages deployment tail` — live logs

User runs `wrangler login` once after Cloudflare account is set up; OAuth token stored in `%USERPROFILE%\.wrangler\`.

## §7 — Testing

### Framework

- `vitest` for lib/ unit tests
- `@testing-library/react` for key interactive components

### Test suites

`tests/creditRules.test.ts`:
- `RULES_111` structural validity (no orphan `overflowTo`, minCredits sums match)
- Each leaf has a matching catalog entry
- All `minPerChild` and `chooseN` constraints well-formed

`tests/simulator.test.ts`:
- Empty transcript + empty assumed → earned = 0
- Real transcript + empty assumed → earned = 75
- Real transcript + all 9 114-2 courses assumed → earned = 100, `canGraduate: true`
- Uncheck 演算法 → core.cs leaf red, `canGraduate: false`
- Uncheck 資訊專題 → core.project flags "4 選 2 still missing 1"

`tests/regression.test.ts`:
- Snapshot of `simulate(transcript, catalog, allAssumed)` matches stored JSON
- Snapshot diff blocks merges until reviewed

`tests/components/Sidebar.test.tsx`:
- Click checkbox → Context updates
- Reset button restores defaults

### CI

GitHub Actions at `.github/workflows/test.yml`:
```yaml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test
```

Branch protection (manual setup on GitHub) requires test pass before merge.

## §8 — Implementation Milestones

| M | Name | Definition of Done |
|---|---|---|
| **M1** | Project scaffold | Vite + React + TS + Tailwind boot; Router serves placeholders at `/`, `/legacy`, `/modern` |
| **M2** | Data layer | `sync_transcript.py` produces valid `transcript.json`; `catalog-111.json` complete and reviewed; `types.ts` aligned |
| **M3** | Core algorithm | `simulate()` passes all unit tests; on real data: empty assumed → 75; full assumed → 100 |
| **M4** | Legacy UI | `/legacy` complete: Stats, Sidebar, Tree, GapAdvisor wired to Context; visual fidelity to v1.7 |
| **M5** | Modern UI | `/modern` complete with new wireframe; theme toggle shared in Layout |
| **M6** | Deployment | Pages project live; `course.stan-shih.com` SSL active; commits auto-deploy |

### Out of scope

- Multi-year rule switching (111 → 112 → ...)
- i18n
- PDF export
- Multi-user accounts
- Registrar transfer to Cloudflare (deferred)

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Catalog PDF parsing fragile | Treat sync_catalog.py as semi-auto; output intermediate JSON for human review |
| Rule interpretation ambiguity (e.g. 通識 18 composition) | Documented Q2 decision; tests encode the chosen interpretation; if school clarifies later, change in one place |
| Theme drift over time | Shared SimulationContext + lib/ guarantees logic stays consistent; only visual layer diverges |
| User updates transcript and breaks regression snapshot | Snapshot diff requires manual approval — surfaces unexpected impact before deploy |
| Cloudflare Pages build fails on push | Preview URLs per PR catch failures before merge to main |

## Approval

- Architecture (§1): approved
- Data model (§2): approved
- Algorithm (§3): approved (国防 excluded; 通識 overflow rule)
- UX (§4): approved (no retake badge)
- Sync (§5), Deployment (§6), Testing (§7), Milestones (§8): approved
- Tech stack: React + Vite + TypeScript + Tailwind
- Themes: dual (Legacy + Modern)
- Deployment: Cloudflare Pages, `course.stan-shih.com`, NS on Cloudflare already
- Registrar transfer: **deferred**
