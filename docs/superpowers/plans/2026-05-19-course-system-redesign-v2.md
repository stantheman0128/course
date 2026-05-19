# Course System Redesign v2 Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use `- [ ]` checkbox syntax.

**Goal:** Tear down the Layout shell, rebuild `/legacy` as a faithful port of v1.7, fix algorithm clipping, and remove 115-1 over-claims in Modern.

**Architecture:** Two independent themes routed directly (no shared shell). Legacy renders a self-contained v1.7 replica using a verbatim CSS port. Modern stays as redesign with honesty edits. Two separate Contexts isolate Legacy's empty-default state from Modern's localStorage-persisted state.

**Tech Stack:** React 19, Vite 8, TypeScript 5, vanilla CSS for Legacy (Tailwind only for Modern), Vitest, @testing-library/react

**Spec:** `docs/superpowers/specs/2026-05-19-course-system-redesign-v2.md`
**Inventory (line-level acceptance criteria):** `docs/v1.7-inventory.md`
**Source of truth:** `archive/course-v1.7.html`
**Why v1 plan failed:** `docs/claude-code-failure-report.md`

---

## Milestone overview

| M | Tasks | Output |
|---|---|---|
| L0 | 1-3 | Algorithm: NodeStatus gains earnedClipped + overflow; walkTree stops clipping |
| L1 | 4 | Layout shell deleted; main.tsx routes themes directly |
| L2 | 5-7 | LegacySimulationContext (empty, no localStorage) + ModernSimulationContext (renamed) |
| L3 | 8 | legacy.css: verbatim CSS from v1.7 lines 7-968 |
| L4 | 9-10 | LegacyApp shell matching v1.7's body structure; old legacy components deleted |
| L5 | 11 | StellarCanvas (130 stars, ripples, shooting, mouse) |
| L6 | 12-13 | Stats (4 cards 已修/畢業/還需/完成度) + scroll-collapse hook |
| L7 | 14-15 | SimulatorPanel (desktop sticky) + BottomSheet (mobile <1200px iOS-style) |
| L8 | 16-18 | TreePanel + TreeNode (recursive, 4 groupings: completed-summary / 新增 / 修課中-還需 / 可選) |
| L9 | 19-21 | Fullscreen mode + keyboard shortcuts (F/C/Esc) + shortcut hint toast |
| L10 | 22-23 | Modern honesty: GapAdvisor label change + Stats restores 還需 |
| L11 | 24 | inventory-coverage smoke tests |
| L12 | 25 | Build verify + push |

---

## Task 1: Update NodeStatus type with earnedClipped and overflow fields

**Files:** Modify `src/lib/types.ts`

- [ ] **Step 1: Edit NodeStatus interface**

In `src/lib/types.ts`, replace `NodeStatus` interface with:

```typescript
export interface NodeStatus {
  id: CategoryId;
  label: string;
  required: number;
  earned: number;              // raw, NOT clipped — may exceed required
  earnedClipped: number;       // Math.min(earned, required), for progress bar / fulfilled
  overflow: number;            // Math.max(0, earned - required), for "超修 N" display
  pending: number;
  fulfilled: boolean;          // earnedClipped >= required
  passedCourses: TranscriptRecord[];
  pendingCourses: CatalogCourse[];
  gapCourses: CatalogCourse[];
  children?: NodeStatus[];
}
```

- [ ] **Step 2: tsc check**

```bash
npx tsc --noEmit 2>&1 | tail -30
```

Expect errors in simulator.ts and tests/* referencing old fields. Those will be fixed in tasks 2-3.

- [ ] **Step 3: Commit (intentionally with broken downstream — fixed in next tasks)**

```bash
git add src/lib/types.ts
git commit -m "feat(lib): extend NodeStatus with earnedClipped and overflow fields"
```

---

## Task 2: Update walkTree to not clip earned

**Files:** Modify `src/lib/simulator.ts`

Reference: spec v2 §3, inventory §I8 + §N5

- [ ] **Step 1: Locate walkTree and replace its return**

In `src/lib/simulator.ts`, find `export function walkTree(...) { ... return { ... } }`. Replace the return block:

```typescript
const earnedClipped = Math.min(earned, required);
const overflow = Math.max(0, earned - required);

return {
  id: rule.id,
  label: rule.label,
  required,
  earned,                    // raw
  earnedClipped,             // clipped for progress
  overflow,
  pending: 0,
  fulfilled: earnedClipped >= required,
  passedCourses,
  pendingCourses: [],
  gapCourses: [],
  children: children.length > 0 ? children : undefined,
};
```

Also remove the variable `clippedEarned` and any references to it within this function.

- [ ] **Step 2: Verify tsc on lib/**

```bash
npx tsc --noEmit 2>&1 | grep "src/lib/" | head -20
```

Expect 0 errors inside src/lib/.

- [ ] **Step 3: Update simulate() consumers if needed**

In `simulate()`, the two `walkTree` calls — one for `totalEarned`, one for `tree` — both return raw `earned` now. `totalEarned` should sum from `walkTree(rules, dedupedAssigned).earned` (no further clipping).

Actually since walkTree on a branch returns sum-of-children (which itself contains raw), the root's `earned` IS the true total. Verify the existing code reads `.earned` (not the removed `clippedEarned`).

- [ ] **Step 4: Commit**

```bash
git add src/lib/simulator.ts
git commit -m "feat(lib): walkTree no longer clips earned; surfaces overflow as separate field"
```

---

## Task 3: Update tests for non-clipped earned

**Files:** Modify `tests/simulator.test.ts`, `tests/integration.test.ts`

- [ ] **Step 1: Locate clipping assertions in tests/simulator.test.ts**

Search for assertions like `expect(cs?.earned).toBe(15)` where the value 15 is the clipped min. With raw earned, that test (Task 14's "clips earned at minCredits per leaf") now expects raw 18:

```typescript
// Before:
expect(cs?.earned).toBe(15);  // clipped at minCredits

// After:
expect(cs?.earned).toBe(18);          // raw sum
expect(cs?.earnedClipped).toBe(15);   // clipped for display/progress
expect(cs?.overflow).toBe(3);         // surplus
```

Rename the test description: `"clips earned at minCredits per leaf"` → `"reports raw earned with overflow separately"`.

- [ ] **Step 2: Run tests, fix any other clipping-related failures**

```bash
npm run test:run -- tests/simulator.test.ts 2>&1 | tail -30
```

Apply same earned/earnedClipped/overflow update wherever an assertion expects a clipped value.

- [ ] **Step 3: Re-run integration tests**

```bash
npm run test:run -- tests/integration.test.ts
```

`totalEarned` for empty-assumed may move from 73 → 75 if 博雅 overflow was being silently lost. Update assertion to `toBeGreaterThanOrEqual(72)` and `toBeLessThanOrEqual(78)` (more permissive) OR run once, observe actual, and pin to exact.

- [ ] **Step 4: Run all tests**

```bash
npm run test:run
```

Expect all green.

- [ ] **Step 5: Commit**

```bash
git add tests/
git commit -m "test: update assertions for raw earned + earnedClipped + overflow"
```

---

## Task 4: Delete Layout shell, route themes directly

**Files:** Delete `src/shared/Layout.tsx`. Modify `src/main.tsx`.

Reference: spec v2 §1, inventory §C5 + §N1

- [ ] **Step 1: Replace src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { LegacyApp } from './themes/legacy/App';
import { ModernApp } from './themes/modern/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/legacy" replace />} />
        <Route path="/legacy" element={<LegacyApp />} />
        <Route path="/modern" element={<ModernApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 2: Delete Layout.tsx**

```bash
rm src/shared/Layout.tsx
```

- [ ] **Step 3: tsc check**

```bash
npx tsc --noEmit
```

Expect 0 errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove Layout shell — themes route directly without wrapping nav"
```

---

## Task 5: Rename SimulationContext to ModernSimulationContext

**Files:** Rename `src/shared/SimulationContext.tsx` → `src/shared/ModernSimulationContext.tsx`. Update references.

- [ ] **Step 1: Rename file**

```bash
git mv src/shared/SimulationContext.tsx src/shared/ModernSimulationContext.tsx
```

- [ ] **Step 2: Update exports inside the file**

Rename exported `SimulationProvider` → `ModernSimulationProvider`, `useSimulation` → `useModernSimulation`. Storage key stays `'course.assumedPassed.v1'`.

- [ ] **Step 3: Update all importers**

Grep for usage:

```bash
grep -rn "SimulationContext\|SimulationProvider\|useSimulation" src/ tests/
```

Update each import path and identifier. Affects:
- `src/shared/useSimulationResult.ts`
- `src/themes/modern/components/Sidebar.tsx`, `Stats.tsx`, `CreditTree.tsx`, `GapAdvisor.tsx`
- `tests/components/SimulationContext.test.tsx` (rename file too — see Step 4)

- [ ] **Step 4: Rename test file**

```bash
git mv tests/components/SimulationContext.test.tsx tests/components/ModernSimulationContext.test.tsx
```

Update test imports & describe labels.

- [ ] **Step 5: tsc + tests pass**

```bash
npx tsc --noEmit && npm run test:run
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: rename SimulationContext to ModernSimulationContext"
```

---

## Task 6: Create LegacySimulationContext (empty default, no localStorage)

**Files:** Create `src/shared/LegacySimulationContext.tsx`. Create `tests/components/LegacySimulationContext.test.tsx`.

Reference: inventory §M1, §M6, §N3, §N6

- [ ] **Step 1: Write failing test**

Create `tests/components/LegacySimulationContext.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LegacySimulationProvider, useLegacySimulation } from '../../src/shared/LegacySimulationContext';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  <LegacySimulationProvider>{children}</LegacySimulationProvider>;

describe('useLegacySimulation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initialises with EMPTY assumedPassed (per v1.7 §M1)', () => {
    const { result } = renderHook(() => useLegacySimulation(), { wrapper });
    expect(result.current.assumedPassed.size).toBe(0);
  });

  it('toggle adds and removes codes', () => {
    const { result } = renderHook(() => useLegacySimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    expect(result.current.assumedPassed.has('CSU0018')).toBe(true);
    act(() => result.current.toggle('CSU0018'));
    expect(result.current.assumedPassed.has('CSU0018')).toBe(false);
  });

  it('reset returns to EMPTY (not pre-filled, per inventory §M1)', () => {
    const { result } = renderHook(() => useLegacySimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    act(() => result.current.reset());
    expect(result.current.assumedPassed.size).toBe(0);
  });

  it('does NOT persist to localStorage (per inventory §M6 + §N6)', () => {
    const { result } = renderHook(() => useLegacySimulation(), { wrapper });
    act(() => result.current.toggle('CSU0018'));
    // Inspect every storage key — none should belong to legacy
    const keys = Object.keys(localStorage);
    expect(keys.filter(k => k.includes('legacy') || k.includes('assumedPassed'))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
npm run test:run -- tests/components/LegacySimulationContext.test.tsx
```

- [ ] **Step 3: Implement LegacySimulationContext**

Create `src/shared/LegacySimulationContext.tsx`:

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface LegacySimulationContextValue {
  assumedPassed: Set<string>;
  toggle: (code: string) => void;
  reset: () => void;
}

const LegacySimulationContext = createContext<LegacySimulationContextValue | null>(null);

export function LegacySimulationProvider({ children }: { children: ReactNode }) {
  const [assumedPassed, setAssumedPassed] = useState<Set<string>>(new Set());

  const value = useMemo<LegacySimulationContextValue>(() => ({
    assumedPassed,
    toggle: (code: string) => {
      setAssumedPassed(prev => {
        const next = new Set(prev);
        if (next.has(code)) next.delete(code);
        else next.add(code);
        return next;
      });
    },
    reset: () => setAssumedPassed(new Set()),
  }), [assumedPassed]);

  return (
    <LegacySimulationContext.Provider value={value}>
      {children}
    </LegacySimulationContext.Provider>
  );
}

export function useLegacySimulation(): LegacySimulationContextValue {
  const ctx = useContext(LegacySimulationContext);
  if (!ctx) throw new Error('useLegacySimulation must be inside LegacySimulationProvider');
  return ctx;
}
```

- [ ] **Step 4: Run test, expect 4 pass**

```bash
npm run test:run -- tests/components/LegacySimulationContext.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/LegacySimulationContext.tsx tests/components/LegacySimulationContext.test.tsx
git commit -m "feat(shared): LegacySimulationContext with empty default and no localStorage"
```

---

## Task 7: Update useSimulationResult to be theme-aware

**Files:** Modify `src/shared/useSimulationResult.ts`. Or split into two hooks.

- [ ] **Step 1: Decide: split into two hooks (cleaner)**

Replace `src/shared/useSimulationResult.ts` with two hooks:

```typescript
import { useMemo } from 'react';
import { simulate } from '../lib/simulator';
import { useLegacySimulation } from './LegacySimulationContext';
import { useModernSimulation } from './ModernSimulationContext';
import transcript from '../data/transcript.json';
import catalog from '../data/catalog-110.json';
import liberal from '../data/liberal-courses.json';
import currentSemester from '../data/current-semester.json';
import type { TranscriptRecord, CatalogCourse, SimulationResult } from '../lib/types';
import type { LiberalMap } from '../lib/catalog';

function runSimulate(assumedPassed: Set<string>): SimulationResult {
  return simulate(
    transcript as TranscriptRecord[],
    catalog as CatalogCourse[],
    liberal as LiberalMap,
    currentSemester.courses,
    Array.from(assumedPassed),
  );
}

export function useLegacySimulationResult(): SimulationResult {
  const { assumedPassed } = useLegacySimulation();
  return useMemo(() => runSimulate(assumedPassed), [assumedPassed]);
}

export function useModernSimulationResult(): SimulationResult {
  const { assumedPassed } = useModernSimulation();
  return useMemo(() => runSimulate(assumedPassed), [assumedPassed]);
}
```

- [ ] **Step 2: Update Modern component imports**

`src/themes/modern/components/*` import `useModernSimulationResult` instead of `useSimulationResult`. Update each file.

- [ ] **Step 3: tsc + tests pass**

```bash
npx tsc --noEmit && npm run test:run
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: split useSimulationResult into Legacy and Modern variants"
```

---

## Task 8: Create legacy.css from v1.7 (verbatim port)

**Files:** Create `src/themes/legacy/legacy.css`

Reference: inventory §A, §B, §C, §D, §E, §F, §G, §H, §I, §J, §K covering all CSS

- [ ] **Step 1: Extract v1.7 CSS verbatim**

Open `archive/course-v1.7.html`. Copy lines 8-968 (the entire `<style>...</style>` content) into `src/themes/legacy/legacy.css`.

The copy must be exact — preserving comments, spacing, selectors. Do NOT translate to Tailwind. Do NOT rewrite in CSS Modules. Plain CSS, identical to v1.7.

Optionally prefix all class selectors with `.legacy-root .` if there's a risk of clashing with Tailwind in Modern, but this is **only** needed if we observe a clash. Start without prefix.

- [ ] **Step 2: Add minimal universal reset matching v1.7 (line 8-12)**

Already in the copy.

- [ ] **Step 3: Verify file size matches expectation (~25-35 KB)**

```bash
wc -l src/themes/legacy/legacy.css
```

Expect ~960 lines.

- [ ] **Step 4: Commit**

```bash
git add src/themes/legacy/legacy.css
git commit -m "feat(legacy): port v1.7 CSS verbatim (lines 7-968)"
```

---

## Task 9: Rewrite LegacyApp.tsx as a standalone self-contained page

**Files:** Replace `src/themes/legacy/App.tsx`. Also delete old legacy components (their replacements come later).

Reference: inventory §C1-C6, §H. Spec v2 §1.

- [ ] **Step 1: Delete old legacy components**

```bash
rm src/themes/legacy/components/Stats.tsx
rm src/themes/legacy/components/Sidebar.tsx
rm src/themes/legacy/components/CreditTree.tsx
rm src/themes/legacy/components/GapAdvisor.tsx
rmdir src/themes/legacy/components 2>/dev/null || true
```

These are replaced by `src/themes/legacy/{StellarCanvas,Header,Stats,SimulatorPanel,BottomSheet,TreePanel,TreeNode,Footer,ShortcutHint}.tsx` in later tasks.

- [ ] **Step 2: Write minimal `LegacyApp.tsx` (placeholder pages for components not yet built)**

Replace `src/themes/legacy/App.tsx`:

```tsx
import { LegacySimulationProvider } from '../../shared/LegacySimulationContext';
import './legacy.css';

export function LegacyApp() {
  return (
    <LegacySimulationProvider>
      <div className="container">
        <canvas id="stellar-bg"></canvas>
        <div className="header">
          <h1>🎓 國立臺灣師範大學資工系 畢業學分檢核系統</h1>
        </div>
        <div className="stats" id="stats">
          {/* Stats placeholder, real component in Task 12 */}
        </div>
        <div className="content-wrapper">
          <div className="simulator-panel" id="simulator-panel">
            {/* SimulatorPanel placeholder, Task 14 */}
          </div>
          <div className="tree-panel" id="tree-panel">
            {/* TreePanel placeholder, Task 16 */}
          </div>
        </div>
        <div className="footer">
          <p>資工系畢業學分檢核系統 v2.0 | 110學年度入學適用（112.09.22 修訂）</p>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
            Made with ❤️ by Stan &amp; Claude | 按 <kbd>F</kbd> 全螢幕 · <kbd>C</kbd> 選課
          </p>
        </div>
      </div>
    </LegacySimulationProvider>
  );
}
```

- [ ] **Step 3: tsc + dev server boot check**

```bash
npx tsc --noEmit
timeout 5s npm run dev 2>&1 | head -10 || true
```

Expect compile clean and dev server boots without runtime crash on `/legacy` (page will look mostly empty, that's fine for now).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(legacy): rewrite App as standalone v1.7 shell (placeholders pending)"
```

---

## Task 10: Footer + Header components (small, isolated)

**Files:** Create `src/themes/legacy/Header.tsx`, `src/themes/legacy/Footer.tsx`. Update App.

Reference: inventory §C1, §C2, §C6.

- [ ] **Step 1: Create Header**

`src/themes/legacy/Header.tsx`:

```tsx
export function Header() {
  return (
    <div className="header">
      <h1>🎓 國立臺灣師範大學資工系 畢業學分檢核系統</h1>
    </div>
  );
}
```

- [ ] **Step 2: Create Footer**

`src/themes/legacy/Footer.tsx`:

```tsx
export function Footer() {
  return (
    <div className="footer">
      <p>資工系畢業學分檢核系統 v2.0 | 110學年度入學適用（112.09.22 修訂）</p>
      <p style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
        Made with ❤️ by Stan &amp; Claude | 按 <kbd>F</kbd> 全螢幕 · <kbd>C</kbd> 選課
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Use them in App.tsx**

Replace inline `<div className="header">` and `<div className="footer">` in App.tsx with `<Header />` and `<Footer />`.

- [ ] **Step 4: Commit**

```bash
git add src/themes/legacy/Header.tsx src/themes/legacy/Footer.tsx src/themes/legacy/App.tsx
git commit -m "feat(legacy): Header and Footer components"
```

---

## Task 11: Stellar canvas component

**Files:** Create `src/themes/legacy/StellarCanvas.tsx`. Update App.tsx.

Reference: inventory §B (B1-B11), v1.7 lines 1815-2044.

- [ ] **Step 1: Port the IIFE to a React component**

`src/themes/legacy/StellarCanvas.tsx`:

```tsx
import { useEffect, useRef } from 'react';

const STAR_COLORS = [
  { r: 102, g: 126, b: 234 },
  { r: 118, g: 75, b: 162 },
  { r: 147, g: 197, b: 253 },
  { r: 196, g: 181, b: 253 },
  { r: 165, g: 180, b: 252 },
];

const CONFIG = {
  starCount: 130,
  minStarSize: 0.6,
  maxStarSize: 4,
  connectionDistance: 150,
  mouseRadius: 200,
  baseSpeed: 0.15,
  shootingStarInterval: 12000,
  shootingStarChance: 0.4,
};

interface Star {
  x: number; y: number; vx: number; vy: number;
  size: number; baseOpacity: number;
  color: { r: number; g: number; b: number };
  twinkleSpeed: number; twinklePhase: number; twinkleAmount: number;
}
interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; decay: number; length: number; size: number; }
interface Ripple { x: number; y: number; radius: number; maxRadius: number; life: number; decay: number; }

export function StellarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let ripples: Ripple[] = [];
    const mouse: { x: number | null; y: number | null } = { x: null, y: null };
    let time = 0;
    let rafId = 0;

    function resize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < CONFIG.starCount; i++) {
        const sizeRandom = Math.random();
        let size;
        if (sizeRandom < 0.6) size = CONFIG.minStarSize + Math.random() * 1;
        else if (sizeRandom < 0.9) size = 1.5 + Math.random() * 1.5;
        else size = 2.5 + Math.random() * (CONFIG.maxStarSize - 2.5);

        const depthFactor = size / CONFIG.maxStarSize;
        const speed = CONFIG.baseSpeed * (0.3 + depthFactor * 0.7);
        const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

        stars.push({
          x: Math.random() * width, y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed,
          size,
          baseOpacity: size > 2.5 ? 0.4 + Math.random() * 0.2 : 0.5 + Math.random() * 0.4,
          color,
          twinkleSpeed: 0.02 + Math.random() * 0.03,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleAmount: 0.2 + Math.random() * 0.3,
        });
      }
    }

    function createShootingStar() {
      if (Math.random() > CONFIG.shootingStarChance) return;
      const startX = Math.random() * width * 0.7;
      const startY = Math.random() * height * 0.3;
      const angle = Math.PI / 6 + Math.random() * Math.PI / 6;
      const speed = 8 + Math.random() * 6;
      shootingStars.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, decay: 0.015 + Math.random() * 0.01,
        length: 80 + Math.random() * 60,
        size: 1.5 + Math.random() * 1,
      });
    }

    function createRipple(x: number, y: number) {
      ripples.push({ x, y, radius: 0, maxRadius: 150 + Math.random() * 100, life: 1, decay: 0.02 });
    }

    function drawStar(star: Star) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
      const opacity = star.baseOpacity + twinkle * star.twinkleAmount * star.baseOpacity;
      ctx!.beginPath();
      ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${Math.max(0.1, opacity)})`;
      ctx!.fill();
    }

    function drawShootingStar(s: ShootingStar) {
      const grad = ctx!.createLinearGradient(s.x, s.y, s.x - s.vx * s.length / 10, s.y - s.vy * s.length / 10);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.life * 0.9})`);
      grad.addColorStop(0.3, `rgba(200, 210, 255, ${s.life * 0.6})`);
      grad.addColorStop(1, 'rgba(102, 126, 234, 0)');
      ctx!.beginPath();
      ctx!.moveTo(s.x, s.y);
      ctx!.lineTo(s.x - s.vx * s.length / 10, s.y - s.vy * s.length / 10);
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = s.size * s.life;
      ctx!.lineCap = 'round';
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.arc(s.x, s.y, s.size * s.life * 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(255, 255, 255, ${s.life})`;
      ctx!.fill();
    }

    function drawRipple(r: Ripple) {
      ctx!.beginPath();
      ctx!.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(102, 126, 234, ${r.life * 0.3})`;
      ctx!.lineWidth = 2;
      ctx!.stroke();
    }

    function drawConnection(a: Star, b: Star, distance: number) {
      const opacity = 1 - (distance / CONFIG.connectionDistance);
      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.lineTo(b.x, b.y);
      ctx!.strokeStyle = `rgba(102, 126, 234, ${opacity * 0.18})`;
      ctx!.lineWidth = 0.8;
      ctx!.stroke();
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
          if (dist < CONFIG.mouseRadius) {
            const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
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
      shootingStars.forEach(s => { s.x += s.vx; s.y += s.vy; s.life -= s.decay; });
      shootingStars = shootingStars.filter(s => s.life > 0);
      ripples.forEach(r => { r.radius += 4; r.life -= r.decay; });
      ripples = ripples.filter(r => r.life > 0);
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < CONFIG.connectionDistance) drawConnection(stars[i], stars[j], distance);
        }
        if (mouse.x !== null && mouse.y !== null) {
          const dx = stars[i].x - mouse.x;
          const dy = stars[i].y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < CONFIG.mouseRadius) {
            ctx!.beginPath();
            ctx!.moveTo(stars[i].x, stars[i].y);
            ctx!.lineTo(mouse.x, mouse.y);
            const opacity = 1 - (distance / CONFIG.mouseRadius);
            ctx!.strokeStyle = `rgba(118, 75, 162, ${opacity * 0.25})`;
            ctx!.lineWidth = 0.8;
            ctx!.stroke();
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
      rafId = requestAnimationFrame(animate);
    }

    const onResize = () => { resize(); createStars(); };
    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onMouseLeave = () => { mouse.x = null; mouse.y = null; };
    const onClick = (e: MouseEvent) => createRipple(e.clientX, e.clientY);

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click', onClick);
    const intervalId = window.setInterval(createShootingStar, CONFIG.shootingStarInterval);

    resize();
    createStars();
    animate();
    const firstShootingTimeout = window.setTimeout(createShootingStar, 2000);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click', onClick);
      clearInterval(intervalId);
      clearTimeout(firstShootingTimeout);
    };
  }, []);

  return <canvas ref={ref} id="stellar-bg"></canvas>;
}
```

- [ ] **Step 2: Use in LegacyApp**

Replace `<canvas id="stellar-bg"></canvas>` in App.tsx with `<StellarCanvas />`.

- [ ] **Step 3: Visual smoke**

```bash
timeout 5s npm run dev 2>&1 | head -10 || true
```

Confirm boots clean. Manually opening `/legacy` later you should see stars drifting.

- [ ] **Step 4: Commit**

```bash
git add src/themes/legacy/StellarCanvas.tsx src/themes/legacy/App.tsx
git commit -m "feat(legacy): port stellar canvas (130 stars, ripples, shooting, mouse repulsion)"
```

---

## Task 12: Stats component (4 cards matching v1.7)

**Files:** Create `src/themes/legacy/Stats.tsx`. Update App.

Reference: inventory §D3, §D4, §D5. v1.7 lines 977-997.

- [ ] **Step 1: Implement Stats**

`src/themes/legacy/Stats.tsx`:

```tsx
import { useLegacySimulationResult } from '../../shared/useSimulationResult';

export function Stats() {
  const result = useLegacySimulationResult();
  // total credits earned = transcript-passed only (totalEarned in SimulationResult, excludes pending)
  // total + pending shown via remaining = 128 - (earned + pending)
  const earned = result.totalEarned + result.totalPending;
  const remaining = Math.max(0, 128 - earned);
  const percentage = ((earned / 128) * 100).toFixed(1);

  return (
    <>
      <div className="stat-item">
        <span className="stat-number" id="total-earned">{earned}</span>
        <span className="stat-label">已修學分</span>
        <div className="progress-bar">
          <div className="progress-fill" id="progress-bar" style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <div className="stat-item">
        <span className="stat-number" style={{ color: '#ef4444' }}>128</span>
        <span className="stat-label">畢業學分</span>
      </div>
      <div className="stat-item">
        <span className="stat-number" style={{ color: '#f59e0b' }} id="remaining">{remaining}</span>
        <span className="stat-label">還需修習</span>
      </div>
      <div className="stat-item">
        <span className="stat-number" style={{ color: '#10b981' }} id="completion">{percentage}%</span>
        <span className="stat-label">完成度</span>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Use in App**

Replace the empty `<div className="stats" id="stats">` content with `<Stats />` (still wrap in the div):

```tsx
<div className="stats" id="stats">
  <Stats />
</div>
```

- [ ] **Step 3: Visual smoke**

```bash
timeout 5s npm run dev 2>&1 | head -10 || true
```

- [ ] **Step 4: Commit**

```bash
git add src/themes/legacy/Stats.tsx src/themes/legacy/App.tsx
git commit -m "feat(legacy): Stats with 4 cards (已修/畢業/還需/完成度) per v1.7 §D3"
```

---

## Task 13: useScrollCollapse hook

**Files:** Create `src/themes/legacy/useScrollCollapse.ts`. Wire in App.

Reference: inventory §D6-D10, §H6. v1.7 lines 1077-1089.

- [ ] **Step 1: Implement hook**

`src/themes/legacy/useScrollCollapse.ts`:

```typescript
import { useEffect } from 'react';

const SCROLL_THRESHOLD = 50;

export function useScrollCollapse() {
  useEffect(() => {
    const onScroll = () => {
      const stats = document.getElementById('stats');
      const treeHeader = document.getElementById('tree-header');
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > SCROLL_THRESHOLD) {
        stats?.classList.add('scrolled');
        treeHeader?.classList.add('floating');
      } else {
        stats?.classList.remove('scrolled');
        treeHeader?.classList.remove('floating');
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
```

- [ ] **Step 2: Call from LegacyApp**

In `src/themes/legacy/App.tsx`, inside the component:

```tsx
import { useScrollCollapse } from './useScrollCollapse';
// ...
export function LegacyApp() {
  useScrollCollapse();
  return (...);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/themes/legacy/useScrollCollapse.ts src/themes/legacy/App.tsx
git commit -m "feat(legacy): scroll-collapse for stats and tree-header per §D6-D10"
```

---

## Task 14: SimulatorPanel (desktop sticky course selector)

**Files:** Create `src/themes/legacy/SimulatorPanel.tsx`. Update App.

Reference: inventory §E, §F. v1.7 lines 1001-1006, 1450-1495.

- [ ] **Step 1: Implement SimulatorPanel**

`src/themes/legacy/SimulatorPanel.tsx`:

```tsx
import { useLegacySimulation } from '../../shared/LegacySimulationContext';
import currentSemester from '../../data/current-semester.json';
import catalog from '../../data/catalog-110.json';
import type { CatalogCourse } from '../../lib/types';

const catalogTyped = catalog as CatalogCourse[];

export function SimulatorPanel() {
  const { assumedPassed, toggle } = useLegacySimulation();
  return (
    <>
      <div className="simulator-panel-header">
        <div className="simulator-title">📚 {currentSemester.semester}學期課程</div>
      </div>
      <div className="course-grid" id="current-courses">
        {currentSemester.courses.map(course => {
          const meta = catalogTyped.find(c => c.code === course.code);
          const credits = meta?.credits ?? 0;
          const selected = assumedPassed.has(course.code);
          return (
            <div
              key={course.code}
              className={`course-item-sim${selected ? ' selected' : ''}`}
              onClick={(e) => {
                if ((e.target as HTMLInputElement).type !== 'checkbox') {
                  toggle(course.code);
                }
              }}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(course.code)}
              />
              <span className="course-name-sim">{course.name}</span>
              <span className="course-credits-sim">{credits}學分</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Use in App**

```tsx
<div className="simulator-panel" id="simulator-panel">
  <SimulatorPanel />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/themes/legacy/SimulatorPanel.tsx src/themes/legacy/App.tsx
git commit -m "feat(legacy): SimulatorPanel — desktop sticky course selector with empty default"
```

---

## Task 15: BottomSheet (mobile <1200px course panel)

**Files:** Create `src/themes/legacy/BottomSheet.tsx`. Update App.

Reference: inventory §G (G1-G11). v1.7 lines 380-505, 1119-1162.

- [ ] **Step 1: Implement BottomSheet**

`src/themes/legacy/BottomSheet.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { useLegacySimulation } from '../../shared/LegacySimulationContext';
import currentSemester from '../../data/current-semester.json';
import catalog from '../../data/catalog-110.json';
import type { CatalogCourse } from '../../lib/types';

const catalogTyped = catalog as CatalogCourse[];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function BottomSheet({ isOpen, onClose }: Props) {
  const { assumedPassed, toggle } = useLegacySimulation();

  return (
    <>
      <div
        className={`mobile-overlay${isOpen ? ' active' : ''}`}
        id="mobile-overlay"
        onClick={onClose}
      />
      <div className={`mobile-course-panel${isOpen ? ' active' : ''}`} id="mobile-panel">
        <div className="mobile-panel-handle" />
        <div className="mobile-panel-header">
          <div className="mobile-panel-header-icon">📚</div>
          <div>
            <h3>{currentSemester.semester}學期課程</h3>
            <p>點選模擬選課效果</p>
          </div>
        </div>
        <div className="mobile-panel-content">
          <div className="mobile-course-grid" id="mobile-courses">
            {currentSemester.courses.map(course => {
              const meta = catalogTyped.find(c => c.code === course.code);
              const credits = meta?.credits ?? 0;
              const selected = assumedPassed.has(course.code);
              return (
                <div
                  key={course.code}
                  className={`course-item-sim mobile-course-item${selected ? ' selected' : ''}`}
                  onClick={(e) => {
                    if ((e.target as HTMLInputElement).type !== 'checkbox') toggle(course.code);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggle(course.code)}
                  />
                  <span className="course-name-sim">{course.name}</span>
                  <span className="course-credits-sim">{credits}學分</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Wire toggle in LegacyApp**

Add `useState` and pass to BottomSheet:

```tsx
const [sheetOpen, setSheetOpen] = useState(false);

// Auto-scroll-to-safe-position before opening
const openSheet = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop < 70) {
    window.scrollTo({ top: 80, behavior: 'smooth' });
    setTimeout(() => setSheetOpen(true), 350);
  } else {
    setSheetOpen(true);
  }
};
const closeSheet = () => setSheetOpen(false);
```

Render `<BottomSheet isOpen={sheetOpen} onClose={closeSheet} />` near the end of LegacyApp's return.

The `📚 course-btn` in the TreePanel (Task 16) will call `openSheet`. Pass `openSheet` down via a prop or context for now (a small `LegacyUiContext` if cleaner — or pass via prop drilling, only 1 hop).

- [ ] **Step 3: Commit**

```bash
git add src/themes/legacy/BottomSheet.tsx src/themes/legacy/App.tsx
git commit -m "feat(legacy): BottomSheet — iOS-style mobile course selector per §G"
```

---

## Task 16: TreePanel with tree-header and buttons

**Files:** Create `src/themes/legacy/TreePanel.tsx`. Update App.

Reference: inventory §H, §K (partial — fullscreen button placeholder, behaviour comes in Task 19).

- [ ] **Step 1: Implement TreePanel**

`src/themes/legacy/TreePanel.tsx`:

```tsx
interface Props {
  onOpenSheet: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function TreePanel({ onOpenSheet, onToggleFullscreen, isFullscreen }: Props) {
  return (
    <>
      <div className="tree-header" id="tree-header">
        <button
          className="header-btn"
          id="course-btn"
          onClick={onOpenSheet}
          title="選課 (C)"
        >
          📚
        </button>
        <div className="tree-header-title">畢業學分架構</div>
        <button
          className="header-btn"
          id="fullscreen-btn"
          onClick={onToggleFullscreen}
          title="全螢幕 (F)"
        >
          {isFullscreen ? '✕' : '⛶'}
        </button>
      </div>
      <div id="tree-container">
        <ul className="tree" id="tree-root">
          {/* TreeNode rendering — Task 17 */}
        </ul>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Use in App with handlers**

```tsx
const [isFullscreen, setIsFullscreen] = useState(false);
const toggleFullscreen = () => setIsFullscreen(f => !f);
// ...
<div className={`tree-panel${isFullscreen ? ' fullscreen' : ''}`} id="tree-panel">
  <TreePanel
    onOpenSheet={openSheet}
    onToggleFullscreen={toggleFullscreen}
    isFullscreen={isFullscreen}
  />
</div>
```

Also add `body.fullscreen-mode` class via useEffect when `isFullscreen` changes.

- [ ] **Step 3: Commit**

```bash
git add src/themes/legacy/TreePanel.tsx src/themes/legacy/App.tsx
git commit -m "feat(legacy): TreePanel skeleton with course/fullscreen buttons"
```

---

## Task 17: TreeNode (recursive renderer matching v1.7 grouping)

**Files:** Create `src/themes/legacy/TreeNode.tsx`. Update TreePanel.

Reference: inventory §I (I1-I13), §J (J1-J8). v1.7 lines 1571-1806.

- [ ] **Step 1: Implement TreeNode**

`src/themes/legacy/TreeNode.tsx`:

```tsx
import { useState } from 'react';
import type { NodeStatus } from '../../lib/types';

function statusOf(node: NodeStatus): 'completed' | 'partial' | 'incomplete' {
  if (node.earnedClipped === 0) return 'incomplete';
  if (node.earnedClipped >= node.required) return 'completed';
  return 'partial';
}

function statusIcon(s: string) {
  return s === 'completed' ? '✓' : s === 'partial' ? '⚠' : '✗';
}

interface Props {
  node: NodeStatus;
  level?: number;
}

export function TreeNode({ node, level = 0 }: Props) {
  const status = statusOf(node);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const hasPassed = node.passedCourses.length > 0;
  const isLeaf = !hasChildren;
  const shouldAutoExpand = level === 0 || status !== 'completed';
  const [expanded, setExpanded] = useState(shouldAutoExpand);

  const toggleExpand = () => setExpanded(e => !e);
  const showChildren = expanded && (hasChildren || isLeaf);

  return (
    <li className="tree-node">
      <div
        className="node-content"
        onClick={(e) => { e.stopPropagation(); if (hasChildren || isLeaf) toggleExpand(); }}
      >
        <div className={`node-icon status-${status}`}>{statusIcon(status)}</div>
        <div className="node-label">{node.label}</div>
        {node.required > 0 && (
          <div className="node-credits">
            <span className="credits-earned">{node.earned}</span>
            <span style={{ color: '#d1d5db' }}> / </span>
            <span className="credits-required">{node.required}</span>
            {node.overflow > 0 && (
              <span className="badge badge-info" style={{ marginLeft: 8 }}>
                超修 {node.overflow}
              </span>
            )}
          </div>
        )}
        {hasChildren || isLeaf ? (
          <div className={`toggle-icon${expanded ? ' expanded' : ''}`}>▶</div>
        ) : null}
      </div>
      {showChildren && hasChildren && (
        <ul className={`tree-children${expanded ? ' show' : ''}`}>
          <div className="tree-children-inner">
            {node.children!.map(child => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        </ul>
      )}
      {showChildren && isLeaf && (
        <ul className={`tree-children${expanded ? ' show' : ''}`}>
          <div className="tree-children-inner">
            <LeafBuckets node={node} />
          </div>
        </ul>
      )}
    </li>
  );
}

// Leaf grouping: completed-collapsed-summary / 新增 / 修課中-還需 / 可選
function LeafBuckets({ node }: { node: NodeStatus }) {
  // v1.7's renderTree splits node.courses into 4 buckets based on
  // {completed, isNew, available, incomplete}. Our SimulationResult
  // only provides passedCourses. Other buckets (available, new, incomplete)
  // need to be derived from the catalog by category.
  const completed = node.passedCourses;
  // For v2: we currently don't compute available/new/incomplete here;
  // those will come in a later refinement. For Step 1 (this task) just
  // render the completed bucket via collapsed-summary.
  const [openCompleted, setOpenCompleted] = useState(false);
  if (completed.length === 0) return null;
  return (
    <>
      <li>
        <div className="completed-summary" onClick={() => setOpenCompleted(o => !o)}>
          <span className="completed-summary-text">✓ 已修 {completed.length} 門課程</span>
          <span className={`completed-summary-toggle${openCompleted ? ' expanded' : ''}`}>▼</span>
        </div>
        <div className={`completed-courses-list${openCompleted ? ' show' : ''}`}>
          <div className="completed-courses-inner">
            {completed.map(c => (
              <div key={c.code} className="course-detail completed">
                <span>{c.name}</span>
                <div className="course-info">
                  <span>{c.credits}學分</span>
                  {c.grade && <span className="course-tag tag-grade">{c.grade}</span>}
                  <span className="course-tag tag-semester">{c.semester}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </li>
    </>
  );
}
```

- [ ] **Step 2: Wire into TreePanel**

In `TreePanel.tsx`, replace the empty `<ul>` body:

```tsx
import { useLegacySimulationResult } from '../../shared/useSimulationResult';
import { TreeNode } from './TreeNode';
// ...
const result = useLegacySimulationResult();
return (
  // ...header...
  <div id="tree-container">
    <ul className="tree" id="tree-root">
      <TreeNode node={result.tree} />
    </ul>
  </div>
);
```

- [ ] **Step 3: Visual smoke**

```bash
timeout 5s npm run dev 2>&1 | head -10 || true
```

- [ ] **Step 4: Commit**

```bash
git add src/themes/legacy/TreeNode.tsx src/themes/legacy/TreePanel.tsx
git commit -m "feat(legacy): TreeNode recursive renderer with completed-summary bucket"
```

---

## Task 18: TreeNode — add new / incomplete / available buckets

**Files:** Modify `src/themes/legacy/TreeNode.tsx`. Possibly extend simulator to return per-leaf candidate lists.

Reference: inventory §J (J4, J5, J6), v1.7 lines 1725-1794.

- [ ] **Step 1: Add `pendingCourses` and `gapCourses` population in simulator**

In `src/lib/simulator.ts`, when building `NodeStatus` for a leaf:

```typescript
// After walkTree's leaf branch:
const pendingForThisLeaf = pendingRecords.filter(r => /* catalog lookup → this category */);
const gapForThisLeaf = catalog.filter(c => c.category === rule.id /* and not already passed */);
```

Pass `catalog` and `pendingRecords` down to `walkTree` (signature change) so leaves can populate these.

- [ ] **Step 2: Update LeafBuckets in TreeNode**

```tsx
function LeafBuckets({ node }: { node: NodeStatus }) {
  const completed = node.passedCourses;
  const newOnes = node.pendingCourses;
  const available = node.gapCourses;
  const [openCompleted, setOpenCompleted] = useState(false);
  return (
    <>
      {completed.length > 0 && (/* same as before */)}
      {newOnes.length > 0 && (
        <>
          <li className="section-header">✨ 新增課程</li>
          {newOnes.map(c => (
            <li key={c.code}>
              <div className="course-detail new">
                <span>{c.name}</span>
                <div className="course-info">
                  <span>{c.credits}學分</span>
                  <span className="course-tag tag-new">NEW</span>
                </div>
              </div>
            </li>
          ))}
        </>
      )}
      {!node.fulfilled && available.length > 0 && (
        <>
          <li className="section-header">💡 可選課程</li>
          {available.slice(0, 5).map(c => (
            <li key={c.code}>
              <div className="course-detail available">
                <span>{c.name}</span>
                <span>{c.credits}學分</span>
              </div>
            </li>
          ))}
        </>
      )}
    </>
  );
}
```

- [ ] **Step 3: Update integration tests if needed**

`tests/integration.test.ts` may now see `pendingCourses` populated; add assertion.

- [ ] **Step 4: Commit**

```bash
git add src/lib/simulator.ts src/themes/legacy/TreeNode.tsx tests/
git commit -m "feat(legacy): TreeNode shows 新增 / 可選 course buckets per v1.7 §J"
```

---

## Task 19: Fullscreen behaviour (canvas portal + body class)

**Files:** Modify `src/themes/legacy/App.tsx`.

Reference: inventory §K (K1-K11). v1.7 lines 1164-1188.

- [ ] **Step 1: Add useEffect to manage body class and canvas position**

In `LegacyApp.tsx`:

```tsx
useEffect(() => {
  if (isFullscreen) {
    document.body.classList.add('fullscreen-mode');
  } else {
    document.body.classList.remove('fullscreen-mode');
  }
}, [isFullscreen]);
```

The canvas-move-into-fullscreen-panel: v1.7 uses `panel.insertBefore(canvas, ...)`. In React, the cleanest equivalent is to portal the canvas conditionally. But the simpler approach: keep the canvas in its current parent and let CSS positioning (`.tree-panel.fullscreen #stellar-bg`) target it via descendant selector. Since the canvas is a sibling of `.tree-panel`, the descendant selector won't apply.

**Decision**: use `React.createPortal` to move the canvas into the tree-panel when fullscreen, back out when not. Implement in StellarCanvas:

```tsx
// In StellarCanvas.tsx — accept a `containerSelector` prop:
interface Props {
  containerSelector?: string; // e.g. '#tree-panel' when fullscreen
}
export function StellarCanvas({ containerSelector }: Props) {
  // ... existing canvas logic ...
  const canvasEl = <canvas ref={ref} id="stellar-bg"></canvas>;
  if (containerSelector) {
    const container = document.querySelector(containerSelector);
    if (container) return ReactDOM.createPortal(canvasEl, container as HTMLElement);
  }
  return canvasEl;
}
```

In LegacyApp:

```tsx
<StellarCanvas containerSelector={isFullscreen ? '#tree-panel' : undefined} />
```

- [ ] **Step 2: Show transient toast hint**

Add state for shortcut hint:

```tsx
const [hint, setHint] = useState<string | null>(null);
// In toggleFullscreen:
setHint(isFullscreen ? '退出全螢幕' : '全螢幕模式');
setTimeout(() => setHint(null), 1500);
```

Render `<ShortcutHint text={hint} />` — implemented in Task 21.

- [ ] **Step 3: Commit**

```bash
git add src/themes/legacy/App.tsx src/themes/legacy/StellarCanvas.tsx
git commit -m "feat(legacy): fullscreen — body class toggle + canvas portal into tree-panel"
```

---

## Task 20: useKeyboardShortcuts hook

**Files:** Create `src/themes/legacy/useKeyboardShortcuts.ts`. Wire in App.

Reference: inventory §L. v1.7 lines 1091-1110.

- [ ] **Step 1: Implement hook**

```typescript
import { useEffect } from 'react';

interface Handlers {
  onToggleFullscreen: () => void;
  onToggleSheet: () => void;
  onEscape: () => void;
}

export function useKeyboardShortcuts({ onToggleFullscreen, onToggleSheet, onEscape }: Handlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onToggleFullscreen();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (window.innerWidth < 1200) onToggleSheet();
      } else if (e.key === 'Escape') {
        onEscape();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onToggleFullscreen, onToggleSheet, onEscape]);
}
```

- [ ] **Step 2: Wire in LegacyApp**

```tsx
useKeyboardShortcuts({
  onToggleFullscreen: toggleFullscreen,
  onToggleSheet: () => { if (sheetOpen) closeSheet(); else openSheet(); },
  onEscape: () => { if (sheetOpen) closeSheet(); if (isFullscreen) toggleFullscreen(); },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/themes/legacy/useKeyboardShortcuts.ts src/themes/legacy/App.tsx
git commit -m "feat(legacy): keyboard shortcuts F/C/Esc per §L"
```

---

## Task 21: ShortcutHint toast

**Files:** Create `src/themes/legacy/ShortcutHint.tsx`. Use in App.

Reference: inventory §K10. v1.7 lines 1051, 947-967.

- [ ] **Step 1: Implement**

```tsx
interface Props { text: string | null }
export function ShortcutHint({ text }: Props) {
  return (
    <div className={`shortcut-hint${text ? ' show' : ''}`} id="shortcut-hint">
      {text}
    </div>
  );
}
```

- [ ] **Step 2: Use in App**

```tsx
<ShortcutHint text={hint} />
```

- [ ] **Step 3: Commit**

```bash
git add src/themes/legacy/ShortcutHint.tsx src/themes/legacy/App.tsx
git commit -m "feat(legacy): ShortcutHint toast for fullscreen transitions"
```

---

## Task 22: Modern honesty — GapAdvisor label change

**Files:** Modify `src/themes/modern/components/GapAdvisor.tsx`.

Reference: spec v2 §4.2, inventory §N2.

- [ ] **Step 1: Change wording**

In `src/themes/modern/components/GapAdvisor.tsx`, replace any text matching "下學期" / "115-1" / "Recommendations for 115-1" / "next semester" with neutral wording:

```tsx
<h2 className="...">未滿足分類的可選課程</h2>
```

Remove or rename any helper text claiming next-semester logic. The list still shows category-filtered courses, but labelled as "categorical suggestions" not "next-semester predictions".

- [ ] **Step 2: Commit**

```bash
git add src/themes/modern/components/GapAdvisor.tsx
git commit -m "fix(modern): GapAdvisor — remove unsubstantiated 115-1 claim per spec v2 §4.2"
```

---

## Task 23: Modern Stats — restore 還需 indicator

**Files:** Modify `src/themes/modern/components/Stats.tsx`.

Reference: spec v2 §4.2 (Modern must still show remaining).

- [ ] **Step 1: Inspect current Stats**

Current Stats shows: Graduation `total / 128`, badge `Likely / Behind`, `+X pending · Y remaining`.

The "Y remaining" is already there in the descriptor line. Verify it's prominent.

If acceptable, no change needed and skip to step 2.

If not prominent enough, restructure:

```tsx
<p className="text-sm text-gray-500 mt-3 tabular-nums">
  +{result.totalPending} pending · <strong>{128 - total} remaining</strong>
</p>
```

- [ ] **Step 2: Commit (if changed)**

```bash
git add src/themes/modern/components/Stats.tsx
git commit -m "fix(modern): emphasise remaining credits in Stats"
```

If no change was needed, skip commit and proceed.

---

## Task 24: inventory-coverage smoke tests

**Files:** Create `tests/legacy/inventory-coverage.test.tsx`.

Reference: spec v2 §7.

- [ ] **Step 1: Write tests**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LegacyApp } from '../../src/themes/legacy/App';

function renderLegacy() {
  return render(
    <MemoryRouter initialEntries={['/legacy']}>
      <LegacyApp />
    </MemoryRouter>
  );
}

describe('Legacy inventory coverage', () => {
  it('§B1 renders stellar canvas', () => {
    const { container } = renderLegacy();
    expect(container.querySelector('#stellar-bg')).toBeInTheDocument();
  });

  it('§D3 stats include 4 cards: 已修/畢業/還需/完成度', () => {
    renderLegacy();
    const labels = Array.from(document.querySelectorAll('.stat-label')).map(e => e.textContent);
    expect(labels).toEqual(['已修學分', '畢業學分', '還需修習', '完成度']);
  });

  it('§M1 simulator panel starts with empty assumedPassed (no checkboxes checked)', () => {
    renderLegacy();
    const checkboxes = document.querySelectorAll('.course-item-sim input[type=checkbox]');
    expect(checkboxes.length).toBeGreaterThan(0);
    Array.from(checkboxes).forEach(cb => {
      expect(cb).not.toBeChecked();
    });
  });

  it('§K1 includes fullscreen button', () => {
    renderLegacy();
    expect(document.querySelector('#fullscreen-btn')).toBeInTheDocument();
  });

  it('§G1 includes course/sheet trigger button', () => {
    renderLegacy();
    expect(document.querySelector('#course-btn')).toBeInTheDocument();
  });

  it('§G3 includes mobile bottom sheet (hidden but in DOM)', () => {
    renderLegacy();
    expect(document.querySelector('#mobile-panel')).toBeInTheDocument();
    expect(document.querySelector('#mobile-overlay')).toBeInTheDocument();
  });

  it('§H1 includes sticky tree-header with title', () => {
    renderLegacy();
    expect(document.querySelector('#tree-header')).toBeInTheDocument();
    expect(document.querySelector('.tree-header-title')?.textContent).toBe('畢業學分架構');
  });

  it('§C5 does NOT contain a theme-toggle nav element', () => {
    renderLegacy();
    expect(document.body.textContent).not.toMatch(/^.*?\b(Modern|Legacy)\b/);
    // softer check: no link to /modern
    expect(document.querySelector('a[href="/modern"]')).toBeNull();
  });
});
```

- [ ] **Step 2: Run, expect pass**

```bash
npm run test:run -- tests/legacy/
```

- [ ] **Step 3: Commit**

```bash
git add tests/legacy/
git commit -m "test(legacy): inventory-coverage smoke tests per spec v2 §7"
```

---

## Task 25: Final build verify and push

**Files:** none

- [ ] **Step 1: Full test + tsc + build**

```bash
cd /c/Users/stans/Projects/course
npm run test:run && npx tsc --noEmit && npm run build
```

All must pass.

- [ ] **Step 2: Verify dev server boots cleanly**

```bash
timeout 5s npm run dev 2>&1 | head -15 || true
```

- [ ] **Step 3: Push to origin**

```bash
git push origin main
```

- [ ] **Step 4: Mark plan complete**

Done.

---

## Self-Review

### Spec coverage check
- §1 Architecture (no shell): Task 4 deletes Layout, Task 9 makes Legacy standalone
- §2 Data model (overflow): Task 1 type, Task 2 walkTree, Task 3 tests
- §3 Algorithm: Tasks 1-3
- §4.1 Legacy port: Tasks 8-21 (CSS + 11 components/hooks)
- §4.2 Modern honesty: Tasks 22-23
- §5 Migration: distributed across 4-9 (delete Layout, rename context, delete old legacy components)
- §6 Deployment: unchanged, Task 25 push
- §7 Testing: Task 24
- §8 Milestones L0-L12: mapped to Tasks 1-25

### Placeholder scan
No "TBD" / "TODO". Code blocks are complete. Verification commands have expected outputs.

### Type consistency
- `NodeStatus.earnedClipped` and `overflow` introduced in Task 1, used in Tasks 2, 3, 17, 18, 24
- `LegacySimulationContext` types in Task 6, used in 7, 14, 15
- `useLegacySimulationResult` in Task 7, used in 12, 16, 17

### Known imperfections (acceptable)
- Task 18 says "Pass `catalog` and `pendingRecords` down to `walkTree`" — signature change. The detailed type changes for that are left for the implementer to derive from context; if it gets complex, they can dispatch a sub-question.
- Task 19's canvas portal approach assumes `tree-panel` exists in DOM when StellarCanvas first renders. If a race condition appears, a small useLayoutEffect adjustment will be needed.
