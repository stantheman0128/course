# Course System Redesign — Design Spec v2

**Date**: 2026-05-19
**Author**: Stan Shih + Claude
**Status**: Supersedes `docs/superpowers/specs/2026-05-18-course-system-redesign-design.md`
**Related**: `docs/claude-code-failure-report.md`, `docs/v1.7-inventory.md`

## What this spec corrects

The 2026-05-18 spec contained a **task-definition error**: it translated "v1.7 原版 vs 新版" into "legacy theme vs modern theme inside one SPA". Both phrases sound similar; they are not. The first preserves v1.7 as a complete product; the second reduces v1.7 to a colour palette.

The implementation that followed faithfully executed the wrong task. Symptoms documented in `docs/claude-code-failure-report.md`:

1. Legacy theme is missing stellar canvas, scroll-collapse stats, bottom sheet, fullscreen mode, keyboard shortcuts (§B/D/G/K/L of `v1.7-inventory.md`)
2. Default state pre-fills `assumedPassed` with all 9 codes; v1.7 starts with an empty `Set`
3. Stats panel replaced 「還需修習」 with 「本學期 pending」, changing the product's question from "how far to graduation?" to "what's pending this semester?"
4. A shared `<Layout>` shell with theme nav was introduced — v1.7 has no such shell
5. `GapAdvisor` claims to recommend 115-1 courses but no 115-1 dataset exists; it filters the static catalog
6. `walkTree` clips `earned` at `required`, hiding overflow — the most explanation-worthy product moment

Spec v2 fixes all six by redefining Legacy as a **faithful port** and tightening Modern's honesty obligations.

---

## Source of truth

| Doc | Role |
|---|---|
| `archive/course-v1.7.html` | Authoritative v1.7 source (line-level references in inventory) |
| `docs/v1.7-inventory.md` | Per-feature acceptance criteria with M/D/X/N classifiers |
| `docs/catalog-source/scoreExport.xls` + 110/111 PDFs | Course catalog & transcript source |
| `docs/claude-code-failure-report.md` | Why v1 spec failed; what must not happen again |
| This spec | Authoritative architecture and migration plan |

Spec v2 references inventory by section number (e.g. §D6 = sticky stats scroll-collapse). Anything not enumerated in the inventory defaults to **M (must preserve)**.

---

## Goals

1. **`/legacy` is a faithful port of v1.7**, not a "legacy-styled redesign". Every feature classified `M` in `v1.7-inventory.md` must be present with the same structure, behaviour, and semantics. Only `D`-classified items (text strings, numeric values from real data) may change.
2. **`/modern` may be a complete redesign**, freed from v1.7's constraints — but it must be **honest** about what it computes (no 115-1 claim without real data; overflow must remain visible even if styled differently).
3. **Core algorithm shared** between Legacy and Modern via `src/lib/` (pure TS) — the algorithm is unchanged except for the overflow-display fix (§4 of this spec).
4. **Data shared**: `transcript.json`, `catalog-110.json`, `liberal-courses.json`, `current-semester.json` consumed by both themes.
5. Both themes ship together on Cloudflare Pages at `course.stan-shih.com`.

## Non-goals

- A real 115-1 catalog or recommendation engine (deferred until a real source exists; until then, no UI may claim such a feature)
- Multi-cohort rule switching (110 only; later cohorts get separate `RULES_XXX.ts` files when needed)
- i18n
- PDF/export
- Multi-user accounts
- Domain registrar transfer (deferred per 2026-05-18 user decision)

---

## §1 — Architecture (corrected)

### Critical change from v1 spec: no shared shell wrapping Legacy

The previous `<Layout>` wrapping all routes was the structural error that pulled Legacy out of v1.7's standalone-page identity. v2 removes it.

```
src/main.tsx
└─ <Router>
   ├─ Route "/"        → <Navigate to="/legacy" replace />
   ├─ Route "/legacy"  → <LegacyApp />        ← NO wrapping component
   └─ Route "/modern"  → <ModernApp />        ← Modern may use its own internal layout
```

- `LegacyApp` is **self-contained**: it renders its own `<canvas#stellar-bg>`, `<header>`, `<div class="stats">`, simulator panel, tree panel, footer. Pixel-equivalent to v1.7's body.
- `ModernApp` is also self-contained, but free to redesign its layout.
- **There is no top nav, no theme toggle button, no shared `<Layout>` shell visible to the user**.
- Switching between themes happens by editing the URL (`/legacy` ↔ `/modern`) or via a discreet developer link in the footer of each theme. The page itself does NOT advertise the other theme.

### Directory layout

```
course/
├─ src/
│  ├─ lib/                          # Pure TS, framework-agnostic, unchanged from v1
│  │  ├─ types.ts
│  │  ├─ creditRules.ts             # RULES_110 — unchanged structure, removes clipping
│  │  ├─ catalog.ts
│  │  ├─ transcript.ts
│  │  └─ simulator.ts               # Overflow-display fix (see §4)
│  ├─ data/                         # JSON, unchanged from v1
│  │  ├─ transcript.json
│  │  ├─ catalog-110.json
│  │  ├─ liberal-courses.json
│  │  └─ current-semester.json
│  ├─ themes/
│  │  ├─ legacy/                    # FAITHFUL PORT of v1.7
│  │  │  ├─ App.tsx                 # Self-contained page (no Layout wrap)
│  │  │  ├─ StellarCanvas.tsx       # NEW — port of §B (130 stars, ripples, shooting)
│  │  │  ├─ Header.tsx              # 紫藍 gradient header
│  │  │  ├─ Stats.tsx               # 4 cards: 已修/畢業/還需/完成度 — §D
│  │  │  ├─ SimulatorPanel.tsx      # Desktop sticky sidebar — §E
│  │  │  ├─ BottomSheet.tsx         # Mobile iOS-style sheet — §G
│  │  │  ├─ TreePanel.tsx           # Right column + fullscreen logic — §H + §K
│  │  │  ├─ TreeNode.tsx            # Recursive node — §I + §J
│  │  │  ├─ ShortcutHint.tsx        # Toast for keyboard hint — §K10
│  │  │  ├─ Footer.tsx              # §C6
│  │  │  ├─ useScrollCollapse.ts    # §D6-D10
│  │  │  ├─ useKeyboardShortcuts.ts # §L
│  │  │  └─ legacy.css              # Verbatim CSS port from v1.7 lines 7-968
│  │  └─ modern/                    # FREE redesign — current implementation stays
│  │     ├─ App.tsx
│  │     └─ components/             # Stats, Sidebar, CreditTree, GapAdvisor
│  ├─ shared/
│  │  ├─ LegacySimulationContext.tsx   # NEW — empty-default Set, no localStorage
│  │  ├─ ModernSimulationContext.tsx   # Existing — default-prefilled, localStorage
│  │  └─ useSimulationResult.ts        # Updated for new overflow display
│  └─ main.tsx                      # No <Layout>, direct theme routes
├─ scripts/                         # Unchanged
├─ tests/
│  ├─ lib/                          # Unchanged tests
│  ├─ legacy/                       # NEW — fidelity-oriented tests
│  │  └─ inventory-coverage.test.tsx  # Verifies presence of features classified M
│  └─ modern/                       # Existing component tests
├─ docs/
│  ├─ catalog-source/
│  ├─ v1.7-inventory.md             # NEW — acceptance criteria
│  ├─ claude-code-failure-report.md # Why v1 failed
│  ├─ deployment.md
│  └─ superpowers/specs/2026-05-19-course-system-redesign-v2.md
├─ archive/                         # v1.7 + v1 implementation in src may stay for reference
└─ ...
```

### Two separate Contexts

The previous shared `SimulationContext` was forced into one default-behaviour for both themes. v2 splits them:

- `LegacySimulationContext`:
  - Default `assumedPassed = new Set()` (empty, per §M1)
  - No localStorage (per §M6, N6)
  - API: `assumedPassed`, `toggle(code)`, `reset()` (reset → empty)
- `ModernSimulationContext`:
  - Existing behaviour preserved (default-prefilled with 9 codes, localStorage `course.assumedPassed.v1`)
  - The current `SimulationContext.tsx` is renamed to this

`useSimulationResult` becomes theme-aware via the Context it consumes.

### Tests boundary

- `tests/lib/*.test.ts` — algorithm correctness, unchanged
- `tests/integration.test.ts` — updated expectations after overflow-display fix (totalEarned may move from 73 to 75)
- `tests/legacy/inventory-coverage.test.tsx` — NEW: smoke-tests that verify Legacy renders each M-classified feature (e.g. `<canvas id="stellar-bg">` exists, `<div class="stats scrolled">` is reachable, 「還需修習」 string appears, the empty-default `assumedPassed` is truly empty on mount)

---

## §2 — Data model (corrected)

Unchanged from v1 spec **except**:

- `TranscriptRecord`, `CatalogCourse`, `CategoryRule`, `NodeStatus`, `SimulationResult` — all unchanged
- `simulate()` signature unchanged
- **`NodeStatus.earned` is no longer clipped** at `required`. The display layer is responsible for showing both raw earned and the clipped portion (e.g. `14/8 (超修 6 → 自由選修)`). See §4.
- **`NodeStatus.gapCourses` is removed** (or always empty and documented as deprecated). v1.7 doesn't have this concept; the "available courses" rendering happens at the leaf node level via tree data, not as a separate panel. Modern theme may still expose suggestions but must not pretend they are 115-1 specific.

---

## §3 — Credit rule algorithm (almost unchanged)

`RULES_110` constant: unchanged.

`assignToLeaves`, `applyOverflow`, `walkTree` algorithms: unchanged in structure.

Single fix in `walkTree`:

```typescript
// Before (v1):
const clippedEarned = children.length === 0
  ? Math.min(earned, required)
  : Math.min(earned, required);
return { ..., earned: clippedEarned };

// After (v2):
return {
  ...,
  earned,                              // raw, not clipped
  earnedClipped: Math.min(earned, required),  // for progress-bar / fulfilled checks
  overflow: Math.max(0, earned - required),   // surplus, for "超修 N" display
};
```

`NodeStatus` interface gains `earnedClipped: number` and `overflow: number` siblings to `earned`. Existing tests that asserted clipped values must be updated to assert raw `earned` + new fields.

`fulfilled` continues to use `earnedClipped >= required` (so a leaf with overflow is still marked fulfilled).

---

## §4 — UX

### §4.1 Legacy theme: faithful port

**Acceptance criteria**: every row in `v1.7-inventory.md` classified `M` must be present and behaviourally equivalent. Every row classified `D` may use real data values.

**Specific binding decisions** (extracted from inventory for emphasis):

1. **Default state** (§M1, N3): `simulatedCourses = new Set()`. Empty. User opts in.
2. **Stats semantics** (§D3, N7): the 4 cards are 已修 / 畢業 / 還需 / 完成度. NO "本學期 pending".
3. **No localStorage** (§M6, N6): refreshing the page restores the empty Set.
4. **No theme nav** (§C5, N1): Legacy page must not display a theme toggle button or "Modern" link prominently. A discreet developer link in the footer is acceptable.
5. **Stellar canvas** (§B): must include 130 stars, mouse-repulsion (200px), click-ripple, shooting stars every 12s with 40% chance, connection lines (150px), twinkle. Port from v1.7 lines 1815-2044.
6. **Scroll-collapse stats** (§D6-D10): when `scrollTop > 50`, stats grid → inline row, numbers shrink, progress bar collapses, dividers appear. Transition 0.5s cubic-bezier.
7. **Bottom sheet** (§G): on <1200px viewports, course selector is an iOS-style bottom sheet — slide-up from bottom, 80vh max, drag handle, staggered course-item enter animation.
8. **Fullscreen tree** (§K): ⛶ button or `F` key toggles fullscreen. Stellar canvas moves inside `.tree-panel.fullscreen`. Stats/header/footer/simulator hidden. Tree-header becomes indigo gradient bar. Node cards lose glassmorphism.
9. **Keyboard shortcuts** (§L): F (fullscreen), C (mobile course toggle on <1200px), Esc (close panel + exit fullscreen). Ignored when input has focus.
10. **Overflow visible in tree** (§I8, N5): when a leaf's earned > required, render `{earned} / {required}` truthfully and surface the overflow in the leaf's badge or completed-summary card. Do not clip.

**`GapAdvisor` in Legacy**: **does not exist as a separate panel**. v1.7 surfaces suggestions inside the tree's leaf nodes via `💡 可選課程` (§J6). The new Legacy follows the same pattern — no standalone advisory component.

### §4.2 Modern theme: redesign with honesty obligations

Modern may use any layout (cards / sidebar / monochrome / dark / etc.). The current implementation under `src/themes/modern/` is a starting point.

**Must remain honest**:
- If `GapAdvisor` lists courses, the label must be neutral ("未滿足分類的可選課程" or "Suggested categories to fill") rather than "下學期建議" / "115-1 推薦". Until a real 115-1 dataset exists, no UI may claim it.
- Overflow must be visible. If Modern uses progress bars, they may visually cap at 100% but the tooltip / number readout must reveal the raw overflow.
- Default state may pre-fill (current behaviour) but only because Modern is explicitly different from v1.7. Document this in `<ModernApp>` header subtitle.

**Localized cleanups in Modern**:
- Stats card layout may change but must include the equivalent of "remaining" (還需) somewhere visible. Removing it entirely was a regression in v1 spec.

---

## §5 — Migration plan (existing implementation → v2)

### What stays

- `src/lib/*` — pure logic
- `src/data/*` — all JSON
- `scripts/*` — Python sync
- `src/themes/modern/*` — existing implementation, with minor honesty edits
- `tests/lib/*` — algorithm tests (some assertions updated for non-clipping)
- `.github/workflows/test.yml`, `wrangler.toml`, `docs/deployment.md` — deployment

### What changes

- `src/shared/SimulationContext.tsx` → renamed to `ModernSimulationContext.tsx`, behaviour unchanged
- NEW `src/shared/LegacySimulationContext.tsx` — empty default, no localStorage
- `src/shared/Layout.tsx` — **deleted**. main.tsx routes Legacy and Modern without wrapping.
- `src/themes/legacy/*` — **fully rewritten** from the v1.7 port (the current legacy components are discarded)
- `src/lib/simulator.ts`, `src/lib/types.ts` — `NodeStatus` gains `earnedClipped` and `overflow`; `walkTree` no longer clips
- `tests/integration.test.ts` — `totalEarned` expectation may change from 73 → 75 once overflow is properly counted
- NEW `tests/legacy/inventory-coverage.test.tsx`
- `src/themes/modern/components/GapAdvisor.tsx` — label change to remove 115-1 claim
- `src/themes/modern/components/Stats.tsx` — restore equivalent of "還需" if removed

### What's added

- `src/themes/legacy/StellarCanvas.tsx`, `BottomSheet.tsx`, `useScrollCollapse.ts`, `useKeyboardShortcuts.ts`, `ShortcutHint.tsx`
- `src/themes/legacy/legacy.css` — verbatim CSS port from v1.7 lines 7-968 (CSS-in-CSS, no Tailwind for Legacy — Tailwind cannot express all v1.7's effects, and `legacy.css` keeps the port honest)

---

## §6 — Deployment (unchanged)

Cloudflare Pages via Git integration, `course.stan-shih.com`. Already configured in v1. No changes here.

---

## §7 — Testing strategy (extended)

`tests/lib/*` — unchanged in spirit. Update integration test fixtures after overflow-display fix.

NEW `tests/legacy/inventory-coverage.test.tsx`:

```typescript
// Smoke tests verifying M-classified features render
test('Legacy renders stellar canvas', () => {
  render(<LegacyApp />);
  expect(document.querySelector('#stellar-bg')).toBeInTheDocument();
});

test('Legacy stats include 4 cards in order', () => {
  render(<LegacyApp />);
  const labels = Array.from(document.querySelectorAll('.stat-label')).map(e => e.textContent);
  expect(labels).toEqual(['已修學分', '畢業學分', '還需修習', '完成度']);
});

test('Legacy starts with empty assumedPassed', () => {
  render(<LegacyApp />);
  const checkboxes = document.querySelectorAll('.course-item-sim input[type=checkbox]');
  expect(checkboxes.length).toBeGreaterThan(0);
  Array.from(checkboxes).forEach(cb => expect(cb).not.toBeChecked());
});

test('Legacy includes fullscreen button', () => {
  render(<LegacyApp />);
  expect(document.querySelector('#fullscreen-btn')).toBeInTheDocument();
});

test('Legacy keyboard F triggers fullscreen', async () => {
  // fire keydown F, assert .tree-panel.fullscreen class
});
```

Tests anchor on **structural and behavioural fidelity**, not visual pixel-match. They are smoke tests, not snapshot tests.

---

## §8 — Implementation milestones (high-level)

| M | Name | Output |
|---|---|---|
| **L0** | Algorithm fix | `simulator.ts` no longer clips earned; tests updated; lib green |
| **L1** | Tear down v1 Layout shell | `src/shared/Layout.tsx` deleted; main.tsx routes direct; both themes still load (Modern intact, Legacy = placeholder for now) |
| **L2** | Split contexts | `LegacySimulationContext` (empty default, no localStorage) + `ModernSimulationContext` (existing); `useSimulationResult` becomes theme-scoped |
| **L3** | Legacy CSS port | `src/themes/legacy/legacy.css` — verbatim copy of v1.7 lines 7-968 |
| **L4** | Legacy structural shell | `<LegacyApp>` = header → stats → content-wrapper → footer matching v1.7 HTML structure |
| **L5** | Stellar canvas | `StellarCanvas.tsx` — port of v1.7's IIFE; 130 stars, mouse, ripple, shooting |
| **L6** | Stats with scroll-collapse | `Stats.tsx` + `useScrollCollapse.ts`; 4 cards, scroll threshold 50, animations |
| **L7** | Simulator panel + course items | desktop sticky 360px panel; bottom sheet for <1200px; `BottomSheet.tsx` includes overlay, drag handle, staggered enter |
| **L8** | Tree panel + tree-header + buttons | `TreePanel.tsx` + 📚/⛶ buttons; recursive `TreeNode` matching v1.7 grouping (completed-collapsed, 新增, 修課中/還需, 可選) |
| **L9** | Fullscreen + keyboard | `useKeyboardShortcuts.ts` (F/C/Esc) + fullscreen state propagated to TreePanel; canvas portal moves into fullscreen panel |
| **L10** | Modern honesty edits | `GapAdvisor` label neutralized; `Stats` restores 還需 if missing; documentation in Modern header noting it's a redesign |
| **L11** | Inventory-coverage tests | `tests/legacy/inventory-coverage.test.tsx` |
| **L12** | Build/deploy verify | full test + tsc + build clean; push; preview URL works |

L0-L2 are foundational (1-2 commits each). L3-L9 are the Legacy port (largest scope, ~10-15 commits). L10-L12 are wrap-up.

### Out of scope (extended)

In addition to v1's non-goals:
- Animated transitions between Legacy and Modern (theme switch is a route navigation, no morph)
- Mobile-touch-gesture-driven bottom sheet drag (v1.7 doesn't have it; only tap to close)
- WebGL canvas (2D context is fine, matches v1.7)
- 115-1 catalog or any next-semester prediction feature

---

## Approval

- Cohort and rules: 110 學年 post-112.09.22 amendment (unchanged from v1)
- Tech stack: React + Vite + TypeScript + Tailwind (Modern only) + plain CSS (Legacy)
- Themes: dual, **but no shared shell**
- Legacy = faithful port; Modern = redesign with honesty
- `GapAdvisor` in Modern keeps existence but loses 115-1 claim
- Overflow becomes visible; `earned` no longer clipped
- `localStorage` for Modern only

Anything else not covered defaults to "preserve v1.7 behaviour" per `v1.7-inventory.md` classification.
