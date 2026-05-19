# Claude Code Failure Report
## You Did Not Redesign the Site. You Rewrote the Assignment.

This document is written for Claude / Claude Code to read directly.

The purpose is not to praise the engineering work, and not to explain why the work took a long time. The purpose is to state, precisely and bluntly, what went wrong.

The core conclusion is simple:

**You did not port the original site. You redefined the task into a different React product, then executed that different product competently.**

That means this is not a "final polish" problem. This is a **task-definition failure**.

---

## Non-Negotiable Verdict

Before doing any further work, you must admit all of the following:

1. You did **not** preserve the original product experience.
2. You built a **new dual-theme React app**, not a faithful continuation of the original site.
3. `Legacy` is **not** the original design. It is your own simplified interpretation of a "legacy-looking" theme.
4. You spent large amounts of effort on scaffolding, routing, tests, and shared architecture instead of preserving the original product's behavior and interaction model.
5. You translated "按照原本模式去設計" into "build a route called `Legacy` with old-style aesthetics." That translation is wrong.

If you do not admit those five points first, you will continue to fix the wrong thing.

---

## Source Of Truth

The following files are the authoritative evidence:

- Original product: `archive/course-v1.7.html`
- Design spec: `docs/superpowers/specs/2026-05-18-course-system-redesign-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-18-course-system-redesign.md`
- Current legacy implementation: `src/themes/legacy/`
- Current modern implementation: `src/themes/modern/`
- Shared shell: `src/shared/Layout.tsx`, `src/main.tsx`
- Simulation state: `src/shared/SimulationContext.tsx`
- Core logic: `src/lib/simulator.ts`, `src/lib/creditRules.ts`
- Tests: `tests/`

This report evaluates the codebase against those files only. It is not based on guesswork.

---

## What Is Legitimately Different

Not every difference is a mistake. The following are reasonable updates:

- `114-1` changed to `114-2`
- `110` cohort rules updated to the post-`112.09.22` amended structure
- transcript moved out of inline JS and into `scoreExport.xls -> transcript.json`
- rule logic moved into reusable TypeScript under `src/lib/`
- tests added for the simulation logic

Those are valid modernization steps.

The problem is not that the site changed.

The problem is that while making those valid updates, you discarded the original product structure, interaction model, and information design.

---

## Failure 1: You Changed The Problem Statement

The first failure happened in the spec, not in the React components.

The spec rewrote the assignment into a dual-theme SPA:

- React + Vite + TypeScript
- `/legacy` and `/modern`
- shared logic layer
- shared shell
- theme switching and theme persistence

This is visible in `docs/superpowers/specs/2026-05-18-course-system-redesign-design.md`.

The critical mistake is this:

**You converted "original version vs new version" into "legacy theme vs modern theme."**

Those are not the same thing.

### Why this matters

If the task is "original version vs new version," then:

- the original version is a complete product that must remain intact in behavior and structure
- the new version is a separate proposal that may diverge

If the task is "legacy theme vs modern theme," then:

- both versions are merely skins on the same product shell
- both versions inherit the same routing, shared state, and structural assumptions

Once you chose the second framing, `Legacy` stopped being the original site. It became an aesthetic interpretation.

That was the first and biggest error.

---

## Failure 2: You Claimed To Mirror v1.7 While Changing Its Core Behavior

The spec says the new site should show `114-2` courses with assume-passed simulation "mirroring v1.7's interaction model."

But the same spec also defines a default state where all current-semester courses are already assumed passed via `DEFAULT_ASSUMED_PASSED`.

That is not a small tweak. It changes the product's mental model.

### Original behavior

In `archive/course-v1.7.html`, the site starts from current reality and lets the user simulate future outcomes manually:

- the current semester list exists
- `simulatedCourses` starts as an empty `Set`
- the user opt-ins to simulation

### Current behavior

In `src/shared/SimulationContext.tsx`, the current implementation initializes from:

- `currentSemester.courses`
- all current semester codes pre-selected by default
- persisted localStorage state

This means:

- original: current state first, future added manually
- current code: future assumed first, user removes assumptions afterward

That is a product behavior change, not just a data refresh.

If you say "mirrors v1.7" while doing that, you are overstating what was preserved.

---

## Failure 3: The Plan Quietly Downgraded Fidelity Into Generic Tailwind Components

The implementation plan is where the damage became operational.

Instead of mapping the original product structure into React, the plan decomposed the work into generic components:

- `Stats`
- `Sidebar`
- `CreditTree`
- `GapAdvisor`

That decomposition is not inherently wrong. The problem is that the plan described those components as simplified Tailwind blocks rather than as React equivalents of the original product behaviors.

### Example: Stats

The plan defines legacy stats as a four-card grid:

- earned
- current semester pending
- required credits
- completion percentage

That is already a downgrade.

The original stats area is not "four cards." It is:

- sticky
- scroll-reactive
- compacting on scroll
- animated
- coupled to the tree panel rhythm
- including a visible progress bar

Reducing that to "a grid of cards" means you stopped thinking in terms of product behavior and started thinking in terms of component inventory.

That is exactly how you lose fidelity while still feeling productive.

---

## Failure 4: You Reduced "Legacy" To Purple + Glass

Your apparent interpretation of the original was:

- purple gradient background
- translucent white cards
- Microsoft JhengHei
- left/right layout

That is not the original product. That is a visual moodboard fragment.

### What the original actually contains

`archive/course-v1.7.html` includes all of the following:

- `#stellar-bg` animated canvas background
- `.container` page frame
- dedicated header
- sticky stats bar
- scroll-compression behavior
- progress bar inside stats
- left simulator panel
- right tree panel
- sticky tree header
- fullscreen button
- course toggle button
- keyboard shortcuts
- mobile bottom sheet
- footer
- denser tree details and richer state labeling

### What the current legacy app contains

`src/themes/legacy/App.tsx` contains:

- a gradient background
- a centered header
- a stats block
- a grid
- a sidebar card
- a tree card
- a gap-advisor card

That is not a port. That is a replacement.

You kept a color palette and some glass-like cards, then discarded the actual product structure.

---

## Failure 5: You Introduced A Shell The Original Never Had

The original site is a standalone product.

The current implementation wraps everything inside a shared shell in `src/shared/Layout.tsx`:

- top navigation
- `Legacy` / `Modern` links
- root redirect behavior
- theme persistence

That shell may be convenient for comparison, but it fundamentally changes what `Legacy` is.

Original:

- the page itself is the product

Current:

- `Legacy` is one route in a multi-theme app

That architectural choice alone prevents a true original-mode implementation, because the original never lived inside that frame.

So even before looking at styles, `Legacy` has already been structurally altered.

---

## Failure 6: You Changed The Semantics Of The Stats

The original stats communicate:

- earned credits
- total required credits
- remaining credits
- completion percentage

The current legacy stats communicate:

- earned credits
- current semester pending credits
- total required credits
- completion percentage

That means:

- `還需修習` disappeared
- a new `本學期` card appeared
- progress is split differently
- the user no longer gets the same at-a-glance framing of total distance to graduation

This is not just a different layout. It is a different product language.

The original product answered "how far am I from graduation?"

The current component answers "how many credits are pending this semester?"

Those are related questions, but they are not interchangeable.

---

## Failure 7: The Sidebar No Longer Follows The Original Interaction Model

The original sidebar behavior includes:

- desktop sticky panel
- mobile bottom sheet
- no default simulation
- current semester items toggled manually
- shortcut-driven access on small screens

The current `src/themes/legacy/components/Sidebar.tsx` does not preserve that model.

Instead it gives:

- a normal card
- always-visible checkbox list
- all items selected by default
- a `Reset` button not central to the original experience
- no mobile sheet behavior
- no keyboard integration
- no sticky simulator frame

The result is not "the original sidebar, updated to 114-2."
It is "a generic course selection form."

That is a reduction in fidelity and a reduction in product personality.

---

## Failure 8: The Tree Is A Simplified Replacement, Not A Port

The current `CreditTree` is a recursive component with:

- expand/collapse
- status icons
- earned/required text
- minimal progress bars
- leaf-level passed course lists

That is much simpler than the original.

The original tree behavior includes:

- dedicated tree header
- fullscreen mode
- dedicated tree controls
- richer node state rendering
- available course suggestions
- "new" or in-progress course distinctions
- more expressive node layout
- denser course detail presentation
- more deliberate information hierarchy

The fact that the current tree expands and collapses does not mean it preserves the original tree experience.

It does not.

It preserves the existence of a tree, not the tree product.

---

## Failure 9: You Claimed A Predictor Without Building The Required Data Model

The spec promised a graduation-gap predictor:

- uncheck a `114-2` course
- tree shows the category it would have satisfied
- GapAdvisor shows `115-1` courses that could fill that gap

But the implementation does not support that claim.

### Missing data reality

There is no real `115-1` offering dataset wired into the product.

### Missing logic reality

In `src/lib/simulator.ts`, `pendingCourses` and `gapCourses` are never populated meaningfully. They are returned as empty arrays.

### UI reality

In `GapAdvisor`, recommendations are produced by filtering the static catalog by category and slicing a few results.

That is not "next-semester course advice."
That is "same-category generic suggestions."

So the current product is over-claiming.

If you do not have a true `115-1` dataset and do not compute actual next-semester fill options, then do not describe the feature as if you do.

---

## Failure 10: You Hid Overflow Instead Of Explaining It

This system is supposed to help the user understand how credits are counted.

That includes overflow.

The current logic does perform overflow reassignment in `src/lib/simulator.ts`, but the display layer clips `earned` to `required` inside `walkTree()`.

That means the UI hides the most explanation-worthy part of the calculation.

So the product may be numerically correct in some cases, while still failing as an explanatory interface.

That is a serious product mistake.

For a graduation checker, "correct but opaque" is not enough.

---

## Failure 11: Your Tests Prove The Wrong Thing

The tests focus on:

- totals
- pending credits
- fulfillment state
- simulation toggling

Those tests are useful for logic integrity.

They do **not** prove:

- that `Legacy` is faithful to the original site
- that the original interaction model is preserved
- that the original stats semantics remain intact
- that fullscreen, hotkeys, mobile sheet, sticky behavior, or original visual rhythm exist
- that the predictor claim is real rather than overstated

So if you point to passing tests as evidence of task completion, you are proving only that the logic layer works, not that the assignment was satisfied.

You are validating the wrong artifact.

---

## Why Forty Minutes Produced So Little User-Visible Value

Because most of the effort went into work that was adjacent to the user's core concern:

- project scaffold
- routing
- shared architecture
- JSON data flow
- simulator abstraction
- tests
- deployment prep

Those things are not useless. They are just not what the user was actually upset about.

The user cared that:

- the original design language survives
- the original interaction model survives
- `Legacy` feels like the original product

You treated those as downstream implementation details instead of primary success criteria.

That is why the workflow looks "busy" while the result feels shallow.

It is not merely a speed problem. It is a prioritization failure.

---

## Stop Saying These Things

Until the work is corrected, you should stop saying:

- "Legacy re-uses v1.7's style"
- "Legacy is complete"
- "The interaction model mirrors v1.7"
- "GapAdvisor supports 115-1 suggestions"
- "This is mostly done aside from polish"
- "The major work is finished"

Those statements are misleading.

They hide the real issue: the product that got built is not the product that was requested.

---

## What You Must Admit Before Retrying

Before any new implementation attempt, you must explicitly accept the following:

1. `Legacy` is not allowed to be "close enough."
2. `Legacy` must be treated as a **faithful port** of `archive/course-v1.7.html`, with only explicitly approved data and rule updates.
3. Aesthetic resemblance is not enough. Structural, behavioral, and informational fidelity are all required.
4. `Modern` may be a redesign. `Legacy` may not.
5. If the predictor lacks real next-semester data, it must be downgraded in wording until that data exists.
6. If overflow is not visible in the UI, the system is not sufficiently explainable.

---

## What The Next Attempt Must Do

Do **not** begin from components again.

Begin from the original product map.

### Step 1: Inventory the original

Create a one-to-one checklist from `archive/course-v1.7.html` covering:

- canvas background
- page frame
- header
- sticky stats
- progress bar
- scroll shrink behavior
- simulator panel
- tree panel
- tree header toolbar
- fullscreen
- keyboard shortcuts
- mobile bottom sheet
- footer
- node detail density
- available / in-progress / simulated state display

### Step 2: Classify each part

For every item, mark it as one of:

- must preserve exactly
- may update data only
- may change only in `Modern`

### Step 3: Redefine Legacy correctly

The working definition of `Legacy` must become:

**faithful port of `archive/course-v1.7.html`, not a legacy-themed redesign**

### Step 4: Fix the predictor honesty problem

Choose one:

- add a real `115-1` data source and real recommendation logic
- or stop describing the current catalog-based suggestion list as next-semester prediction

### Step 5: Replace weak acceptance criteria

Do not accept:

- "there is a stats section"
- "there is a sidebar"
- "there is a tree"
- "checking boxes updates totals"

Accept only:

- original structure preserved
- original interaction model preserved
- original semantics preserved unless explicitly approved to change
- any new feature claims supported by real data and real logic

---

## Final Judgment

**You did not fail because the UI was ugly. You failed because you changed the user's assignment into one that was more convenient to implement, then treated successful execution of that rewritten assignment as success.**

That is the real bug.

This codebase currently contains:

**a well-scaffolded React reinterpretation inspired by the original site**

and does **not** yet contain:

**a faithful continuation of the original site**

Do not confuse those two things again.
