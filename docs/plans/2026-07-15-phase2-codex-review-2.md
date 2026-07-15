# Phase 2.2 (WIP) — Review request for Codex, round 2

Status: **intermediate checkpoint. 97/115 pass, 18 fail (characterized below).** This round follows your first review (all 5 findings accepted; see `docs/plans/2026-07-15-phase2-codex-review-request.md` and the "incorporated" commit `887da90`).

Branch: `quality-prototype`. Compare against baseline `718d0cc`. This round's work is commits `198215f` (scheme + helpers) and `887da90` (round-1 fixes).

## What changed since round 1

We designed and implemented the scheme that closes your F1/F5/empty-pool findings, and hit an ordering interaction we want you to validate.

**Scheme (docs/plans/2026-07-15-phase2-engine-plan.md → "Выбранная схема закрытия рисков"):**
- **F1 (callback lost in forced tail):** the glue-entry beat `AGENT_04_LEAD` gets `excludesPendingCallbacks:true`. The customer-conversation glue `AGENT_04→07` cannot begin while any callback is pending, so callbacks always resolve during the free-beat phase. No delivery happens inside the glue.
- **Anti-deadlock / empty-pool-not-terminal:** if the arc pool is empty only because the glue entry is waiting on a pending callback, the engine force-delivers the earliest eligible pending callback (`takeEarliestPendingCallback`) instead of `endWithoutProof`. Scoped to `pool` mode only; `weighted` mode is unchanged.
- **F5 (microstory overlap):** policy = allow overlap (`state.delayed` is an array), but every open microstory must close before the glue (guaranteed by the F1 gate).

**Tests:** `tests/agents-flag-gating.test.cjs`, now 8 green invariants, including `glue-entry beat is blocked while any callback is pending` and `a stuck arc pool with a pending callback delivers it, not no_proof`.

## The ordering finding we want validated

Wiring the glue-gating into the live deck **before** promoting `PRESS_CAPITALISM` (step 2c) collides with that legacy card, which is still a `delay`-based **pressure** callback scheduled by `AGENT_02_DEV`. Because `AGENT_04` now waits on it, the engine force-delivers `PRESS_CAPITALISM` early — which (a) shifts its timing and (b) can stack two pressure cards.

Proven by experiment: removing the `AGENT_02_DEV` → `PRESS_CAPITALISM` delay clears 2 of the 4 new failures immediately (`production runs never repeat or stack pressure cards`, `accepting Padel suppresses later variable callbacks`). The other 2 are direct `PRESS_CAPITALISM`-timing tests to be rewritten in 2c.

**Our conclusion:** correct sequencing is **2c (promote `PRESS_CAPITALISM` → `AGENT_03B_WILD`, removing its delay) BEFORE wiring the glue-gating.** After 2c, migrated side-story callbacks are `sideStory` kind (not pressure), so force-delivery cannot stack pressure.

## 18 failing tests — breakdown

- **14 — known by design (round 1):** old `boundaries`/`reservations`/`slot`/`lock` machinery + old forced Agents traces. To be rewritten during 2.2b, not restored.
- **4 — this round's ordering artifacts:**
  - `production runs never repeat or stack pressure cards` — force-delivering legacy `PRESS_CAPITALISM` (pressure) stacks. Vanishes after 2c.
  - `accepting Padel suppresses later variable callbacks even after leaving for agents` — same `PRESS_CAPITALISM` interaction. Vanishes after 2c.
  - `deterministic trace: Agents Deploy route`, `the capitalism callback returns two to five intervening decisions after deployment` — direct `PRESS_CAPITALISM` timing assertions; rewritten in 2c.

## Questions for round 2

1. Is the glue-gating scheme (F1 via `excludesPendingCallbacks` on the glue entry + `pool`-only empty-pool force-delivery) sound and minimal? Any hole where a callback could still be lost or the run could still dead-end?
2. Do you agree the correct fix for the 4 artifacts is **sequencing** (do 2c first), rather than special-casing `PRESS_CAPITALISM`?
3. Even after 2c, should `takeEarliestPendingCallback` refuse to force-deliver a `pressure`-kind card (to never bypass the no-two-ambient-in-a-row rule), or is restricting force-delivery to `sideStory`/callback kinds the right guard?
4. F5 policy "allow overlap, all close before glue": any scenario where multiple pending callbacks + the F1 gate can still starve a beat or reorder a causal pair?
5. Is `excludesPendingCallbacks` on the single glue-entry beat the right granularity, or should the whole glued chain be marked so a mid-glue reservation (if one ever existed) can't slip in?

## Статус после инкорпорации (обновлено)

Все 5 находок round 2 приняты; два P1 воспроизведены эмпирически. Сделано:

- **Finding 3 (кризис теряет pool-континуацию) — ИСПРАВЛЕНО.** `pendingContinuation` сохраняется для pool/weighted даже с пустым `next`; rescue возобновляет выбор из пула. Тест `a rescued crisis on a pool beat resumes the arc pool`. Это был предсуществующий баг pool-режима.
- **Finding 1 (force-delivered callback → no_proof) — ИСПРАВЛЕНО.** Введён `state.queuedPool`: после вставленного/force-доставленного callback движок возобновляется через пул. Тест `a force-delivered callback resumes the arc pool afterwards`.
- **Finding 5 / F3 (resume по stale-снимку) — ИСПРАВЛЕНО.** Pool-origin resume пересобирает `eligibleArcBeatPool` вместо списка id (ветка `transition.pool`).
- Суита: 18→16 (два старых crisis/Package-A теста позеленели попутно), новых поломок нет. Новые инварианты 10/10.

Осталось по round 2 (в шаге миграции, порядок Codex):
- **Finding 2** — каждый мигрируемый callback пометить `callbackOnly:true` + причинные `requires` (иначе течёт в side-story пул после снятия scheduler-меты).
- **Finding 4** — политика для pending-callback, ставшего ineligible (не должен вечно блокировать склейку → no_proof).
- **answer-3** — force-delivery доставляет только `callbackOnly:true` + `kind:sideStory` (никогда non-due pressure). Добавляю вместе с 2c, когда `PRESS_CAPITALISM` уже повышен (иначе создаёт finding-4 deadlock с ним).

Принятый порядок Codex: (1) generic pool continuation ✅ → (2) 2c promote PRESS_CAPITALISM → (3) migrate+type callbacks → (4) wire gate → (5) remove machinery.

## How to run
- Full suite: `node --test`
- New invariants: `node --test tests/agents-flag-gating.test.cjs`
- Reproduce the ordering finding: remove the `AGENT_02_DEV` left-choice `delay` in `cards.json`, rebuild (`node scripts/build-offline-deck.cjs`), re-run — 2 of the 4 artifacts clear.
