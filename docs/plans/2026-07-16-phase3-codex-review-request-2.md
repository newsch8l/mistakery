# Phase 3 / Batch 1 — Review request for Codex, round 2

Status: **all round-1 findings addressed. 121/121 green; analyzer 0 errors (same 6 pre-existing warnings).**
Branch: `quality-prototype`. **Diff to review: `git diff 7e7ab24 HEAD`** (`917aea0`, `f96bcfd`, `979fd95`, `f01b5ca`).
Round-1 report and our original request: `docs/plans/2026-07-15-phase3-codex-review-request.md`.

## Response to each round-1 finding

**[P1] Payoffs lost — fixed.** Confirmed your diagnosis. All three seeds now carry `excludes`, mirroring Payroll/Dev/B3:
- `AMBIENT_DOMAIN_RANSOM`, `AMBIENT_MOM_POLICE` → `excludes:["hype_consequence_seen"]`
- `AMBIENT_PROMO_XXX` → `excludes:["patch_built"]` (stricter; also resolves the sender collision)

Measured over the same 10k seeded runs: seeds drawn past `AGENT_04_LEAD` **536 → 0**; payoff loss **25.8% → 5.3%**. We believe the residue is runs that reach an ending or crisis before the 3-decision delay elapses — **please sanity-check that claim** (question 2).

**[P1] Blind tests — fixed.** Added the three branch-specific pairs to `tests/package-a-production.test.cjs` as `NEW_PAIRS` (each entry names the one side that sets the flag and schedules the delay). New assertions: `lateNewSeed === 0`, `newCallbackScheduled > 0`, and payoff loss `< 8%`. **We verified the guard actually fails**: removing the three `excludes` turns the suite red with `a Batch 1 seed was drawn past AGENT_04_LEAD, where its payoff can never be delivered`.

**[P2] Dilution — fixed, without touching weights.** Narrowing the windows was enough. Over direct-Agents runs: payroll **26.6 → 32.7%**, dev **27.1 → 32.9%**, b3 **13.9 → 17.0%** (pre-Batch-1 baseline 33.6/33.4/16.9). Per your advice, added a per-story regression floor (`legacyFloor` 0.31/0.31/0.155) so a future ambient card cannot crowd them out silently.

**[P2] Customers effects — fixed.** Attention is not funnel movement:
- `AMBIENT_THERAPY_LEAK`: Customers removed. Also, on the author's note, **Team damage now lands on both branches** — the team already read it, deleting the posts does not unread it. The branches differ by degree (own it hurts them more) and Founder moves in opposite directions.
- `AMBIENT_PROMO_XXX`: traffic-driven Customers removed.
- `AMBIENT_BLACK_SQUARE`: restoring the buttons no longer grants Customers (an internal fix creates no external interest). Keeping the void still costs Customers — prospects hitting a dead site is a real external effect; **flag if you disagree**.
- `AMBIENT_MOM_POLICE`: Customers removed (it cited a call the text never showed).

**[P2] Aunt Vera — fixed.** De-named to "$2000 already".

**[P2] The investor's friend — we disagree and kept it.** Rationale: he never speaks, never recurs and carries no lore, which is exactly the faceless one-off category Batch 1 permits (as with the police and the squatter); he was already de-faced, and you offered "remove OR de-face". He also reads truer to Character Bible — the investor never admits his own exposure, he deflects to save face, so blaming a friend is more in character than acknowledging how he found it. **Tell us if you still think this crosses the one-off-entity line.**

**Chair — held.** Per your note that no current flag can gate `@error404` without making the card unreachable, the author pulled `AMBIENT_CHAIR_STANDOFF` from the deck; it returns in Phase 4. Deck is now 52 cards, 12 pressure.

**Promo weight 1 → 3.** `excludes:["patch_built"]` left the stunt at 4.3% of runs (nearly invisible). Weight 3 lifts it to 11.7% with no measurable cost to the legacy stories (measured 32.3/32.2/16.7).

## New since round 1: an entity collision the metrics could not see

The author played a real run and the arc read as incoherent. Cause, visible only in the transcript: the stunt put **"our pitch deck"** on a porn site, and two beats later the arc says **"enterprise buyers want the deck"** and **"one enterprise account will not stop opening the deck"** — the same object. The run reads as *"the porn-site deck is what produced the buyer."* Our own `excludes:["patch_built"]` made it worse by pinning the stunt immediately before the arc's deck thread.

Fixed by changing the object, not the gating: the marketer now stunts the **company promo video**. Ids/flag renamed `AMBIENT_PROMO_XXX` / `AMBIENT_PROMO_XXX_INVESTOR` / `promo_on_xxx`.

Generalised rule we adopted: **an ambient card that touches the main story's objects or vocabulary (deck, leads, prospects, demo, the product) does not read as ambient — it reads as a broken main story.** Ambient that works is about the founder's life (mom, therapy, domain).

## Context: the author pivoted the content shape (`f01b5ca`)

Measured over 10k runs: a run is 19.1 cards = **6.0 opening + 7.2 arc beats + 5.8 varying** → **69% of every run is on rails**. Only 60.6% of Agents runs reach the payoff; 39.9% die on cash mid-plot (pre-Batch-1: 65.8% / 35.0%). The gap between arc beats is a median of 1 card and was **identical before Batch 1**, so ambient cards are not fragmenting the story — the rail's dominance is.

Author's decision: pursue the real Reigns shape. **Through-line = survive + find the first client.** Break the rail into storylets; **several routes must lead to a first client**, since one mandatory rail cannot be optional. Fixed onboarding stays. This supersedes the previously locked "the frame is enough" and the 8-beat Agents rail; the Variant B engine stands. Phase 4 is redefined.

## Questions

1. **Gating.** Are the three `excludes` the right seam? Specifically `AMBIENT_PROMO_XXX excludes:["patch_built"]` + `weight:3` — any dead state, and does the narrow pre-patch window interact badly with the opening health module (mom/coma) which still runs on the old boundary machinery?
2. **Residual loss.** Is the remaining 5.3% genuinely only runs ending before the delay elapses, or is something else dropping payoffs? Is `< 8%` an honest bound, or is it hiding a real leak?
3. **Test honesty.** Are `lateNewSeed === 0`, the loss bound and `legacyFloor` (0.31/0.31/0.155) sound and non-gameable? The floors sit ~1.5pp under current measurements — too tight (flaky) or too loose (useless)?
4. **The friend** — do you accept our disagreement, or does it still violate the one-off-entity rule?
5. **Cash debt.** Batch 1 costs ~5pp of story completion (65.8 → 60.6) because our cards drain cash. Should we soften which effects, and does that conflict with the 39.9% cash_low being pre-existing and arguably intended pressure?
6. **The pivot.** Any structural risk in "break the rail into storylets + several paths to a first client"? Chief tension we see: a paid invoice/pilot **is** the win condition (State Bible §5), so every additional client-path is also an additional win-path — how do we add routes without trivialising the win or inflating the ending matrix?

## Not in scope

Copy voice (Phase 5, Fable). The Phase 4 storylet plan itself (not yet designed). Run-length vs `maxTurns` (Phase 6).
