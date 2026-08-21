# IRL Padel Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development to implement this plan task-by-task.

**Goal:** Add the approved IRL Padel Club card after Dream Team without activating any other legacy card.

**Architecture:** Extend the existing data-driven scene switch with an `irl` mode and a dedicated renderer while retaining the shared phone shell, HUD, and choice system. Use a runtime terminal handler for IRL completion and keep the active-card allowlist explicit.

**Tech Stack:** Vanilla JavaScript, CSS, JSON/offline JS bundle, Node test runner, Playwright.

---

### Task 1: Lock the structural contract

**Files:**
- Modify: `tests/personal-chat-runtime.test.cjs`

1. Assert the active runtime IDs end with `PADEL_INVITE`, `DREAM_TEAM`, `IRL_PADEL_01`.
2. Assert `IRL_PADEL_01` immediately follows `DREAM_TEAM`, uses `mode: "irl"`, contains the approved copy/location/score, and has exact empty-effect choices.
3. Assert both Dream Team choices target `IRL_PADEL_01` and the bundle mirrors JSON.
4. Run `node --test tests/personal-chat-runtime.test.cjs`; expect RED because the new card and gate do not exist.

### Task 2: Lock the browser behavior

**Files:**
- Modify: `tests/personal-chat-runtime.browser.test.cjs`

1. Extend both approved journeys through IRL.
2. Assert contact `@padel_pro`, `P` avatar, `IRL · PADEL CLUB`, `Score: 0–0`, three lines with zero extra margin, hidden Quiet Glass, exact choices, background image, and IRL terminal lock.
3. Assert scene/page overflow is zero at 390×844 and 320×650.
4. Run the focused desktop test; expect RED waiting for absent `IRL_PADEL_01`.

### Task 3: Implement the minimal IRL mode

**Files:**
- Modify: `cards.json`
- Modify: `cards.bundle.js`
- Modify: `app.js`
- Modify: `style.css`
- Create: `assets/irl-padel-court.png`

1. Copy the approved court asset into the worktree.
2. Insert `IRL_PADEL_01` after Dream Team and add exact transitions/data.
3. Extend `setSceneMode`, render the IRL contact/location/dialog, hide Quiet Glass only in IRL, and add terminal completion handling.
4. Add IRL background, overlay, dialog, location, and compact viewport CSS based on Screen 13.
5. Regenerate `cards.bundle.js` from `cards.json`.
6. Run focused structural and browser tests; expect GREEN.

### Task 4: Verify and hand off

**Files:**
- Modify: `PROJECT_STATUS.md`

1. Run `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs tests/engine.test.cjs tests/balance.test.cjs`.
2. Visually inspect both IRL branches at 390×844 and 320×650 and measure scene/page overflow.
3. Run deck validation, bundle comparison, `node --check app.js`, and `git diff --check`.
4. Update `PROJECT_STATUS.md` with current verified behavior and remaining deferred effects/continuations.

No commit step is included because the user explicitly requires all changes to remain uncommitted.
