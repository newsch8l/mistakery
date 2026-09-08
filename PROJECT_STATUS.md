# Project Status

## Verified snapshot

- Updated: 2026-09-08 09:57 MSK
- Branch: `design/personal-chat-runtime`
- Published implementation commit: `9356d0297342323f7bcbde2c0d01f0446ed6917b`
- Worktree: `/Users/Newschxxl/Documents/mistakery/.worktrees/personal-chat-runtime`
- Working tree: clean after the implementation commit; this file is the deployment handoff update.
- Publication: `origin/design/personal-chat-runtime`, `origin/main`, and the GitHub Pages source `origin/lean-opening` contain the implementation commit.
- Live URL: `https://newsch8l.github.io/mistakery/`

## Current objective

The AI Influencer prototype story is implemented and verified. It reuses the existing Personal Chat, Dream Team, choices, Saved Messages, and resource UI without adding a new interface or resource behavior.

## Completed work

- Added the exact English content for Card 1, Card 2, Card 2A, Cards 3–8, and Outcomes 1–7; no Russian story copy is rendered by the game.
- Routed the left Investor choice (`Market's not ready`) into `INFLUENCER_01`; the right choice (`Team's too slow`) still enters Padel.
- Implemented Card 5/6 contextual replies using only the previous Influencer card ID.
- Verified all six routes from Card 4 to Card 7/8; none repeats Card 5 or Card 6.
- Implemented exactly one weighted draw per terminal choice: `< 0.4` selects the 40% outcome and `>= 0.4` selects the 60% outcome.
- Added compact messenger-bubble placeholders for the remaining video/review images and split long messages into bubbles following document paragraph boundaries.
- Replaced all three `Hate video screenshot` placeholders with the supplied negative-review screenshot.
- Optimized the supplied 1.77 MB PNG into one 960×540, 67,798-byte WebP shared and cached across Card 6, Card 8, and Outcome 3.
- Applied the final author correction to Card 4 (`I never lie...`, `Gotta drop an honest video 😔`) and added the compact `Hate video screenshot` placeholder to Card 6.
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
- Real card images use canonical `src`, `alt`, `width`, and `height` metadata. The renderer emits one normal `<img>` with asynchronous decoding and fixed intrinsic dimensions.
- The shared negative-review image is capped at 280 px in the messenger, preserves 16:9, and is fetched once per browser cache rather than duplicated per card.

## Main changed files

- `cards.json` — all Influencer cards, English copy, contextual choices, routes, image metadata/placeholders, and empty effects.
- `cards.bundle.js` — regenerated canonical offline deck.
- `app.js` — runtime allowlist, Investor split, contextual state/choices, no-burn resolution, weighted outcomes, outcome completion, and media rendering.
- `style.css` — scoped Influencer scrolling, compact placeholders, and responsive 16:9 image bubbles.
- `assets/ai-influencer-hate-review.webp` — optimized negative-review screenshot shared by three cards.
- `tests/personal-chat-runtime.test.cjs` — structural graph, copy, effects, and runtime contract.
- `tests/personal-chat-runtime.browser.test.cjs` — all routes, exact probability boundaries, resource invariance, outcomes, bubble layout, placeholders, and mobile viewports.
- `tests/balance.test.cjs`, `tests/offline.test.cjs` — third route and generated-artifact coverage.
- `scripts/build-card-catalog.cjs`, `MISTAKERY_CARDS_EN_RU.md` — complete editorial catalog including contextual choices.
- `docs/plans/2026-08-31-ai-influencer-story.md` — implementation plan and acceptance criteria.

## Verification

| Command/check | Result |
|---|---|
| Full Node + Playwright suite | 63 passed, 0 failed |
| All Card 4 → Card 7/8 routes | 6/6 passed with no repeated cards |
| Outcome probability boundaries | `0.399999` selects 40%; `0.4` selects 60%; exactly one RNG call |
| Outcome completion matrix | both replies on Outcomes 1–7 return to Saved Messages |
| Responsive placeholder checks | passed at 390×844 and 320×650; compact and readable |
| Deck audit | 16 Influencer cards, validation errors `[]`, all Influencer effects empty |
| Offline bundle audit | `cards.bundle.js` exactly matches `cards.json` |
| `node --check app.js`, `node --check cards.bundle.js` | passed |
| `git diff --check` | passed |
| Independent code review | no Critical, Important, or Minor findings |
| Git push | feature branch, `main`, and Pages source `lean-opening` fast-forwarded without force-push |
| Live HTTP audit | `index.html`, `cards.json`, `cards.bundle.js`, `app.js`, and `style.css` returned HTTP 200 |
| Live file integrity | public `cards.json`, `cards.bundle.js`, `app.js`, `style.css`, and the negative-review WebP are byte-for-byte identical to commit `9356d02` |
| Negative-review asset audit | WebP, 960×540, 67,798 bytes, SHA-256 `e57d3c5a68737e55b246c15e37d87743f0015d6a0b5fbcb3a91811119287bf2f` |
| Live image response | HTTP 200, `Content-Type: image/webp`, `Content-Length: 67798`, `Cache-Control: max-age=600` |
| Live Chromium playtest | decoded at 960×540, rendered at 263×148 with zero page overflow; clean-browser resource duration about 186 ms |

## Known issues and unverified assumptions

- The ordinary video preview and positive review screenshots are still intentionally deferred; their placeholders remain.
- Outcome resource effects are intentionally deferred; both outcome replies currently behave identically.
- The in-app browser rejected direct navigation to the local file by URL policy. Local Playwright browser runs and screenshot review covered the required routes and viewports.

## Failed approaches — do not repeat

- Do not resolve Influencer choices with the canonical deck directly: its normal passive cash burn would violate the no-resource-change requirement.
- Do not use one static choice set for Card 5/6; arrival from Card 4 and from the other contextual card requires different labels and destinations.
- Do not use `data-card-id` on the scene container; the renderer also queries that attribute for content nodes and would replace the wrong element.
- Do not use 50/50 or consume more than one random draw for Influencer outcomes.

## Next steps

1. Let the user review the published story feel and pacing at `https://newsch8l.github.io/mistakery/`.
2. Add the ordinary video preview and positive review screenshots when supplied.
3. Add resource consequences only in a separately approved pass.
