# Phase 2 (WIP) — Review request for Codex

Status: **intermediate checkpoint. 99/113 tests pass; 14 fail BY DESIGN.** Please review the direction and the engine change before we continue. Do not "fix" the 14 red tests — they encode the machinery we are deliberately removing (see below).

Branch: `quality-prototype`. Baseline commit before this work: `718d0cc` (107 tests green). Review the diff with `git diff 718d0cc`.

## Context (why this change exists)

Mistakery is a Reigns-like messenger card game. Diagnosis: a run played as one fixed 43-card scenario — the story arc `AGENT_01→06` was a hard `next`-chain, so runs did not vary. The author locked design direction **"Variant B"**: a Reigns-style conditional-gating engine.

Model: a card is not wired to a specific next card. It declares **when it is eligible** (active arc + resource ranges + required/excluded flags) and **which flags it sets**. Each turn the engine builds a pool of eligible cards and picks by weight. A story beat cannot surface before its precondition flag exists → causal order is guaranteed by conditions, not by a fixed chain. Immediate consequences stay glued (forced). Ambient cards interleave between free beats.

Full rationale: `docs/plans/2026-07-15-phase1-agents-audit.md`, `docs/plans/2026-07-15-phase2-engine-plan.md`.

## What changed so far (this checkpoint)

Scope = Agents arc as the reference vertical slice. Beat list locked at 8 (7 old + 1 promoted from ambient, not yet added — that is step 2c, not in this checkpoint).

**Engine (`game.js`):**
- New `eligibleArcBeatPool(deck, state)` — eligible story beats tagged `arcBeat:true` for the active arc (weighted by the existing `activeArcWeightMultiplier`).
- New continuation mode `pool`: on resolving a free beat, the next story card is chosen from `eligibleArcBeatPool` (interleaved with ambient/sideStory exactly like the existing `weighted` branch), instead of a hardcoded `next`.

**Deck (`cards.json`):**
- Free beats `AGENT_01/02/03` → `continuation:"pool"`, `oncePerRun:true`, hardcoded `next` removed. Flag chain: `AGENT_01` sets `empathy_demanded`; `AGENT_02_DEV` requires it, sets `patch_built`; `AGENT_03_HYPE` requires `patch_built`, sets `hyped`.
- Glued chain kept forced: `AGENT_04_LEAD` (requires `hyped`, `arcBeat`, `oncePerRun`) → `AGENT_05_ORDER` → `AGENT_06_LEGAL` → `AGENT_07_*`.

**Tests:** `tests/agents-flag-gating.test.cjs` (new, 6 green) locks the invariants: gating order, arc-scoped pool, pool advancement.

## The 14 failing tests are expected — do NOT patch them

They hard-code the OLD structure being replaced:
- **Group 1 — Agents forced traces (4):** `deterministic trace: Agents Demo route`, `dev publishes both deploy and demo routes before the shared Hype card`, `declares forced, weighted and ambient scheduler modes`, `Publish one demo restores the direct shared Agents route`. They assert the old fixed `AGENT_01→06` sequence.
- **Group 2 — Package A side-stories (10):** payroll / dev-hostage / b3 seed+callback + reservation/lock tests + two 10,000-run invariants. These depend on the `scheduler.boundaries` / `reservations` / named-slot machinery. Pool beats have no `next`, so `before→after` boundaries never fire and callbacks are no longer placed. This machinery is slated for removal in step **2.2**: the three side-stories become flag-gated ambient cards that reserve a callback by story-decision count (`reserveCallback` / `remainingStoryDecisions`, already in the engine). These tests will be rewritten for the new model, not restored.

Remaining Phase 2 work after review: 2.2 (remove boundary/reservation machinery, re-home the 3 side-stories), 2c (promote `PRESS_CAPITALISM` → `AGENT_03B_WILD` between hype and lead), rewrite the 14 tests for the new invariants, restore 100% green.

## Questions we want feedback on

1. Is the `pool` continuation mode + `eligibleArcBeatPool` a sound, minimal way to get conditional shuffling, or is there a cleaner seam in this engine?
2. Removing `boundaries`/`reservations`/`locks` entirely (2.2) and relying only on flag-gating + `reserveCallback`-by-story-count — any correctness risk (dead ends, soft-locks, callback that never becomes due, two ambient in a row) we should guard with tests?
3. `oncePerRun:true` on arc beats is how we prevent a free beat re-surfacing. Better idea (e.g. exclude-flag) given the rest of the engine?
4. The glued chain (`AGENT_04→07`) stays forced. Is the boundary between "free/pool" and "glued/forced" drawn in the right place for a Reigns feel without breaking causality?
5. Test strategy for the rewrite of the 14: what invariants would you assert (statistical over seeded runs vs deterministic traces)?

## How to run

- Full suite: `node --test`
- New invariants only: `node --test tests/agents-flag-gating.test.cjs`
- Deck analyzer: `node .agents/skills/reigns-like-narrative-design/scripts/audit-deck.cjs cards.json --json`
