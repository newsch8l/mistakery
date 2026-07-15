# Phase 2.2 — Review request for Codex, round 3

Status: **intermediate checkpoint. 98/119 pass, 21 fail (all legacy, characterized).** Two things to validate before we replicate + remove machinery:
1. our implementations of your round-2 P1 fixes (generic pool continuation);
2. the **payroll migration as the reference pattern** before we apply it to dev/b3 and delete the boundary machinery.

Branch: `quality-prototype`. Baseline `718d0cc`. This round: commits `5545a10` (continuation fixes), `fb02f84` (2c beat), `d7ebf94` (payroll migration).

## 1. Round-2 P1 fixes — verify our implementations

- **Finding 3 (crisis strands a pool beat):** `pendingContinuation` is now stored for `pool`/`weighted` transitions even with an empty id list (`game.js`, crisis block in `resolveChoice`); `resolveCrisis` replays it. Test: `a rescued crisis on a pool beat resumes the arc pool`.
- **Finding 1 (force-delivered callback dead-ends):** new `state.queuedPool`; after an inserted/force-delivered callback resolves, resume rebuilds the pool. Test: `a force-delivered callback resumes the arc pool afterwards`.
- **Finding 5/F3 (stale resume snapshot):** pool-origin resume rebuilds `eligibleArcBeatPool` (branch `transition.pool` in `queueOrContinue`) instead of replaying stored ids.

Question A: are these three implementations correct and free of the same class of edge case you found before (e.g. a resume/crisis path that still loses continuation, double-counts a pressure slot, or force-delivers inside the glue)?

## 2. Payroll migration — the reference pattern

Old: seed used `reserveCallback` → `state.reservations`/`remainingSpineSteps`, placed at boundary slots. Callback hidden only by `scheduler.role`.

New (`d7ebf94`, see `PAYROLL_RESTRICTED_AI_SEED`/`_CALLBACK` in `cards.json`):
- Seed: `scheduler` removed; both choices `delay: { card: …_CALLBACK, storyDecisions: 3 }` and set a causal `payroll_seeded` flag.
- Callback: `scheduler` removed; `callbackOnly: true` + `requires: ["payroll_seeded"]`.

This is meant to close your findings:
- **F2 (leak into pool):** `callbackOnly:true` keeps it out of the ambient/side-story pool.
- **F4 (stale pending blocks glue):** the callback `requires` a flag the seed sets in the same choice, so it is always eligible whenever it is pending — the ineligible-pending deadlock cannot arise for a migrated module.

Behaviorally verified: a pool-inserted seed creates the delayed callback (`remainingStoryDecisions:3`) and the run continues; `takeDueCallback` delivers it when due.

Question B: is `callbackOnly:true` + `requires:<flag the seed sets>` a sufficient and correct contract for every migrated callback, or is there a case (crisis between seed and due, arc switch Padel→agents, `oncePerRun` interplay, delay never decrementing because no story card resolves) where the delayed callback is lost or wrongly delivered?
Question C: `excludesPendingCallbacks` on `AGENT_04` blocks on ANY `state.delayed` entry, but force-delivery only delivers *eligible* ones. With typing this can't strand the glue in normal play — but should we still harden it (e.g. count only eligible pending, or drop provably-dead entries) as defense in depth?
Question D: anything wrong with migrating dev-hostage and b3 by the exact same recipe, given they can set different flags and (b3) is `callbackOnly` already?

## 21 failing tests — all legacy, do not fix

Old boundary/reservation/lock machinery + old Agents traces (now 8 beats) + retired `PRESS_CAPITALISM` + payroll reservation tests. All to be rewritten in one pass after dev/b3 migrate and the machinery is deleted. No engine regression.

## Статус после инкорпорации (round 3)

Все находки приняты и закрыты (17/17 инвариантов зелёные, полная суита без новых поломок):
- **F1** — кризис на force-доставленном callback: `poolLikeContinuation` теперь включает `resume && pool`. Тест `a crisis caused by a force-delivered callback still resumes the arc pool`.
- **F2** — поздний seed: payroll-seed получил `excludes: ["hyped"]` (ранняя витрина). Решение: `storyDecisions` = **целевая/максимальная** задержка (доставка не позже склейки), витрина гарантирует минимальный зазор. Тест `the payroll seed is windowed to the early phase`.
- **F3** — контракт теперь ЭНФОРСИТСЯ: `validateDeck` отклоняет `delay` не на `callbackOnly` sideStory; `takeEarliestPendingCallback` доставляет только `callbackOnly` sideStory. Тесты на валидацию + чистоту канона.
- **F4** — добавлен поведенческий тест тайминга payroll.

Принятые решения (Codex B/C):
- **maxTurns очищает pending callbacks** при достижении лимита — принято как правило жёсткой концовки (прогон и так закончился). Кода не меняем.
- Типизированный callback, ставший ineligible, — нарушение инварианта (ловим тестом), НЕ молчаливый сброс.
- **b3 при миграции — асимметрия:** только ветка «Send three more» ставит `delay`/callback; «Leave them alone» не создаёт ни delay, ни pending-флаг. Сохранить branch-specific requires/excludes; тестировать обе ветки.

## How to run
- New invariants (12 green): `node --test tests/agents-flag-gating.test.cjs`
- Full suite: `node --test`
- Diff: `git diff 198215f..d7ebf94` (this round) and `git diff 718d0cc` (whole Phase 2)
