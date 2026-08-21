# Project Status

## Verified snapshot

- Updated: 2026-08-21 19:14 MSK
- Branch: `design/personal-chat-runtime`
- Commit/base: `84fb9b878deff127efb7f04af1888df114abd020`
- Published implementation commit: `e2faaf6f0c72b585f0a111ee69fadbe8a31b3cc8`
- Worktree: `/Users/Newschxxl/Documents/mistakery/.worktrees/personal-chat-runtime`
- Published refs: `origin/design/personal-chat-runtime`, `origin/main`, and Pages source `origin/lean-opening` all contain the implementation commit.
- Live URL: `https://newsch8l.github.io/mistakery/`
- Working tree: clean after the implementation commit; this file is the final status-only handoff update.

## Current objective

Keep the published opening playable through Personal Chat, Padel Invite, Dream Team, the conditional IRL match, and Outcomes 0–7. The Padel branch uses a hidden, temporary CEO score to choose the exact requested outcome probabilities. Card 6 presents a deciding point, while completed IRL outcomes show the match result instead of a final numerical score. Outcome replies return through `SAVED_02_UPDATE` (`5 MONTHS AS A FOUNDER 🚀`), whose existing CTA begins a fresh run.

## Completed work

- Preserved onboarding, Saved Messages, all six opening cards, HUD, Personal Chat, Dream Team, Cards 1–6 copy, choices, timing, and transitions.
- Preserved the accepted IRL presentation: neutral `#d2dbe1` frame, approved overlay, `center 54%`, `blur(1.8px) saturate(.88)`, clipped photo layer, no dark inner ring, centered dialog, and 400-weight text.
- Preserved the shared 48 px pinned/location shape and the uncropped IRL-only character photos for `ClosedAI CEO` and `Padel coach`.
- Expanded the scoped runtime gate to 21 IDs: six opening cards, Padel Invite, Dream Team, five IRL match cards, and `PADEL_OUTCOME_0`…`PADEL_OUTCOME_7`.
- Added choice-level `ceoScore` metadata while keeping every Padel `effects` object empty:
  - Card 3: `Mouth shut` `0`, `Pitching` `+1`;
  - Card 3B: water `−1`, business `+1`;
  - Card 4: accept `−1`, rules `+1`;
  - Card 5: concede `−1`, call in `+1`.
- Added `app.padelCeoScore`, initialized to `0` on Padel entry and never rendered in the UI.
- Added early Outcome 0: `Feeling sick, pass` skips Dream Team/IRL and opens a normal Personal Chat card with `@padel_pro`; it does not keep an active CEO score.
- Added early Outcome 7: the `Pitching → Business → Rules → That's in` route reaches `+4` after Card 5 and opens Outcome 7 without rendering Card 6.
- Added exact Card 6 selection:
  - throw match: one draw, Outcome 3/4 at `60/40` for score `−2/+2` and `50/50` for score `0`;
  - fight: first independent `50/50` draw chooses win/loss, second draw selects Outcome 1/2 or 5/6 at the specified score-dependent boundary.
- Updated Card 6 status to `Score: 5–5 · 40–40 · DECIDING POINT`; the next rally remains the match-deciding choice.
- Replaced final numeric scores with explicit outcome statuses in the same IRL bar:
  - Outcomes 1–2: `YOU WON THE MATCH`;
  - Outcomes 3–6: `YOU LOST THE MATCH`;
  - Outcome 7: `MATCH ABORTED`;
  - Outcome 0 remains Personal Chat and has no `score` field or match status bar.
- Corrected Outcome 1 copy to `Watching you sweat and cheat for that win was painful to watch.`
- Added all outcome copy and fake reply choices. Outcome 0 is `mode: personal`; Outcomes 1–7 are `mode: irl` with the existing CEO IRL presentation.
- Both replies on every outcome resolve identically: clear `padelCeoScore`, open `SAVED_02_UPDATE`, then let its existing CTA call `beginRun()` with a fresh state.
- Prevented all Padel resource movement, including the engine's normal passive cash burn. Padel transitions use a shallow deck view with `baseCashBurn: 0`; history/turn progression remains engine-owned and its resource deltas stay zero.
- Regenerated `cards.bundle.js` from canonical `cards.json`.
- Added no-commit TDD plans at `docs/plans/2026-08-21-padel-ceo-outcomes.md` and `docs/plans/2026-08-21-padel-match-status.md`.
- Committed the full 25-file Personal Chat/Padel runtime as `e2faaf6`, pushed the feature branch, fast-forwarded `main`, then fast-forwarded the actual Pages source branch `lean-opening`.
- Verified the live GitHub Pages build and all required CSS/JS/IRL image assets.

## Key technical decisions

- CEO score is app-scoped temporary branch state, not a resource, flag, streak, or engine-level field.
- Canonical choice metadata owns score deltas; `app.js` only accumulates the selected value and performs the two special boundaries (`+4` and Card 6).
- Only `−2`, `0`, and `+2` are valid at Card 6. `+4` must have already diverted to Outcome 7; the selector throws if another value reaches match point.
- `Math.random` is consumed exactly once for a thrown match and exactly twice for a fought match. Engine bookkeeping uses a fixed local RNG so it cannot consume outcome randomness.
- `game.js` was not changed. The global engine retains its normal passive burn for all non-scoped gameplay.
- Padel uses `resolvePadelChoice()` to set only the temporary deck view's `baseCashBurn` to zero. Do not mutate canonical deck metadata or restore resources after a crisis check.
- Outcome replies have no `next` and no resource effects because the app boundary returns to Saved Messages, which is a UI state rather than an engine card.
- Outcome 0 must stay Personal Chat with the handle `@padel_pro`; Outcomes 1–7 must stay IRL with `ClosedAI CEO`.
- The existing `score` field owns both live score strings and final match-result strings because the renderer already presents it verbatim in the same status bar. No new runtime field or outcome-ID mapping was added.
- GitHub Pages is configured from `lean-opening`, not `main`. Publishing this site requires fast-forwarding the tested commit to that source branch; pushing only `main` does not refresh the live URL.

## Main changed files

- `app.js` — active outcome IDs, temporary CEO score, no-burn Padel resolver, score accumulation, exact outcome selector, early outcomes, completion/reset flow.
- `cards.json` — CEO score metadata, the deciding-point display, canonical Outcome 0–7 cards, and final match-result labels.
- `cards.bundle.js` — regenerated offline mirror.
- `tests/personal-chat-runtime.test.cjs` — exact graph, modes, copy, choices, match statuses, empty effects, and unchanged engine contract.
- `tests/personal-chat-runtime.browser.test.cjs` — actual early routes, all 18 probability boundaries, final match statuses, resource invariance, both replies on all outcomes, reset behavior, and responsive regressions.
- `docs/plans/2026-08-21-padel-ceo-outcomes.md` — approved TDD implementation plan without commit steps.
- `docs/plans/2026-08-21-padel-match-status.md` — data-only TDD plan for the deciding point and final status-bar labels.

## Verification

| Command/check | Result |
|---|---|
| Structural test before outcome content | RED: 5 passed, 2 failed because Outcome 0–7 and score metadata were absent |
| Structural content pass before runtime | 6 passed, 1 failed only because the new runtime transition functions were absent |
| Browser test before runtime | RED: `Feeling sick, pass` never reached Outcome 0 |
| First browser GREEN attempt | Exposed engine `baseCashBurn` moving cash by `−1` despite empty Padel effects; also found two test-only expectation/timing issues |
| `node --test tests/personal-chat-runtime.browser.test.cjs` after no-burn boundary | 6 passed, 0 failed |
| Exact probability boundary table | 18/18 cases passed; throw used 1 RNG call and fight used 2 |
| Outcome completion matrix | both sides of all 8 outcomes returned to `SAVED_02_UPDATE`, cleared score, and preserved resources |
| Match-status focused RED | 9 passed, 4 failed only because Card 6 and Outcomes still exposed the previous numeric values |
| Focused structural/browser GREEN | 13 passed, 0 failed; all 18 probability boundaries and RNG call counts remained exact |
| Full `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs tests/engine.test.cjs tests/balance.test.cjs` | 46 passed, 0 failed |
| Canonical validation | 44 cards, `errors: []`, bundle mirror `true`; Outcome 0 has no score; Card 6 and Outcomes 1–7 match the exact requested strings |
| Engine integrity | `game.js` SHA-256 remains `4587f9034eb5e83e639c2a96e2bf21d4531511bc6c48234d5a025d94c245e466` |
| Padel resource audit | every scoped Padel choice has empty effects; runtime browser assertions show unchanged resources |
| Outcome mode audit | Outcome 0 `personal`; Outcomes 1–7 `irl` |
| In-app Browser 390×844 | Card 6, won Outcome 1, lost Outcome 4, and Outcome 7 statuses fit inside the existing bar; scene/page overflow `0` |
| In-app Browser 320×650 | Card 6, won Outcome 1, lost Outcome 3, and Outcome 7 statuses fit; `+4` route still skipped Card 6; scene/page overflow `0` |
| `node --check app.js`, `node --check cards.bundle.js`, `git diff --check` | passed |
| Git push | `design/personal-chat-runtime`, `main`, and Pages source `lean-opening` fast-forwarded to implementation commit `e2faaf6` without force-push |
| Live file integrity | published `index.html` SHA-256 `ef94bab000c530909cebbbcdd594aa10afe061a129ff9e4e60f0e9831f1d0a00` and `cards.json` SHA-256 `77079f45261a2f1bd7730d818a18b8651c669cb4f08faa65d3e0cf485e9ee21b` exactly match commit `e2faaf6` |
| Live asset audit | `style.css`, `app.js`, `cards.bundle.js`, court photo, and both IRL avatars returned HTTP 200 |

## Known issues and intentionally deferred work

- Outcome reply buttons are intentionally cosmetic: both choices have identical completion behavior and no consequence metadata.
- No resources, flags, endings, or later story branches are awarded by outcomes on this pass.
- The broad legacy catalog still contains the older engine-driven Padel arc (`PADEL_01` etc.); the scoped Personal Chat runtime continues to gate it out.
- `gh auth status` reports invalid saved GitHub CLI tokens. Git fetch/push succeeded through the configured Git credential helper; future GitHub API/settings operations via `gh` require re-authentication.

## Failed approaches — do not repeat

- Do not call ordinary `engine.resolveChoice(app.deck, ...)` for a scoped Padel choice: canonical `baseCashBurn` silently changes cash even when effects are empty.
- Do not restore resources after ordinary resolution: a burn-triggered crisis may already have changed continuation state. Disable burn at the input boundary with the temporary deck view.
- Do not encode CEO score as resources, flags, streaks, or duplicated score-specific card graphs.
- Do not send Card 6 directly to Saved Messages; it must select an outcome first.
- Do not render Card 6 after score `+4`; Outcome 7 is immediate after Card 5.
- Do not collapse the two fight draws into one or alter the exact `0.6`, `0.5`, and `0.4` boundaries.
- Do not render Outcome 0 as IRL or Outcomes 1–7 as chat.
- Do not add a runtime match-status mapper or reintroduce a final numerical score; the canonical `score` strings already own this presentation.
- Do not zoom/crop the supplied IRL avatar photos or change the approved IRL background/frame treatment.
- Do not assume `main` is the Pages source. Live-file hashes proved the site was serving `lean-opening`; update that branch for future deployments unless repository settings change.

## Next steps

1. Review Card 6, one won/lost Outcome, Outcome 7, and Outcome 0 at `https://newsch8l.github.io/mistakery/`.
2. Define resource/flag consequences only in a later explicitly approved pass.
3. Re-authenticate GitHub CLI only if a future task needs Pages settings, PRs, or other authenticated GitHub API operations.
