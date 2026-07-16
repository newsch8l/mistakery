# Phase 3 / Batch 1 — Review request for Codex, round 3 (final)

Status: **round-2 findings fixed. 121/121 green; analyzer 0 errors (same 6 pre-existing warnings).**
Branch: `quality-prototype`. **Diff to review: `git diff 0c3d39c HEAD`** (`127d56f`).
Prior rounds: `2026-07-15-phase3-codex-review-request.md`, `2026-07-16-phase3-codex-review-request-2.md`.

## Please treat this as the LAST round for Batch 1

We are asking for a **binary verdict on a bounded scope**, not another improvement list. Rationale:

- Rounds 1 and 2 found real defects (lost payoffs; guards that measured the wrong thing). Both are fixed and verified.
- **You told us the gating is rail-bound**: `patch_built` / `hype_consequence_seen` may move or disappear when Phase 4 breaks the rail into storylets, so all three eligibility rules get revisited anyway. Further polish of Batch 1's windows is throwaway work.
- The author's constraint: stop iterating and move to the pivot.

So: **only a P1 should block.** Anything P2 or below — please list it as **Phase 4 debt** rather than a change request, and we will carry it into the storylet work.

## Response to round-2 findings

**[P1] Floor used the wrong denominator — fixed, and the framing corrected.** You were right, including the correction to your own round-1 figures. Our "dilution is cured" claim was invalid: we measured over direct-Agents runs and compared against an all-runs baseline. Same-denominator reality:

| Story | Pre-Batch-1 | Now |
|---|---:|---:|
| Payroll | 38.71% | 32.24% |
| Dev | 38.07% | 32.72% |
| B3 | 19.33% | 16.73% |

Dilution of ~13–17% is real and did not go away. The test no longer pretends otherwise: the comment records the true baseline, names the remainder an **accepted regression**, and states that the floors (0.31/0.31/0.16) only hold the line against *further* loss — they do not encode the baseline.

The author accepted the regression deliberately (16 Jul 2026). Reasoning: a run offers ~5.8 ambient slots and Batch 1 grew the competing pool from ~13 to ~22 cards, so a per-card share drop is arithmetic, not a bug. Squeezing the new cards back to invisibility trades one loss for another; the Phase 4 pivot shrinks the rail and frees slots, which is the actual fix. **If you consider the accepted dilution a blocker rather than debt, say so explicitly.**

**[P1] Percentage bound licensed a future leak — fixed.** Removed the `<8%` allowance entirely. Now per pair, never aggregated:
- `scheduled > 0` per `seedId` (a dead pair can no longer hide behind two live ones)
- `late === 0` per pair
- `leaked === 0` — **strict zero** for a payoff lost in a run that kept playing

Terminal preemption is **classified, not budgeted**. Since `advanceStoryDelays` only ticks on `kind:'story'` beats and a due payoff can only land on a later decision, we count a loss as a real leak iff three story beats elapsed after the seed **and** at least one further card resolved; otherwise it is preemption. This should also capture the 22 cases you found where the third story step arrived but a crisis or terminal B3 ending fired on the same decision.

**Both guards were verified by breaking them**, not by trusting green:
- forcing `AMBIENT_MOM_POLICE` to require a never-set flag → `AMBIENT_MOM_POLICE never scheduled its payoff — the pair is unreachable`
- making the engine drop `AMBIENT_*` callbacks at delivery → `AMBIENT_DOMAIN_RANSOM lost a payoff in a run that kept playing — that is an engine leak, not an ending`

**[P2] Cash — softened exactly where you pointed.** `AMBIENT_DOMAIN_RANSOM` buy-back −4 → −2; `AMBIENT_CHAKRA_RETREAT` tranche cut −3 → −2. Also took your observation that the chakra range (`cash.max:45`) deliberately targeted already-poor runs and then charged them: it now carries `cash.min:22`, and that bound is declared in the `content.test.cjs` whitelist.

Measured (direct-Agents runs, same LCG as the suite): story completion **59.7% → 64.8%** against a 65.7% baseline; `cash_low` **42.8% → 38.0%** against 35.3%.

**[P2] The friend — thank you for accepting the disagreement.** Unchanged.

## Questions (kept minimal)

1. Are the two rewritten guards now honest and non-gameable — specifically, is the leak/preemption split correct, or can a real leak still be misclassified as preemption?
2. Is the accepted-dilution framing sufficient to close Batch 1, or do you rate it a blocker?
3. **Is there anything that MUST be fixed before Phase 4 begins**, as opposed to during it? That is the only list we intend to act on now.

## Not in scope

Copy voice (Phase 5). The Phase 4 storylet design (your round-2 answer on the shared payment gate and the first-client milestone is noted and will seed it). Run-length vs `maxTurns` (Phase 6).
