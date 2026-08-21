# Padel Match Status Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show the deciding-point score on Card 6 and final match-result labels on IRL outcome cards without changing Padel probabilities, CEO score, copy, choices, or transitions.

**Architecture:** Keep the existing IRL status-bar contract: `app.js` renders the card's `score` string verbatim. Change only canonical `score` values in `cards.json`, rebuild `cards.bundle.js`, and update structural/browser expectations. Outcome 0 remains a Personal Chat card without a `score` field.

**Tech Stack:** Static HTML/CSS/JavaScript, JSON card deck, Node test runner, Playwright browser tests.

---

### Task 1: Lock the requested statuses with tests

**Files:**
- Modify: `tests/personal-chat-runtime.test.cjs`
- Modify: `tests/personal-chat-runtime.browser.test.cjs`

**Step 1: Update the structural expectations**

Expect Card 6 to use `Score: 5–5 · 40–40 · DECIDING POINT`, Outcomes 1–2 to use `YOU WON THE MATCH`, Outcomes 3–6 to use `YOU LOST THE MATCH`, Outcome 7 to use `MATCH ABORTED`, and Outcome 0 to have no score.

**Step 2: Update the browser expectations**

Assert that the same strings appear in the existing IRL pinned-title/status-bar element on representative match and outcome routes.

**Step 3: Run the focused tests and verify RED**

Run: `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs`

Expected: FAIL because the canonical deck still contains the old numerical statuses.

### Task 2: Apply the minimal canonical data change

**Files:**
- Modify: `cards.json`
- Regenerate: `cards.bundle.js`

**Step 1: Replace only the eight relevant `score` values**

Do not change card text, choices, `ceoScore`, transitions, or runtime probability code.

**Step 2: Rebuild the offline deck**

Run: `node scripts/build-offline-deck.cjs`

**Step 3: Run focused tests and verify GREEN**

Run: `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs`

Expected: all focused tests pass.

### Task 3: Regression and visual verification

**Files:**
- Modify: `PROJECT_STATUS.md`

**Step 1: Run the agreed full suite**

Run: `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs tests/engine.test.cjs tests/balance.test.cjs`

Expected: all tests pass with the existing probability boundary table unchanged.

**Step 2: Run integrity checks**

Run: `node --check app.js && node --check cards.bundle.js && git diff --check`

Expected: all commands exit successfully; `cards.bundle.js` mirrors `cards.json`.

**Step 3: Playtest representative states**

At `390×844` and `320×650`, inspect Card 6, a won outcome, a lost outcome, and Outcome 7. Confirm the status stays inside the existing bar, Outcome 0 remains chat-only, and no copy/choice/layout regression appears.

**Step 4: Update the handoff snapshot**

Record the final status mapping, fresh test results, visual evidence, and the explicit no-commit/no-push state. Do not commit, push, or publish.
