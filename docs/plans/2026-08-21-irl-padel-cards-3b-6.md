# IRL Padel Cards 3B–6 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the approved IRL Padel scene with the conditional 3B branch, cards 4–6, and a return to the existing `5 MONTHS AS A FOUNDER 🚀` (`SAVED_02_UPDATE`) screen after either card 6 choice.

**Architecture:** Keep the canonical choice graph in `cards.json` and mirror it into the offline bundle. Extend only the explicit Personal Chat runtime allowlist and replace the single-card terminal handler with normal IRL traversal plus a card-6 handoff to `SAVED_01_PLAN`; reuse the existing IRL renderer and CSS unchanged.

**Tech Stack:** Vanilla JavaScript, JSON deck data, Node test runner, Playwright browser tests.

---

### Task 1: Lock the IRL graph and copy with tests

**Files:**
- Modify: `tests/personal-chat-runtime.test.cjs`
- Modify: `tests/personal-chat-runtime.browser.test.cjs`

1. Assert the four new active IDs, exact sources, messages, score labels, choices, and choice targets.
2. Assert Card 3 routes left to Card 4 and right to Card 3B; both Card 3B choices route to Card 4.
3. Assert both choices on Cards 4 and 5 advance sequentially, and both Card 6 choices return to `SAVED_02_UPDATE`.
4. Run the focused structural test and confirm RED because the cards and transitions do not exist yet.

### Task 2: Implement the minimal data and runtime change

**Files:**
- Modify: `cards.json`
- Modify: `cards.bundle.js`
- Modify: `app.js`

1. Add `IRL_PADEL_03B`, `IRL_PADEL_04`, `IRL_PADEL_05`, and `IRL_PADEL_06` directly after `IRL_PADEL_01` with the approved copy and graph.
2. Extend `ACTIVE_CARD_IDS` with exactly those four IDs.
3. Let Cards 3–5 resolve through the canonical graph, and route Card 6 to `startSaved(1)` after resolving either choice.
4. Regenerate the offline bundle from the canonical JSON.
5. Re-run focused tests and confirm GREEN.

### Task 3: Verify responsive behavior and hand off

**Files:**
- Modify: `PROJECT_STATUS.md`

1. Exercise both Card 3 branches through Card 6 and verify the Saved Messages return.
2. Capture and inspect the IRL cards at 390×844 and 320×650 for clipping, overlaps, disabled controls, and preserved photo treatment.
3. Run the complete agreed Node suite, deck validation, bundle comparison, syntax check, and `git diff --check`.
4. Rewrite `PROJECT_STATUS.md` as a current evidence-backed snapshot.

No commit, push, or publish step is allowed for this plan.
