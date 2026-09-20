# Project Status

## Verified snapshot

- Updated: 2026-09-20. Active worktree: `/Users/Newschxxl/Documents/mistakery/.worktrees/personal-chat-runtime`, branch `design/personal-chat-runtime`.
- Implementation commit: `d4486d72dffd54e6d070b5c66b346235f48e2979` (RU / ± inspector). Atomically pushed to all three branches; Pages build succeeded at this commit.
- Working tree was clean after implementation publication; this documentation update records the successful public checks.
- Parent `/Users/Newschxxl/Documents/mistakery` is an older prototype. Do not edit it for this runtime.
- User authorized commit/push/publication. Atomically push without force to `design/personal-chat-runtime`, `main`, and `lean-opening`. GitHub Pages uses `lean-opening`, root `/`.

## Current objective

RU / ± inspector is published and verified. Continue user-directed playtesting. Main game: https://newsch8l.github.io/mistakery/ . Test mode: https://newsch8l.github.io/mistakery/?story=live-agent . Both use the same build; the query starts Live Agent, not Influencer.

## Translation and resource inspector — current stage

- Test toolbar has RU / ±. Its native modal shows the current card's Russian text, both translated replies and current English labels, direct choice effects, possible outcome effects and actual total change including default Cash −0.5 and clamping. An already reached outcome's entry effect is displayed separately and never applied again.
- Available only in test mode, including Saved Messages. Opening/closing does not advance a turn, consume RNG or change resources/history. Native focus trapping, Escape and blocked gameplay arrows keep the background inactive. Mobile layout checked at 390×844 and 320×650.
- `cards.json.testTranslations` contains all 52 active cards plus 2 Saved screens, contextual Influencer replies, source links and adaptation flags. This is the only canonical deck change; all existing English/game data match the base exactly.
- Full source documents read: Live Agent https://docs.google.com/document/d/1K5rt9p63YyMBYOTXmyPhddnjg8vkPiEPH2024HUtVRo/edit , Influencer and Padel links below. Old document variants were aligned to current English. Opening/Saved/Live Agent outcome 0 translations were supplied from current English and explicitly marked as lacking a full Russian source.
- `app.js` implements read-only inspection using current contextual choices and candidate helpers; `index.html`/`style.css` add scoped controls/modal. `scripts/build-card-catalog.cjs` uses the same metadata for `MISTAKERY_CARDS_EN_RU.md`; bundle and content hashes regenerated.
- Plan: `docs/plans/2026-09-20-test-card-details.md`. Regression: `tests/test-card-details.browser.test.cjs`, supports `MISTAKERY_TEST_URL` for public verification.

## Fresh inspector verification

- `node --test tests/offline.test.cjs tests/personal-chat-runtime.test.cjs tests/live-agent.test.cjs`: 22/22 passed. After final catalog regeneration, offline checks rerun: 10/10 passed.
- `node --test --test-concurrency=3 tests/test-card-details.browser.test.cjs tests/story-test-mode.browser.test.cjs tests/passive-cash.browser.test.cjs tests/influencer-resources.browser.test.cjs tests/padel-resources.browser.test.cjs tests/resource-preview.browser.test.cjs tests/personal-chat-runtime.browser.test.cjs`: 25/25 passed. Final targeted inspector rerun: 2/2 passed.
- Covers every active card at both mobile sizes, missing/obsolete translation checks, contextual replies, direct/random/early outcomes, exact totals and clamping, reset-to-zero, Saved navigation, no RNG/history/resource changes, focus and Escape.
- Independent reviewer found no significant issues. Mechanical deck comparison confirms unchanged gameplay data/English. Catalog translation coverage, syntax, generated assets and `git diff --check` passed. Mobile screenshots visually inspected.

## Default Cash burn — current stage

- Canonical `meta.baseCashBurn` is −0.5; all branch overrides were removed from `app.js`. Existing engine applies the sum of base burn + choice + outcome once, then clamps 0–100. Shared `game.js` is unchanged.
- Fractional values remain exact in state/history, resource bar width and accessible value. Hover still previews explicit choice/outcome effects; the equal default cost stays implicit.
- `prototypeDeck()` disables crises/turn-cap across the entire active prototype, so opening/Investor remain playable at zero without needing a Live Agent completion flag.
- Cross-branch regression: `tests/passive-cash.browser.test.cjs`. Shared independent expected turn calculator: `tests/turn-resources.fixture.cjs`. Plan: `docs/plans/2026-09-20-default-cash-burn.md`.

## Resource rules and completed work

**No crises now.** Zero resources remain playable, with no sudden game ending. **Latest user change:** every resolved gameplay turn now additionally costs 0.5 Cash in every branch. This supersedes the earlier no-passive-burn rule. Neutral/outcome replies also cost 0.5; onboarding/Saved Messages navigation and Back/Restart do not charge another turn. Keep values clamped to 0–100. Outcome effects belong to the resolved choice history entry; rerenders and decorative replies must not reapply outcome effects; each decorative reply only charges the new default 0.5 Cash. Test Back restores resources and contextual state without rerolling an outcome.

### Influencer

- Full Google Doc read through Google Drive (one native tab): https://docs.google.com/document/d/1oGlgbtUK7Ayrq8sx4O9HCHPtVhOJ-_wJJ0xjH5wgjcc/edit . Use it for resources only; approved game copy/media remain canonical.
- All nine decision cards, both contextual pairs on 05/06, and seven outcomes now have document effects in `cards.json`. Independent values: `tests/influencer-resources.fixture.cjs`; plan: `docs/plans/2026-09-20-influencer-resources.md`.
- User explicitly clarified refusal TOTAL: Cash −25 / Founder −5. Choice 01.right charges Cash −25; outcome 1 adds only Founder −5. Never charge Cash a second time.
- Outcome entry effects: 2 Cash +15 / Customers +25 / Team −10 / Founder −10; 3 Cash −15 / Customers −10 / Team −15 / Founder −25; 4 Cash +15 / Customers +25 / Team −8 / Founder +10; 5 Cash −10 / Customers −15 / Team −10 / Founder −15; 6 Cash +30 / Customers +15 / Team −8 / Founder +15; 7 Cash −15 / Customers −20 / Team −12 / Founder −20.
- `resolveInfluencerChoice` uses the actually displayed contextual choice, combines its effect with the selected outcome, and calls the engine once. Crises and turn-cap endings are disabled locally, independently of Live Agent completion flags. Default Cash burn is inherited from canonical deck metadata.
- Existing 40/60 probabilities unchanged: one draw on either reply at 07 (outcomes 2/3), left at 08 (4/5), right at 08 (6/7). Preview uses direct effects plus both candidate outcomes without RNG/state changes and reuses the existing 2px lift. Outcome replies return to Saved Messages with only the default 0.5 Cash cost.
- Copy, images, routes, presentation metadata, Padel/Live Agent data, shared engine and probability functions were mechanically compared against the previous HEAD and preserved. Independent code review found no issues.

### Padel

- Source: https://docs.google.com/document/d/14r75dbHVyI8nW3xlyYGnnk-E-PTyK6VqnYvnn2fE6Uk/edit . User's no-crisis instruction overrides its crisis wording.
- Seven decision cards and eight outcomes implemented. Refusal charges Cash −25 once on the choice; outcome 0 has no extra effect. Both replies return to Saved Messages.
- `resolvePadelChoice` combines choice/outcome effects once, suppresses crises/turn-cap, inherits default Cash burn, and preserves score and routes. Match point: one draw for throwing, two for fighting; early outcome 7 uses none. Preview includes early/random candidates.
- Exact effects: `tests/padel-resources.fixture.cjs`; coverage: `tests/padel-resources.browser.test.cjs`; plan: `docs/plans/2026-09-20-padel-resources.md`.

### Live Agent and opening

- Ten story screens, five outcomes; English dialogue only. Entry: Pure genius → Sales, wake up → Boss/Dev check-ins in either order. Other routes preserve Investor. Investor offers Influencer / Padel.
- Five hidden-score decisions: 02, 03, 04B, 05, 06. Outcomes return directly to Investor, including all-zero Judgment Day. One terminal draw and one outcome application. Default Cash burn applies; the entire prototype, including opening/Investor, avoids crises/turn-cap endings.
- `?story=live-agent` starts Card 1; Back restores state/score/scroll and Restart resets. Unknown query keeps onboarding.
- 04 is the neutral photo interlude; 04B has the attitude choice. 07 is the neutral manifesto exchange; 07B has the contract decision. Exact accepted copy is in cards/catalog.
- Scoped chat continuity ONLY: 01→02, 03→04→04B, 07→07B. Keep last two bubbles, actual outgoing reply, then current messages. No divider, no global extension. History derives from engine history and does not duplicate/reanimate.
- Fit entire media bubbles at original aspect ratio, with captions, no cropping or gray side bars. Disable media width transitions. ResizeObserver skips unchanged initial size so Back preserves scroll.
- Typing pauses: 03, 05, 06, 07; 07B has sequential pauses after its first two bubbles. Preserve delivery deadline on rerender; navigation cancels timers; Back restores completed delivery. Scroll only enough to reveal active typing/final message; older reply may scroll above viewport. Choices unlock after final delivery.
- Shared terminal-period rule omits final periods but preserves internal punctuation/ellipses. Message text 12.2px, inline mentions system-ui 550. Stable muted nickname colors; role labels gray. Outcome 3 uses two forwarded messages with source labels/inset rule and a corporate reply.

## Outcome presentation and assets

- Live Agent, Influencer and Padel use `outcomeTone`. Influencer successes 2/4/6, failures 1/3/5/7. Padel successes 2/4/5; all others fail. Padel keeps location/match pin via `outcomeBanner: false` and preserves untinted court photo.
- SUCCESS/FAILURE replaces the pinned bar at the same 48px height for other outcomes. Mint success / red failure; catastrophic Live Agent outcome 2 has deeper red and short photo distortion. Success scale/glow and failure jolt/pulse run once per state object; WeakSet suppresses replay on rerender/Back. Reduced Motion disables entrance motion.
- All six Influencer image slots and all Live Agent image slots have supplied WebP assets. No placeholders remain. Canonical media dimensions are authoritative; outcome 3's finale image is 1200×567, outcome 4 analytics 1000×1000. Outcome 6 is text-only. Old hate-review asset remains on disk but unused.
- Live Agent founder/manifesto/outcome photos are preloaded. Manifesto uses hashed URL and preserved aspect ratio.
- Padel court/avatars use WebP (360,116 total bytes versus original ~7.9 MB); originals retained but unused. Preload once at Investor or direct Padel entry, low priority, no unrelated onboarding downloads. Framing/blur/color unchanged.
- Canonical runtime data: `cards.json`; renderer: `app.js`; shared engine `game.js` unchanged. After app/CSS/engine/cards changes run `node scripts/build-offline-deck.cjs` for bundle and index content hashes. Run `node scripts/build-card-catalog.cjs` after card data/copy changes. Catalog now lists all Influencer outcome entry effects and contextual effects.

- Public Pages build `d4486d72dffd54e6d070b5c66b346235f48e2979` succeeded. `MISTAKERY_TEST_URL=https://newsch8l.github.io/mistakery/ node --test tests/test-card-details.browser.test.cjs`: 2/2 passed, including main/test visibility, every active card at both mobile sizes, resource effects and read-only behavior.

## Previous resource verification

- Default burn implementation `7e5cda4eab7312974b6d2991387989a2e4dd784d`: 50 unit checks and 28 browser checks passed before publication; public cross-branch regression passed. Current inspector batch reruns the relevant burn/Influencer/Padel/runtime regressions.
- Influencer implementation `de3a4be0c0968085d3333ee0f212e313825b531a`; Padel `92743973a0c102267420529d5c961ebeaaa9e678`. Full resource fixtures and regression tests remain authoritative for exact values.

## Known issues and failed approaches

- Historical full-suite result (not rerun this stage): 171 tests, 112 passed / 59 failed. 57 old deck/scheduler/callback expectations reproduced on published baseline `8e1c77c`; the other two were fixed previously. Do not restore obsolete stories or claim the entire legacy suite is green. Modernize those fixtures only as a separate task.
- Chromium needs elevated execution on macOS: sandboxed launch fails Mach-port registration. GitHub access also requires network permission in this environment. Both permitted workflows succeeded this stage.
- Pages may not start automatically after push; inspect the latest build commit and use `gh api --method POST repos/newsch8l/mistakery/pages/builds` if needed.
- Stale renderer/data combinations once dropped image captions: keep generated content hashes synchronized. Original aspect ratios and full-bubble fitting prevent cropping/gray side bars. Extreme network delays can still delay images.
- Pre-existing design detector resource-bar width-transition warning remains out of scope. End-of-game design remains deferred by user.

## Next steps

1. Continue user-directed playtesting; preserve no-crisis behavior, approved copy/media and narrow chat-continuity scope.
2. Future publications: atomically push without force to all three branches, verify Pages commit/status and both public URLs.
