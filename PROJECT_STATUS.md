# Project Status

## Verified snapshot

- Updated: 2026-09-21. Worktree: `/Users/Newschxxl/Documents/mistakery/.worktrees/personal-chat-runtime`; branch `design/personal-chat-runtime`.
- Implementation: `abef9da2e6b259bdb6244e52cb6e216ca2b08b3f` (fixed portrait phone interface). Pushed atomically to `design/personal-chat-runtime`, `main`, `lean-opening`. Pages build succeeded for this commit; public portrait regression passed 2/2.
- Final follow-up contains this documentation update and a test-only WebKit orientation mock correction; runtime remains at the implementation commit. Parent `/Users/Newschxxl/Documents/mistakery` is an older prototype; do not edit it for this runtime.
- User authorized existing GitHub Pages commit/push/publication. Pages source: `lean-opening`, `/`. Main: https://newsch8l.github.io/mistakery/ . Test: https://newsch8l.github.io/mistakery/?story=live-agent . Same build; query starts Live Agent.

## Current objective

Keep the phone game visually in portrait through device rotation, with no messages, overlays, blocked gameplay, reloads or progress loss. User explicitly rejected a landscape guard. No itch.io build, package or upload: the game is not ready. Continue only user-directed work after this correction.

## Completed work

- Touch-first landscape viewports use swapped logical stage dimensions and counter-rotation. Native RU / ± dialog follows the same rotation. Safe areas and compact layout breakpoints follow the portrait stage; sequential message scrolling follows its local vertical axis. Desktop mouse-first layout stays normal. No fullscreen request or dependency on native orientation lock.
- Direction is based on `screen.orientation.angle`, falling back to `window.orientation`, with both change events. Per W3C, device angle is counter-clockwise, while CSS rotation is clockwise: API 90 → CSS −90; API 270 → CSS +90. The initial same-sign implementation was caught and corrected before publication.
- Full mobile animations match desktop regardless of OS motion preference, as explicitly required. User confirmed “щас норм”. Preserve typing cadence, entrances and outcome effects. Bounded image decode, stale-work cancellation, Back without replay and immediate Restart remain.
- `33ce262c9de8149bcf67e3ed35001facb87d221e` removed the leading ellipsis from the developer reply beginning “that kinda hurt. but yeah” and its Russian reference.
- Test-only RU / ± inspector covers 52 active cards and 2 Saved screens: translation, contextual replies, choice/outcome effects, actual totals including passive Cash burn and clamping. Opening/closing is read-only; native dialog traps focus and prevents background arrow choices.
- Every gameplay turn costs Cash −0.5 in every branch. No crises or turn cap: zero resources remain playable. Onboarding/Saved navigation, Back and Restart do not charge turns. Resource outcomes apply once to the resolving turn; decorative outcome replies only charge the new −0.5 turn cost.
- Influencer refusal total before passive burn: Cash −25 / Founder −5, once. Padel refusal Cash −25 once, no extra outcome penalty. Preserve all existing route probabilities, scores, approved copy and media.

## Key technical decisions

- `cards.json` is canonical. Regenerate bundle and `index.html` content hashes with `node scripts/build-offline-deck.cjs` after runtime/deck edits. Regenerate bilingual catalog with `node scripts/build-card-catalog.cjs` after copy/translation changes.
- Shared engine `game.js` unchanged. Active prototype has 52 cards; deck retains older inactive content. Do not restore obsolete branches to satisfy old tests.
- Test Back restores complete resources, scores, contextual choices, RNG outcome and scroll. Scoped continuity only: 01→02, 03→04→04B, 07→07B. Media must fit as a complete bubble with original aspect ratio; preserve captions.
- Live Agent outcome, Influencer and Padel effect fixtures remain authoritative: `tests/turn-resources.fixture.cjs`, `tests/influencer-resources.fixture.cjs`, `tests/padel-resources.fixture.cjs`. Outcome entry effects must never be charged on rerender or twice.
- Translation source links/adaptation notes live in `cards.json.testTranslations` and `MISTAKERY_CARDS_EN_RU.md`. Preserve approved English rather than restoring old document copy.

## Main changed files

- `app.js`: orientation direction and rotation-aware delivery scrolling.
- `style.css`: logical stage dimensions, safe areas, portrait breakpoints and counter-rotation, including inspector.
- `index.html`: regenerated runtime hashes.
- `tests/portrait-only.browser.test.cjs`: both mobile engines/directions, geometry/progress/dialog/touch/Back, 320×650 typing and photo fitting, normal entry and desktop.
- `docs/plans/2026-09-21-portrait-only.md`: accepted scope and direction reference.

## Verification

- New portrait tests failed on baseline (landscape compressed frame 700→330px), then passed 2/2 on Chromium/Pixel 7 and WebKit/iPhone 13. Final rerun after direction correction passed 2/2. Screenshot inspected.
- `node --test --test-concurrency=3 tests/mobile-motion.browser.test.cjs tests/story-test-mode.browser.test.cjs tests/test-card-details.browser.test.cjs tests/innovation-typing.browser.test.cjs tests/legal-typing.browser.test.cjs tests/continuation-focus.browser.test.cjs`: 12/12 passed.
- `node --test tests/offline.test.cjs tests/personal-chat-runtime.test.cjs tests/live-agent.test.cjs`: 22/22 passed. Offline 10/10 rerun after final hashes.
- `node --check app.js` and `git diff --check` passed. Independent final review found no remaining significant issues after correcting direction.
- Public `MISTAKERY_TEST_URL=https://newsch8l.github.io/mistakery/ node --test tests/portrait-only.browser.test.cjs`: 2/2 passed after Pages reported `built`. The first WebKit run exposed an instance-level sensor mock being lost on HTTPS; moving the angle getter to the ScreenOrientation prototype fixed the test, with no runtime change.
- All mobile checks use desktop browser engine emulation. Real-device rotation/browser chrome and FPS remain unverified; do not claim physical phone testing.

## Known issues and failed approaches

- Do not reintroduce rotation messages, overlays or inert gameplay. User explicitly rejected them; the abandoned guard was never published.
- Do not reintroduce automatic mobile motion suppression. User explicitly wants full animations; the static typing fallback was rejected.
- Native browser rotation lock cannot be relied on across normal mobile tabs. Current behavior fixes game content visually; browser chrome/OS orientation remain under browser control.
- No persistent save: reload resets the prototype. General itch packaging, old unused assets and broader technical debt are deferred.
- Historical legacy suite: 171 checks, 112 passed / 59 failed; not rerun this stage. 57 obsolete deck/scheduler/callback expectations reproduced on prior published baseline, other two fixed previously. Do not claim the entire legacy suite passes.
- Pages can need an explicit build request. Never run public regressions until `pages/builds/latest` reports `built` for the intended commit; premature probes previously hit stale CSS/network errors.
- Chromium and GitHub workflows require elevated execution on this macOS setup; sandboxed Chromium failed Mach-port registration. Approved elevated runs work.

## Next steps

1. Continue user-directed phone playtesting. Preserve full motion, resource rules and read-only inspector. No itch.io work unless the user changes that instruction.
2. Future publication: atomic non-force push to all three branches; verify Pages status and public URLs.
