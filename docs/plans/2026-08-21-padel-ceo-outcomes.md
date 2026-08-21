# Padel CEO Score and Outcomes Implementation Plan

> **For Codex:** Follow this plan with `superpowers:test-driven-development`. The user explicitly forbids commits, pushes, and publication.

**Goal:** Add the hidden Padel-only CEO score, exact weighted selection for Outcomes 0–7, and a clean return through `SAVED_02_UPDATE` into a fresh run without changing resources or the existing Cards 1–6 presentation.

**Architecture:** Keep outcome content in the canonical card deck. Store `padelCeoScore` only in the browser runtime, drive its deltas from choice-level `ceoScore` metadata, and intercept the few Padel transition boundaries in `app.js`. Use `Math.random` only in the Card 6 outcome selector: one draw for a thrown match, two independent draws for a fought match. Outcome replies clear the temporary score and open `SAVED_02_UPDATE`; its existing CTA calls `beginRun()` and resets the run again.

**Tech Stack:** Vanilla JavaScript, canonical JSON card deck plus generated offline bundle, Node test runner, Playwright, in-app Browser QA.

---

### Task 1: Lock the canonical content and score metadata

**Files:**
- Modify: `tests/personal-chat-runtime.test.cjs`
- Modify: `cards.json`
- Regenerate: `cards.bundle.js`

1. Add failing assertions for all eight `PADEL_OUTCOME_0`…`PADEL_OUTCOME_7` cards: exact mode, source, copy, choices, empty effects, and no resource deltas.
2. Add failing assertions for `ceoScore` metadata on Cards 3, 3B, 4, and 5 and for unchanged resources/text/UI fields on existing Cards 1–6.
3. Run `node --test tests/personal-chat-runtime.test.cjs` and confirm RED because the outcomes and score metadata are absent.
4. Add only the required choice metadata and outcome cards to `cards.json`; keep existing text, resource effects, and visible card fields intact.
5. Regenerate `cards.bundle.js`, rerun the focused structural test, and confirm GREEN.

### Task 2: Implement Padel-local score and deterministic outcome selection

**Files:**
- Modify: `tests/personal-chat-runtime.browser.test.cjs`
- Modify: `app.js`

1. Add browser tests that enter Padel with score `0`, accumulate the documented deltas, skip Card 6 at `+4`, and keep the score absent from rendered copy.
2. Add deterministic tests around every probability boundary by replacing `Math.random` with fixed sequences:
   - throw: `−2/+2` use `0.6`, `0` uses `0.5` for Outcome 3 vs 4;
   - fight: first draw uses `0.5` for win/loss, second draw uses the exact score-specific Outcome 1/2 or 5/6 threshold.
3. Add tests that `Feeling sick, pass` opens Outcome 0, both replies on every outcome open `SAVED_02_UPDATE`, `padelCeoScore` becomes `null`, resources remain byte-for-byte unchanged, and the Saved CTA begins a fresh run.
4. Run the focused browser suite and confirm RED against the current direct Card 6 → Saved behavior.
5. Add `padelCeoScore: null` to runtime state, initialize it at Padel entry, read deltas from the selected choice, and select outcome IDs through one small guarded helper.
6. Intercept Outcome 0, early Outcome 7, Card 6 selection, and outcome completion. Reset the temporary score in `beginRun`, restart, and outcome completion.
7. Rerun the focused browser suite and confirm GREEN.

### Task 3: Regression and visual verification

**Files:**
- Modify: `PROJECT_STATUS.md`

1. Run the full agreed suite:
   `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs tests/engine.test.cjs tests/balance.test.cjs`.
2. Validate the canonical deck, bundle mirror, syntax, and `git diff --check`.
3. In the local browser at 390×844 and 320×650, inspect Outcome 0, early Outcome 7, and at least one ordinary IRL outcome. Confirm existing IRL frame/avatar/dialog styling, no overflow, and no visible CEO score.
4. Rewrite `PROJECT_STATUS.md` as the current verified snapshot, including RED/GREEN evidence, exact probability rules, reset behavior, and the continued no-commit constraint.

