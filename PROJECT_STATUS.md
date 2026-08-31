# Project Status

## Verified snapshot

- Updated: 2026-08-31 00:31 MSK
- Branch: `design/personal-chat-runtime`
- Base commit: `f2b75a53054d946d930fefdb4f24d71862281f48`
- Worktree: `/Users/Newschxxl/Documents/mistakery/.worktrees/personal-chat-runtime`
- Working tree: intentionally dirty with the completed AI Influencer implementation, tests, generated artifacts, and previously approved uncommitted UI/Padel edits.
- Publication: this pass was not committed, pushed, or published.

## Current objective

The AI Influencer prototype story is implemented and verified. It reuses the existing Personal Chat, Dream Team, choices, Saved Messages, and resource UI without adding a new interface or resource behavior.

## Completed work

- Added the exact English content for Card 1, Card 2, Card 2A, Cards 3–8, and Outcomes 1–7; no Russian story copy is rendered by the game.
- Routed the left Investor choice (`Market's not ready`) into `INFLUENCER_01`; the right choice (`Team's too slow`) still enters Padel.
- Implemented Card 5/6 contextual replies using only the previous Influencer card ID.
- Verified all six routes from Card 4 to Card 7/8; none repeats Card 5 or Card 6.
- Implemented exactly one weighted draw per terminal choice: `< 0.4` selects the 40% outcome and `>= 0.4` selects the 60% outcome.
- Added compact messenger-bubble placeholders for video/review images and split long messages into bubbles following document paragraph boundaries.
- Kept every Influencer choice resource effect empty and disabled passive cash burn inside this prototype branch.
- Made both replies on all seven outcomes return through `SAVED_02_UPDATE`.
- Regenerated `cards.bundle.js` and the full EN/RU editorial catalog; contextual Card 5/6 reply sets are included in the catalog.
- Preserved existing Padel behavior and the pre-existing uncommitted Padel copy, choice sizing, and touch-hover adjustments.

## Key technical decisions

- `app.influencerPreviousCardId` is the only new contextual state and is cleared on entry, outcome completion, and restart.
- `influencerChoicesFor(card)` substitutes the Card 5/6 choice set based on the previous card; canonical default choices represent arrival from Card 4.
- `resolveInfluencerChoice()` uses a temporary deck view with `baseCashBurn: 0`; canonical deck metadata and global engine behavior remain unchanged.
- `selectInfluencerOutcome(cardId, side, rng)` calls `rng()` once and uses the exact `0.4` threshold.
- Influencer cards opt into exact terminal punctuation while older branches retain their current rendering behavior.
- Screenshot placeholders are neutral, dashed bubbles capped at 210 px wide and 62 px minimum height; mobile tests enforce a maximum rendered height of 80 px.

## Main changed files

- `cards.json` — all Influencer cards, English copy, contextual choices, routes, placeholders, and empty effects.
- `cards.bundle.js` — regenerated canonical offline deck.
- `app.js` — runtime allowlist, Investor split, contextual state/choices, no-burn resolution, weighted outcomes, outcome completion, and placeholder rendering.
- `style.css` — scoped Influencer scrolling and compact messenger-style placeholders.
- `tests/personal-chat-runtime.test.cjs` — structural graph, copy, effects, and runtime contract.
- `tests/personal-chat-runtime.browser.test.cjs` — all routes, exact probability boundaries, resource invariance, outcomes, bubble layout, placeholders, and mobile viewports.
- `tests/balance.test.cjs`, `tests/offline.test.cjs` — third route and generated-artifact coverage.
- `scripts/build-card-catalog.cjs`, `MISTAKERY_CARDS_EN_RU.md` — complete editorial catalog including contextual choices.
- `docs/plans/2026-08-31-ai-influencer-story.md` — implementation plan and acceptance criteria.

## Verification

| Command/check | Result |
|---|---|
| Full Node + Playwright suite | 62 passed, 0 failed |
| All Card 4 → Card 7/8 routes | 6/6 passed with no repeated cards |
| Outcome probability boundaries | `0.399999` selects 40%; `0.4` selects 60%; exactly one RNG call |
| Outcome completion matrix | both replies on Outcomes 1–7 return to Saved Messages |
| Responsive placeholder checks | passed at 390×844 and 320×650; compact and readable |
| Deck audit | 16 Influencer cards, validation errors `[]`, all Influencer effects empty |
| Offline bundle audit | `cards.bundle.js` exactly matches `cards.json` |
| `node --check app.js`, `node --check cards.bundle.js` | passed |
| `git diff --check` | passed |
| Independent code review | no Critical, Important, or Minor findings |

## Known issues and unverified assumptions

- Real screenshots are intentionally deferred; placeholders are the approved temporary representation.
- Outcome resource effects are intentionally deferred; both outcome replies currently behave identically.
- The in-app browser rejected direct navigation to the local file by URL policy. Local Playwright browser runs and screenshot review covered the required routes and viewports.

## Failed approaches — do not repeat

- Do not resolve Influencer choices with the canonical deck directly: its normal passive cash burn would violate the no-resource-change requirement.
- Do not use one static choice set for Card 5/6; arrival from Card 4 and from the other contextual card requires different labels and destinations.
- Do not use `data-card-id` on the scene container; the renderer also queries that attribute for content nodes and would replace the wrong element.
- Do not use 50/50 or consume more than one random draw for Influencer outcomes.

## Next steps

1. Let the user review the story feel and pacing in the local prototype.
2. Commit or publish only after explicit user approval.
3. Add real screenshots and resource consequences only in a separately approved pass.
