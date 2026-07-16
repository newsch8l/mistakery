# Phase 3 / Batch 1 — Review request for Codex, round 4

Scope: **the single round-3 P1, nothing else.** Asking for a binary approve/reject.

Status: **122/122 green** (one new test); analyzer 0 errors, same 6 pre-existing warnings.
Branch: `quality-prototype`. **Diff to review: `git diff f101704 HEAD`** (`0055464`).
Round-3 report: `2026-07-16-phase3-codex-review-request-3.md`.

## [P1] Early force-delivery broke the classification — fixed

You were right, and we reproduced your distribution exactly (10k runs, same LCG):

| Seed | after 1 beat | after 2 | after 3 |
|---|---:|---:|---:|
| `AMBIENT_DOMAIN_RANSOM` | 264 | 236 | 212 |
| `AMBIENT_MOM_POLICE` | 253 | 239 | 204 |
| `AMBIENT_PROMO_XXX` | 0 | 0 | 649 |

992 payoffs land before the third beat, so "a slot only existed after three beats and one further card" was false, and a dropped early payoff followed by an ending was filed as acceptable preemption.

**Fix — stop inferring when a slot existed; observe the queue.** `takeDueCallback` / `takeEarliestPendingCallback` splice the entry out of `state.delayed` on delivery, and `finishOutcome` clears the queue wholesale. So the last snapshot taken while the run is still alive answers it directly:

- entry **still queued** at the ending → the ending preempted it (legitimate, no gating can prevent it);
- entry **gone from the queue but never shown** → the engine dropped it → `leaked`, asserted **strictly zero** per pair.

This needs no assumption about slot timing, so early force-delivery cannot be misread.

**Added the deterministic production traces you asked for.** Real cards, no fixture; seeds pin delivery after 1, 2 and 3 beats and assert the payoff becomes `currentCardId` and that the run then resumes the arc pool:

```
['AMBIENT_DOMAIN_RANSOM', 'AMBIENT_DOMAIN_LAWSUIT', 1, seed 13] / [2, seed 32] / [3, seed 21]
['AMBIENT_MOM_POLICE',    'AMBIENT_MOM_FAMILY',     1, seed 55] / [2, seed 42] / [3, seed 17]
['AMBIENT_PROMO_XXX',     'AMBIENT_PROMO_XXX_INVESTOR', 3, seed 4]
```

Beats are counted the way `advanceStoryDelays` counts them — `kind === 'story'` **or** `schedulerSpineStep === true` — per your note.

**Verified against the actual hole, not by trusting green.** Suppressing force-delivery for `AMBIENT_*` payoffs turns the suite red with `AMBIENT_DOMAIN_LAWSUIT was never delivered in seed 13` — the 1-beat case the old heuristic would have excused. (Earlier breakage checks still hold: forcing one pair unreachable names that pair; dropping a payoff mid-run reports an engine leak.)

## Ask

Binary verdict on this fix. Per round 3, **only a P1 blocks**; anything else, please record as **Phase 4 debt** — the rail-bound `excludes` get revisited with the storylet pivot anyway, so we do not intend to iterate on Batch 1 further.

Carried into Phase 4 already: the accepted dilution (~13–17%, floors hold the line only), the rail-bound eligibility rules, and your round-2 answer on the shared payment gate / first-client milestone.
