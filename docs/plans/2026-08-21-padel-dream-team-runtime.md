# Padel Invite and Dream Team Runtime Implementation Plan

> **For Codex:** Follow test-driven development task-by-task in the existing `design/personal-chat-runtime` worktree. The user explicitly prohibited commits, pushes, and publication.

**Goal:** Add the approved `@padel_pro` personal chat and `Dream Team` group chat directly after Investor while preserving the existing Personal Chat runtime.

**Architecture:** Keep personal cards on the current generic multi-bubble renderer and add one data-driven `mode: "team"` renderer for heterogeneous outgoing/incoming messages. Expand the explicit runtime allowlist to only the two new IDs and use a local terminal view for the final Dream Team choice.

**Tech Stack:** Vanilla JavaScript, CSS, JSON, Node test runner, Playwright.

---

### Task 1: Structural RED contract

**Files:**
- Modify: `tests/personal-chat-runtime.test.cjs`

1. Assert the runtime allowlist contains the existing six IDs plus `PADEL_INVITE` and `DREAM_TEAM`.
2. Assert both new cards immediately follow `OPEN_INVESTOR` in canonical order.
3. Assert exact copy, labels, empty effects/flags, and approved next targets.
4. Assert both Investor choices preserve their canonical legacy targets while `app.js` bridges both runtime outcomes to `PADEL_INVITE`.
5. Assert the Dream Team data contains one outgoing founder message and two incoming member messages.
6. Run the structural test and confirm it fails because the new contract is absent.

### Task 2: Browser RED contract

**Files:**
- Modify: `tests/personal-chat-runtime.browser.test.cjs`

1. Extend the desktop left route through Investor, `PADEL_INVITE`, and `DREAM_TEAM`.
2. Assert the two Padel bubbles appear in one render with no typing bubble.
3. Assert Dream Team contact, pinned message, outgoing/right and two incoming/left participant rows, exact labels, Quiet Glass, and `12.2px` typography.
4. Assert either Dream Team choice leaves the card visible and disables both choices.
5. Extend the compact right route through the alternate Padel and Dream Team choices and assert scene/page overflow is zero.
6. Run focused browser tests and confirm expected feature-missing failures.

### Task 3: Canonical card data

**Files:**
- Modify: `cards.json`
- Modify: `cards.bundle.js`

1. Insert `PADEL_INVITE` and `DREAM_TEAM` directly after `OPEN_INVESTOR`.
2. Preserve both canonical Investor targets for direct-engine balance tests; bridge both outcomes to `PADEL_INVITE` only inside the scoped Personal Chat runtime.
3. Give new choices no resource effects or flags; route Padel choices to Dream Team and leave Dream Team choices without a next target.
4. Regenerate the offline bundle so it exactly mirrors the canonical JSON.
5. Run the structural test and keep implementation minimal until it passes.

### Task 4: Runtime and team UI

**Files:**
- Modify: `app.js`
- Modify: `style.css`

1. Add only the two new IDs to `ACTIVE_CARD_IDS`.
2. Replace the Investor stop special case with `continueFromInvestor`: resolve the original choice, preserve its effects/flags/arc, then force the approved runtime target to `PADEL_INVITE`.
3. Add a `renderTeamCard` path driven by `card.mode` and `card.messages`.
4. Preserve the existing personal renderer for `PADEL_INVITE`.
5. Add a final Dream Team completion path that resolves the no-effect choice, keeps `DREAM_TEAM` current, and disables both buttons.
6. Add the exact Screen 13 team layout styles and compact viewport adjustments.
7. Run focused structural and browser tests to GREEN.

### Task 5: Regression verification and handoff

**Files:**
- Modify: `PROJECT_STATUS.md`

1. Run the full agreed runtime suite.
2. Validate deck and offline mirror, run `git diff --check`, and confirm `game.js` is unchanged.
3. Verify both new branches and terminal states at 390×844 and 320×650.
4. Review the allowlist/disabled-card gate and visible terminal punctuation.
5. Rewrite `PROJECT_STATUS.md` as a fresh evidence-backed snapshot.
6. Do not commit, push, or publish.
