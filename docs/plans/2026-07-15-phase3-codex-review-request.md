# Phase 3 / Batch 1 — Review request for Codex

Status: **Batch 1 landed and green. 121/121 tests pass; analyzer 0 errors (6 pre-existing warnings, unrelated).**
Branch: `quality-prototype`.

- **Implementation diff to review: `git diff 7c6e521 HEAD`** (commits `654cce2`, `c5193d4`, `7e7ab24`).
- Design/approval trail (context only): `bf81d7f..7c6e521`.

We are **not** asking you to fix the 6 analyzer warnings (`same-next-without-future-state` on `OPEN_01`, `OPEN_03_AUDIT`, `OPEN_04`, `AGENT_04_LEAD`, `AGENT_05_ORDER`, `PADEL_03_TEAM`) — they predate this work and belong to Phase 4.

## Context

Phase 3 = **deck shape**: grow the ambient pool so runs differ from each other, without diluting the Agents side-stories. Phase 2 (Reigns-style conditional flag-gating, "Variant B") is closed. See `docs/plans/2026-07-15-STATUS.md`.

Author-locked constraints for all Phase 3 content (`docs/plans/2026-07-15-phase3-situation-bank.md`):
1. Legible to an office/digital/early-founder audience — no heavy tech jargon, but **not** lowest-common-denominator.
2. Real chaos/absurdity, not tame startup problems.
3. Rollercoaster: each card contains both "fine" and "catastrophe".
4. **pre-seed scale + fully remote — there is no office.**
5. **No new characters.** Faceless one-off forces (police, a squatter, a guru) are allowed only if they never speak and never recur.
6. Must not break the funnel/win economy (a paid pilot / real payment is a win condition; ambient cannot hand one out).
7. No social-media brand names; currency is dollars.

## What landed (Batch 1: 10 cards, 7 distinct senders)

**4 one-shots** — `kind:"pressure"`, `continuation:"ambient"`, `weight:1`, `oncePerRun:true`:
`AMBIENT_THERAPY_LEAK` (@b2buddy_bot), `AMBIENT_BLACK_SQUARE` (@pixel_perfect), `AMBIENT_CHAKRA_RETREAT` (@unicorn_hunter, `cash.max:45`), `AMBIENT_CHAIR_STANDOFF` (@error404, `cash.max:35`).

**3 two-card side-stories** — seed (`kind:"pressure"` + `setFlags` + `delay`) → payoff (`callbackOnly:true`, `kind:"sideStory"`, `requires` the flag). The payoff is deliberately **branch-specific** (only one choice delays):
| Seed | Flag | Payoff |
|---|---|---|
| `AMBIENT_DOMAIN_RANSOM` (@hustler) | `domain_forged` | `AMBIENT_DOMAIN_LAWSUIT` (@hustler) |
| `AMBIENT_DECK_XXX` (@hype_queen) | `deck_on_xxx` | `AMBIENT_DECK_XXX_INVESTOR` (@unicorn_hunter) |
| `AMBIENT_MOM_POLICE` (@i_love_cats72) | `mom_worried` | `AMBIENT_MOM_FAMILY` (@i_love_cats72) |

Also: RU entries added to `scripts/build-card-catalog.cjs`; `MISTAKERY_CARDS_EN_RU.md` + `cards.bundle.js` regenerated.

**Test edits — please confirm these are honest, not loosened:** `tests/content.test.cjs` only updates factual counts (`deck.cards.length` 43→53, `pressure.length` 6→13) and **registers** the two new `resourceRange` users in the enforced whitelist. All assertions still bind.

## Known finding — self-reported, deliberately NOT fixed yet

**Ambient cards whose sender also carries arc beats collide with the arc.** The author caught this live in play:
`@hype_queen` fires `AMBIENT_DECK_XXX` (she puts the pitch deck on a porn site) while she is simultaneously the arc's viral packager in `AGENT_03_HYPE` (she hypes the agents demo). One character runs two unrelated campaigns at once → the arc's causality reads as noise immediately.

4 of the 10 new cards come from arc-carrying senders and have **zero gating** (no `activeArcs`, no `requires`, no `excludes`):

| Card | Sender | Collides with |
|---|---|---|
| `AMBIENT_DECK_XXX` | @hype_queen | `AGENT_03_HYPE` |
| `AMBIENT_CHAKRA_RETREAT` | @unicorn_hunter | `AGENT_01` |
| `AMBIENT_CHAIR_STANDOFF` | @error404 | `AGENT_02_DEV`, `AGENT_03B_WILD`, `PADEL_03_TEAM` |
| `AMBIENT_DECK_XXX_INVESTOR` | @unicorn_hunter | `AGENT_01` (gated only by `deck_on_xxx`) |

The other 6 are safe: @b2buddy_bot, @pixel_perfect, @hustler, @i_love_cats72 carry no arc beats.

**Our proposed fix — please validate or replace.** Gate with **`excludes` on arc flags, not `requires`.** Rationale: Padel runs never set the Agents flags, so a `requires`-gate would make the card unreachable in roughly half of all runs. Sketch:
- `AMBIENT_DECK_XXX` → `excludes:["patch_built"]` (her stunt can only precede the agents campaign).
- `AMBIENT_CHAIR_STANDOFF` → `excludes:["empathy_demanded"]` (the chair standoff cannot contradict "patch delivered").

Agents flag chain for reference: `AGENT_01`→`empathy_demanded`; `AGENT_02_DEV`→`patch_built`; `AGENT_03_HYPE`→`hyped`; `AGENT_03B_WILD`→`hype_consequence_seen`.

## Questions

1. **Is `excludes`-on-arc-flags the right seam** for the collision, and what is the correct exclusion set per card? **Blocker we cannot solve cleanly: the Padel arc sets no flags at all** (`PADEL_*` have no `setFlags`), so there is no state to exclude on for the `@error404` × `PADEL_03_TEAM` collision. What is the right seam there that does not invent bookkeeping state?
2. **Dilution.** Before Batch 1 the Agents side-stories surfaced at payroll ~39%, dev ~38%, b3 ~19%. Did +10 ambient cards push those down, and do weights/windows need re-tuning? (Phase 3 explicitly owns "fine-grained richness".)
3. **Callback wiring.** Our seeds are `kind:"pressure"` carrying `delay`, whereas the payroll-style seeds are `kind:"sideStory"`. Is a **pressure seed with a delay** legal and scheduled correctly? Can a delayed payoff become due and never fire, or be dropped at run end? Branch-specific delay (only one choice delays) — any dead-state risk?
4. **Resource legality vs State Bible.** `AMBIENT_MOM_FAMILY` grants Cash from the family's "rescue fund" — legitimate (funding / personal money, cf. `PRESS_MOM`) or a violation of "Cash rises only via payment, funding or explicit savings"? `AMBIENT_THERAPY_LEAK` moves Customers on a public leak — is public attention a valid external signal, or is this the rejected `Show the list → Customers +5` pattern?
5. **Rejected-pattern regressions** (`docs/core/REJECTED_PATTERNS.md`): faceless one-off entities (squatter, police, guru) — do they cross the "one-off entity for a punchline" line? Two-ambient-in-a-row, converging choices, `too late` cancellation?
6. **Kind choice.** Are the 4 one-shots correctly `kind:"pressure"` (which auto-implies `oncePerRun`) rather than `sideStory`?

## Not in scope

Copy quality/voice (Phase 5, Fable). Agents arc causal repair (Phase 4). Run-length vs `maxTurns` decision (Phase 6).
