# B3/G2 First Package Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development to implement this plan task-by-task.

**Goal:** Add the first approved B3 sales side-story and G2 Agents training branch without interrupting forced causal pairs.

**Architecture:** B3 is an Agents-only, once-per-run side-story inserted only at existing safe weighted boundaries. Its callback delay counts resolved main-story decisions rather than ambient cards or crises, and the existing exact-story resume queue is reused. G2 is a forced continuation from the controlled demo and uses explicit Hype and Legal variants plus persistent choice flags.

**Tech Stack:** JSON narrative deck, vanilla JavaScript engine, Node.js test runner, Playwright smoke tests.

---

### Task 1: Preserve approved source and checkpoint scope

**Files:**
- Create: `MISTAKERY_CHECKPOINT_5_3_APPROVED_COPY.md`
- Modify: `docs/core/STATE_BIBLE.md`

1. Save the exact approved English copy without rewriting it.
2. Record B3 as Agents-only for this checkpoint.
3. Record the deferred risk: the current Padel arc has no natural room for a two-step delayed side-story.
4. Distinguish a paid outcome from core B2BuyerSpyer validation.

### Task 2: Specify B3 scheduler behavior with failing tests

**Files:**
- Modify: `tests/engine.test.cjs`
- Modify: `tests/content.test.cjs`
- Modify: `tests/balance.test.cjs`

1. Test Agents eligibility and continuing-Padel exclusion.
2. Test eligibility after a Padel refusal switches to Agents.
3. Test that forced pairs, due callbacks, crises and rescue cannot be interrupted.
4. Test that `Leave them alone` permanently excludes the callback.
5. Test that two resolved main-story decisions mature B3, while ambient cards and technical/crisis transitions do not.
6. Test that a due B3 callback waits for a safe weighted boundary.
7. Test exact queued-story restoration after free opt-out.
8. Test paid opt-out ends with `paid: true`, `validationProof: false` and no core-validation win.
9. Run the focused tests and verify they fail for missing B3 behavior.

### Task 3: Implement the minimal B3 scheduler extension

**Files:**
- Modify: `game.js`
- Modify: `cards.json`

1. Add a reusable side-story eligibility marker restricted by active arc and safe weighted insertion.
2. Preserve forced continuations and the existing exact queued story.
3. Add a delayed-entry mode whose counter advances only on resolved main-story cards.
4. Preserve delayed entries across ambient cards and successful crisis rescue.
5. Clear unresolved side-stories on any terminal outcome.
6. Add `B3_SALES_PRESSURE_SEED`, `B3_PAID_OPTOUT_CALLBACK`, flags and `paid_to_disappear`.
7. Run focused B3 tests until green.

### Task 4: Specify G2 with failing tests

**Files:**
- Modify: `tests/content.test.cjs`
- Modify: `tests/balance.test.cjs`

1. Test that only `Publish one demo` enters `G2_TRAINING_CHOICE`.
2. Test the forced `AGENT_02_DEV → G2_TRAINING_CHOICE` pair.
3. Test both choices produce independently operating agents without Customers or payment.
4. Test correct Hype and Legal variants for team and neutral training.
5. Test all four Hype flags are read by later conditional consequences.
6. Test the shared lead/order and invoice/freedom chain remains reachable without dead ends.
7. Run focused tests and verify they fail for missing G2 behavior.

### Task 5: Implement G2 data and persistent memory

**Files:**
- Modify: `cards.json`
- Modify: `game.js` only if conditional consequence selection cannot remain data-driven

1. Route Deploy unchanged to its current Hype route and callback.
2. Route Publish immediately to `G2_TRAINING_CHOICE`.
3. Add team/neutral operational flags and resource costs.
4. Replace the demo Hype card with `AGENT_03_HYPE_TEAM` and `AGENT_03_HYPE_NEUTRAL`.
5. Replace Legal with `AGENT_06_LEGAL_TEAM` and `AGENT_06_LEGAL_NEUTRAL`.
6. Make later effect reasons or consequences explicitly consume side-by-side, crop, clean-takes and stress-test flags.
7. Keep `AGENT_04_LEAD`, `AGENT_05_ORDER` and the invoice/freedom chain shared.
8. Run focused G2 tests until green.

### Task 6: Rebuild generated artifacts and verify

**Files:**
- Regenerate: `cards.bundle.js`
- Regenerate: `MISTAKERY_CARDS_EN_RU.md`

1. Run the offline deck builder.
2. Run the bilingual catalog builder.
3. Run the deck analyzer and inspect every new finding.
4. Run all automated tests.
5. Run browser smoke at 390×844 and desktop size.
6. Run deterministic traces: B3 stop; B3 paid; B3 free in Agents; G2 team + side-by-side; G2 team + crop; G2 neutral + clean takes; G2 neutral + stress test.
7. Confirm no new card is unreachable and no new flag is dead.

