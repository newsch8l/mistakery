# Phase 2 (complete) — Review request for Codex, round 4 (final)

Status: **Phase 2 complete on the Agents vertical slice. Full suite 119/119 green.** This round is a completeness/coverage check, not an engine correctness check (that was validated over rounds 1–3, all findings incorporated).

Branch: `quality-prototype`. Baseline `718d0cc`. Review the whole Phase 2 with `git diff 718d0cc`. Round-3 endpoint was `d7ebf94`; everything since is `git diff d7ebf94`.

## What you have NOT seen yet (rounds 1–3 covered engine + payroll pattern)

1. **dev-hostage and b3 migrations** (`7e702ae`). dev follows the payroll pattern (both branches set a shared `dev_hostage_seeded` flag + `delay` to a typed `callbackOnly` callback). b3 is asymmetric per your round-3 answer D: only the "Send three more" branch schedules the delay; "Leave them alone" sets no delay/pending flag; the callback already `requires` `b3_followups_authorized` (set only by the follow-up branch). Both seeds windowed early (`excludes hyped`).
2. **Machinery removal** (`a585d0f`). Removed the now-unused Agents boundaries (`agents_entry_seed`, `agents_pre_serious_lead`) and the dead `PRESS_CAPITALISM` card (promoted into `AGENT_03B_WILD` in `fb02f84`). Kept: the opening health-module boundaries (`opening_shared_seed`, `opening_health_resolution`) and the Padel lock — that module is a separate, later migration (the opening has no active arc). Note: `protectedPairs` is retained in `meta.scheduler` but the engine never reads it (confirmed by grep) — it is inert data; flag it if you disagree.
3. **The full test rewrite** (`b571583`, `cbdf73e`, `b51f074`) — the main thing to review.

## Primary question: did the test rewrite preserve real coverage?

~26 tests were rewritten or deleted to reach green. Please check for weakened coverage:

- **Deletions** — are any of these removals a real loss, or purely obsolete (removed machinery)?
  - g2-rollback: "the named Agents entry boundary can insert B3", "B3 seed withheld while another callback reserved", "B3 cannot interrupt forced causal pairs" (used PRESS_CAPITALISM), "B3 callback counts story decisions" (reservation-based), "crisis rescue preserves pending B3 callback" (reservation-based), "Publish one demo restores the direct route".
  - package-a-production: "a Package A reservation survives ambient pressure and a successful crisis rescue" (reservation-based).
  - balance: "the capitalism callback returns 2–5 decisions" (PRESS_CAPITALISM gone).
- **Rewrites** — do the new versions actually assert the new-model behavior, or do they pass trivially?
  - The two 10k invariants now assert `median(sideStories) >= 2` and `zeroPackageA === 0` (was `>= 3`). Is relaxing to median-2 hiding a regression, or a fair reflection of the pool-weighted model? (Measured: median 2, zero empty runs; the old `>= 3` was calibrated to guaranteed boundary insertion.)
  - "32 opening traces" trimmed to the health module only (startup seeds now fire from the Agents pool, not an opening boundary) — is dropping the Agents-matrix assertions acceptable, or should a pool-based Agents eligibility assertion replace it?
  - branch-pair + deterministic-trace payroll/dev rewritten from full-route traces to "seed schedules callback + flags; callback applies flags". Is that sufficient, or did we lose the end-to-end delivery assertion? (Delivery is now covered by the 10k runs + `tests/agents-flag-gating.test.cjs`.)
- **New invariant file** `tests/agents-flag-gating.test.cjs` (24 tests) is the intended home of the new-model guarantees. Does it actually cover: gating order, pool advancement, crisis+pool continuation, force-delivery + resume, typed-callback contract (validateDeck + force-delivery guard), timing window, dev/b3 migration shape? Any gap a future regression could slip through?

## Secondary questions

- Any place where the removed machinery is still referenced or half-removed (dead code, stale `meta` entries) beyond the inert `protectedPairs`?
- `AGENT_05_ORDER` gained `stateEffects` reading `agents_positioned_*`, and `AGENT_03B_WILD` reads `empathy_deployed` — added to keep those flags non-dead. Are these readers meaningful or just flag-consumers to satisfy the "no dead flags" check?

## How to run
- Full suite: `node --test` (119/119)
- New invariants: `node --test tests/agents-flag-gating.test.cjs`
- Deck validation: it runs inside `startRun`; `node -e "const e=require('./game.js');console.log(e.validateDeck(require('./cards.json')))"` should print `[]`.
- Note: `tests/browser-smoke.cjs` is NOT part of `node --test` (name is not `*.test.cjs`) and needs `playwright` installed; out of scope here.
