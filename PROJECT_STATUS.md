# Project Status

## Verified snapshot

- Updated: 2026-09-20. Active worktree: `/Users/Newschxxl/Documents/mistakery/.worktrees/personal-chat-runtime`, branch `design/personal-chat-runtime`.
- Implementation commit: `de3a4be0c0968085d3333ee0f212e313825b531a` (Influencer resources). Previous shared HEAD: `7cb7536169dd13e77e2874da60d8e1ea8f22a5e1`; Padel resources: `92743973a0c102267420529d5c961ebeaaa9e678`.
- Implementation was committed and atomically pushed without force to `design/personal-chat-runtime`, `main`, and `lean-opening`. Working tree was clean before this handoff update.
- Parent `/Users/Newschxxl/Documents/mistakery` is an older prototype. Do not edit it for this runtime.
- User authorized commit/push/publication. GitHub Pages uses `lean-opening`, root `/`; implementation build completed successfully (`de3a4be0c0968085d3333ee0f212e313825b531a`). Both public URLs and the complete Influencer resource suite were verified in Chromium.

## Current objective

Influencer resource implementation is complete and publicly verified. Continue user-directed playtesting. Main game: https://newsch8l.github.io/mistakery/ . Test mode: https://newsch8l.github.io/mistakery/?story=live-agent . Both use the same build; the query starts Live Agent, not Influencer.

## Resource rules and completed work

**No crises now.** Zero resources remain playable, with no sudden game ending. Do not add passive burn. Keep values clamped to 0–100. Outcome effects belong to the resolved choice history entry; rerenders and decorative replies must not reapply them. Test Back restores resources and contextual state without rerolling an outcome.

### Influencer

- Full Google Doc read through Google Drive (one native tab): https://docs.google.com/document/d/1oGlgbtUK7Ayrq8sx4O9HCHPtVhOJ-_wJJ0xjH5wgjcc/edit . Use it for resources only; approved game copy/media remain canonical.
- All nine decision cards, both contextual pairs on 05/06, and seven outcomes now have document effects in `cards.json`. Independent values: `tests/influencer-resources.fixture.cjs`; plan: `docs/plans/2026-09-20-influencer-resources.md`.
- User explicitly clarified refusal TOTAL: Cash −25 / Founder −5. Choice 01.right charges Cash −25; outcome 1 adds only Founder −5. Never charge Cash a second time.
- Outcome entry effects: 2 Cash +15 / Customers +25 / Team −10 / Founder −10; 3 Cash −15 / Customers −10 / Team −15 / Founder −25; 4 Cash +15 / Customers +25 / Team −8 / Founder +10; 5 Cash −10 / Customers −15 / Team −10 / Founder −15; 6 Cash +30 / Customers +15 / Team −8 / Founder +15; 7 Cash −15 / Customers −20 / Team −12 / Founder −20.
- `resolveInfluencerChoice` uses the actually displayed contextual choice, combines its effect with the selected outcome, and calls the engine once. Crises, passive burn and turn-cap endings are disabled locally, independently of Live Agent completion flags.
- Existing 40/60 probabilities unchanged: one draw on either reply at 07 (outcomes 2/3), left at 08 (4/5), right at 08 (6/7). Preview uses direct effects plus both candidate outcomes without RNG/state changes and reuses the existing 2px lift. Outcome replies return to Saved Messages and remain neutral.
- Copy, images, routes, presentation metadata, Padel/Live Agent data, shared engine and probability functions were mechanically compared against the previous HEAD and preserved. Independent code review found no issues.

### Padel (unchanged in this stage)

- Source: https://docs.google.com/document/d/14r75dbHVyI8nW3xlyYGnnk-E-PTyK6VqnYvnn2fE6Uk/edit . User's no-crisis instruction overrides its crisis wording.
- Seven decision cards and eight outcomes implemented. Refusal charges Cash −25 once on the choice; outcome 0 has no extra effect. Both replies return to Saved Messages.
- `resolvePadelChoice` combines choice/outcome effects once, suppresses crises/burn/turn-cap, preserves score and routes. Match point: one draw for throwing, two for fighting; early outcome 7 uses none. Preview includes early/random candidates.
- Exact effects: `tests/padel-resources.fixture.cjs`; coverage: `tests/padel-resources.browser.test.cjs`; plan: `docs/plans/2026-09-20-padel-resources.md`.

### Live Agent and opening (unchanged in this stage)

- Ten story screens, five outcomes; English dialogue only. Entry: Pure genius → Sales, wake up → Boss/Dev check-ins in either order. Other routes preserve Investor. Investor offers Influencer / Padel.
- Five hidden-score decisions: 02, 03, 04B, 05, 06. Outcomes return directly to Investor, including all-zero Judgment Day. One terminal draw and one outcome application. No passive burn; prototype loop avoids crises/turn-cap endings.
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

## Fresh verification

- `node --test tests/offline.test.cjs tests/personal-chat-runtime.test.cjs tests/live-agent.test.cjs`: 22/22 pass.
- `node --test --test-name-pattern='every visible resource effect' tests/content.test.cjs`: 1/1 pass.
- `node --test --test-concurrency=2 tests/influencer-resources.browser.test.cjs tests/personal-chat-runtime.browser.test.cjs tests/padel-resources.browser.test.cjs tests/live-agent.browser.test.cjs tests/resource-preview.browser.test.cjs tests/outcome-presentation.browser.test.cjs`: 25/25 pass (about 147 seconds).
- New tests cover all decision/context effects, seven outcomes, refusal cash 0/10/25/40, zero/1/99/100 boundary cases, turn 100 without crisis/game-over, combined history deltas, neutral outcome replies, hover/focus/2px lift without RNG/state changes, exact .399999/.4 boundaries, rerender and Back. Checked at 390×844 and 320×650.
- Regression batch covers Padel probabilities/resources, Live Agent probabilities/resources, main onboarding, Influencer contextual routes/images/layout, and all outcome presentation/animation behavior.
- Canonical bundle/catalog/hash regenerated. Syntax checks and `git diff --check` passed. Pre-change resource tests failed for expected missing effects/previews and active cash crisis, then passed with the implementation.

- Public verification: all 4 Influencer resource tests pass against `https://newsch8l.github.io/mistakery/`, including contexts, all outcomes, exact RNG boundaries, previews/Back and zero resources without crises. Both main/test links return 200 with the exact local canonical deck and runtime; main starts onboarding, test starts LIVE_AGENT_01. Actual Investor → Influencer transition verified; no page/HTTP errors. Refusal preview screenshot visually inspected.

## Known issues and failed approaches

- Historical full-suite result (not rerun this stage): 171 tests, 112 passed / 59 failed. 57 old deck/scheduler/callback expectations reproduced on published baseline `8e1c77c`; the other two were fixed previously. Do not restore obsolete stories or claim the entire legacy suite is green. Modernize those fixtures only as a separate task.
- Chromium needs elevated execution on macOS: sandboxed launch fails Mach-port registration. GitHub access also requires network permission in this environment. Both permitted workflows succeeded this stage.
- Pages may not start automatically after push; inspect the latest build commit and use `gh api --method POST repos/newsch8l/mistakery/pages/builds` if needed.
- Stale renderer/data combinations once dropped image captions: keep generated content hashes synchronized. Original aspect ratios and full-bubble fitting prevent cropping/gray side bars. Extreme network delays can still delay images.
- Pre-existing design detector resource-bar width-transition warning remains out of scope. End-of-game design remains deferred by user.

## Next steps

1. Continue user-directed playtesting; preserve no-crisis behavior, approved copy/media and narrow chat-continuity scope.
2. Future publications: atomically push without force to all three branches, verify Pages commit/status and both public URLs.
