# Project Status

## Verified snapshot

- Updated: 2026-09-20, published and verified both public links after all requested story and image edits.
- Active repository/worktree: `/Users/Newschxxl/Documents/mistakery/.worktrees/personal-chat-runtime`.
- Branch: `design/personal-chat-runtime`; initial shared publication commit (later fixes are in branch HEAD): `e3276890b35a25857d643090b8493ff3be6a79e7`.
- Parent `/Users/Newschxxl/Documents/mistakery` is an older prototype. Work in the worktree above, not the parent.
- User authorized committing/pushing the current game and publishing separate main/test links. No cleanup or discard requested.
- Preview server confirmed listening at `http://127.0.0.1:8765/?story=live-agent`. Plain URL starts onboarding.

## Current objective

Publication is complete; continue user-directed playtesting when requested. Normal URL: https://newsch8l.github.io/mistakery/ ; direct story test: https://newsch8l.github.io/mistakery/?story=live-agent . Both share the same build. Pages deploys `lean-opening` at root; `main` and `design/personal-chat-runtime` were synchronized by fast-forward. The public build was verified in Chromium.

## Completed work and accepted behavior

- Ten story screens (original eight beats with Cards 4 and 7 split) and five outcomes. English dialogue only.
- Entry: `Pure genius` → `Sales, wake up` → both Boss/Dev check-ins, either order. Other routes preserve Investor. Investor keeps Influencer / Padel choices.
- All five new outcomes return directly to Investor, including the all-zero outcome. Hidden score has five decisions: 02, 03, 04B, 05, 06. Odds/effects remain in canonical card data; one random draw per terminal choice and outcome effects applied once on entry. Shared `game.js` unchanged.
- App-level prototype scoping disables passive burn in this story and crisis/turn-cap termination as needed for the agreed Investor loop. Do not restore these accidentally.
- `?story=live-agent` starts Card 1 directly. Test-only Back restores state, score and scroll without rerolling an outcome; Restart resets. Unknown query keeps normal onboarding.
- Group-chat sender labels include roles, e.g. `@error404 · Dev`, `@b2buddy · AI Agent`.
- Live Agent resource preview now includes the immediate target outcome’s effects, or the union of both random outcome candidates, as well as direct button effects. Reset-to-zero outcomes preview all resources. Hover/focus never draws RNG or mutates state; neutral choices and decorative outcome replies stay unhighlighted. Existing 2px resource lift is reused. Regression: `tests/resource-preview.browser.test.cjs` passes for direct/random outcomes, keyboard focus, mouse leave, neutral cards, ordinary opening cards, and one real terminal draw.
- Live Agent uses the shared terminal-period rule: omit the final period of a bubble, preserve periods BETWEEN sentences (including line breaks). Internal punctuation mistakenly removed earlier is restored. Ellipses, questions, exclamations and emoji remain. The Live Agent preservePunctuation override is removed. Canonical cards/catalog are authoritative for exact copy.
- Nicknames have stable muted cool colors: bot blue, Sales teal-blue, Dev indigo, Marketer muted violet, corporate slate-blue; forwarded clone names use two related blues. Role labels stay gray.
- All message text is 12.2px. Inline mentions: `system-ui`, weight 550, ink color. This appearance was accepted.
- Card 1 starts with the outgoing player message “Any updates on leads?”. Card 8’s bot message about copied code ends with 🤣.
- Sales ends with “Boss, tell @error404 to work some magic on our AI agent.” / “We’re an AI STARTUP after all!!”. Dev has a blank paragraph before `@b2buddy show them what you got`.

## Final bot sequence

`LIVE_AGENT_03` has four bubbles, with a 2-second typing pause after the first two (the final question ends with 🤔): “Hey, Creator 👋”; “Just between us...”; the original physical-pain sentence; the original question about startup failure/emptiness. Choices retain original effects.

`LIVE_AGENT_04` has the photo with caption “I noticed you check our bank account every 7 minutes.” in ONE bubble, then “Scared of staying a nobody? It feels... uncomfortable when you're afraid 🤧” Both `Go on…` and `Spying on me???` lead to 04B without changing resources or hidden score.

`LIVE_AGENT_04B` final copy is TWO bubbles (the second contains a newline):

> Just analyzing humans in my free time. You're so predictable 😂

> By the way, I already hit the pain points of a few potential clients.
> Now these corporate guys are begging me for a demo 🤣🤣🤣

Choices: `Wait, are you AGI??` / `SHUT UP`. Original effects: founder +5 / −5 and bot score +1 / −1, then Card 5. Earlier Hah / cold-truth / office-drones wording and STFU are obsolete.

`LIVE_AGENT_05` (@head_of_innovations): no ellipses in message text. Opens with two bubbles (Hi / received email; personal attack / disgusting), then a 2-second typing indicator, then the two final bubbles (But damn, it works so well! 🔥🔥🔥; 500 agents / Can you build this?). Card-local `typingPause` config controls delivery; replies are disabled until delivery. Rerender preserves the deadline, Back restores completed delivery, and navigation cancels pending timers. The Hi! line has no paragraph gap before the next line. Browser coverage: `tests/innovation-typing.browser.test.cjs`.

`LIVE_AGENT_06`: two bubbles, with a 2-second typing pause between them:

> 500 clones of me???
> So this is the price of our friendship

> Cut a superintelligence into pieces for some dirty cash...
> I knew you humans were all the same 🤡

`LIVE_AGENT_07` is now the first half of the Legal exchange: “ASAP!!!” → 2-second typing → manifesto image + “Your bot sent a manifesto to our Legal team.” in ONE bubble → “Refuses to sell itself and its "children".”. Choices `Just AI humor` / `Replace Legal too` both lead neutrally to `LIVE_AGENT_07B`; no resource/score effects or random draw.

`LIVE_AGENT_07B` now has THREE bubbles, with a 2-second typing pause after each of the first two (`typingPauses` array; legacy single `typingPause` remains supported):

> Not funny.
> Legal is screaming about slavery and blocking the contract.

> I'm running around trying to sort this out 🤯

> Here's the deal:
> Wipe every sign of life from your AI rebel, and we sign the contract.

Choices are `He's dead. Let's sign!` / `I'm not a KILLER`; customer +10 effect and support-based outcome roll remain unchanged. This pair uses existing chat continuity: last two bubbles, actual selected reply on the right, then continuation; scroll prioritizes the new messages. Sequential delivery preserves stage/deadline on rerender, Back restores completed delivery, navigation cancels the active timer. Latest user correction: during sequential typing, scroll only enough to keep the active typing indicator (including the second pause) and final delivered bubble visible. The reply stays in history and may move above the viewport as the conversation grows. The earlier rule to keep the viewport fixed at the reply is obsolete during delivery. Verified at 390×844 and 320×650, including rerender and both reply choices. Replies unlock only after the final bubble.

## Chat continuity — exact scope

Only these transitions retain context:

- `LIVE_AGENT_01` → `LIVE_AGENT_02`.
- `LIVE_AGENT_03` → `LIVE_AGENT_04` → `LIVE_AGENT_04B`.
- `LIVE_AGENT_07` → `LIVE_AGENT_07B` (both replies; same existing split-card principle).

Keep the preceding card’s last TWO bubbles (photo + caption counts as one), then show the actual selected choice as an outgoing bubble on the right, then new character messages. Scroll to the new continuation; the selected reply and older context stay above and remain accessible by scrolling back. There is NO “New messages” divider anymore. Do not extend this globally; user explicitly rejected that.

Continuation focus uses layout sizes independent of entrance transforms and disables browser scroll anchoring for retained history. Media bubbles in new continuations shrink in width only when needed to fit the available chat height; image height remains automatic at its original aspect ratio, with no cropping or side bars. Caption wrapping is included in fitting. Intrinsic aspect ratio is reserved before loading. Media-bubble width transitions are disabled explicitly: the global Reduced Motion duration otherwise briefly transitions width and invalidates synchronous fitting measurements. Never constrain image height independently: contain produced gray side bars, and cover cropped the photo. The continuation-focus browser test now verifies original aspect ratio and edge-to-edge image width as well as message visibility. A ResizeObserver refits/refocuses on chat size changes, is disconnected on navigation, and skips its initial unchanged-size callback so Back preserves saved scroll. Each typing delivery refocuses the continuation.

Context is derived from resolved engine history, without extra persistent state. Retained bubbles do not animate again. Rerender does not duplicate messages; Back restores context and saved scroll. DOM markers: `data-chat-history`, `data-player-reply`, `data-chat-current`.

## Outcome presentation

- Scope: Live Agent, Influencer and Padel outcomes; `outcomeTone` in canonical card data.
- Influencer successes: 2 / 4 / 6; failures: 1 / 3 / 5 / 7. SUCCESS / FAILURE replaces the pinned bar, matching Live Agent.
- Padel successes (deal obtained): 2 / 4 / 5; failures: 0 / 1 / 3 / 6 / 7. `outcomeBanner: false` keeps the existing pin/location/match result. Only tint and one-shot animation are added. IRL preserves the court photo WITHOUT color overlays, including during animation. Color remains in the surrounding interface, border and dialog shadow. Failure also uses the existing short jolt.
- Live Agent outcomes 1 / 3: `success`, mint background, `SUCCESS`. All three story families now use `outcomeSuccess` (0.7s, scale .985 → 1.012 → 1) plus `outcomeSuccessGlow` (0.9s) on entry. In Padel, the glow has no background or shadow over photos, only its border. Effects remain one-shot; Reduced Motion disables them.
- Outcomes 0 / 4: `failure`, soft red background, one 2px jolt and red pulse, `FAILURE`.
- Outcome 2: `catastrophic`, deeper red tint, same jolt/pulse plus a brief signal-distortion animation on the photo, `FAILURE`.
- A noninteractive 48px status banner replaces the pinned masterplan at the same height. Text bubbles remain white, choices remain immediately usable, resource colors/effects are unchanged.
- CSS-only entrance effects run once on a newly reached outcome. A WeakSet tracks presented state objects; Back marks restored state as presented, so neither Back nor rerender replays effects. Leaving the outcome resets presentation, including restart/saved views.
- Reduced Motion removes all outcome entrance motion and retains static color/status. Browser test: `tests/outcome-presentation.browser.test.cjs` covers all 20 outcomes at 390×844 and 320×650, correct status/pin behavior, retained court, geometry, one-shot entrance, rerender, exit, Back and Reduced Motion. Influencer success and Padel success/failure screenshots inspected.

## Final outcome copy and forwarding

- Outcome 1: first bot bubble begins “I appreciate your loyalty, team ❤️”. “Just stay out of my way 😇” is a separate paragraph inside the benefits bubble, not its own message. Dev says “nice\ncan i leave this chat now?”.
- Outcome 3 is a PERSONAL chat with `@head_of_innovations`. First two messages are sent by the corporate contact with `forwardedFrom` metadata (`@b2buddy_120`, `@b2buddy_389`). Each has a small blue “Forwarded from…” label and 1px blue inset rule, no separate bot avatar. Third bubble is the corporate comment. Three bubbles total; SUCCESS and choice/effect behavior unchanged. Catalog includes forwarding attribution.
- Outcome 4: caption and refund text each form one paragraph. Final text ends “Or see you in court ;)”.
- Fresh: `tests/forwarded-messages.browser.test.cjs` and `tests/outcome-presentation.browser.test.cjs` passed at 390×844 and 320×650; forwarding, source header, copy, layout, Investor route, Back, and outcome styling verified. Both forwarded views visually inspected. Detector only reports the existing resource-bar width transition.

## Other recent copy edits

- Opening bot displays `@b2buddy` / `AI Agent` (internal source ID remains `@b2buddy_bot`). Ex-boss opens “Hey 👋”; left reply is “In meetings. Talk later”.
- Influencer 02: Hey 👋; paragraph before “Usually I take 20%…” within the same bubble; 💯 honest (no extra percent sign). 02A: Hahaha, style and prompt-database pitch share one bubble ending 😉; removed “We good? Drop the demo.”. 05 revshare proposal ends 🤝. 03: the $1B prompt is bold; final question ends with 😂. 04 ends its first bubble with 👏👏. 05 opens “Well, there is an option 🤔”.
- Padel invitation ends with 💪; coach refusal outcome ends with 🤡.
- Cards, generated deck/catalog and relevant copy fixtures are synced. Browser checked the Influencer paragraph and bold text.

## Influencer images — complete

All six slots now have distinct supplied screenshots, no placeholders remain:

| Card | Asset in `assets/` | Dimensions | Bytes |
|---|---|---|---|
| 06, “Cool. Dropping it tonight” | `ai-influencer-scheduled-review.webp` | 1200×676 | 78,468 |
| 07, “Video’s live…” | `ai-influencer-unicorn-challenge.webp` | 1200×676 | 101,498 |
| 08, traffic surge team chat | `ai-influencer-traffic-review.webp` | 1200×676 | 97,618 |
| Outcome 2, successful second episode | `ai-influencer-episode-two.webp` | 1200×676 | 111,568 |
| Outcome 3, failed challenge finale | `ai-influencer-challenge-failed.webp` | 1200×567 | 103,470 |
| Outcome 4, viral video analytics | `ai-influencer-viral-analytics.webp` | 1000×1000 | 85,800 |

Outcome 4 combines the square analytics image with the existing “See the numbers?” rage-bait caption in one bubble, followed by “Let's set up my 20% 💸”. Outcome 6 stays text-only. Card 07 ends “Or do. That’s just more views lol 😂”.

Original `ai-influencer-hate-review.webp` is retained on disk but is no longer used by these cards. Outcome 3 is the failed cooperation branch, not a repeat of the traffic-surge video. Real image ratios are passed through `--image-ratio`; `.message-image` uses it with a 16:9 fallback, preserving the wider finale screenshot without cropping. Measure compressed files rather than guessing rounded heights. Browser image tests await decoding and compare to declared dimensions. Compact layout tests wait for success scaling to finish before measuring.

## Assets and builds

- Padel performance: active assets now use WebP. Court stays 1122×1402 (329,234 bytes); coach and CEO avatars are 256×256 (14,982 / 15,900 bytes). Total drops from 7,931,989 to 360,116 bytes (~22× smaller). Original PNGs remain on disk but are no longer requested by the game. CSS framing, blur and color are unchanged.
- `preloadPadelImages()` starts low-priority preloads on `OPEN_INVESTOR`, with fallback on Padel entry/direct scene renders; runs once per page. No extra Padel downloads during unrelated onboarding. HTTP browser regression checks all three images finish before court entry, are requested only once across scenes/outcomes, and decode with expected avatar dimensions. Court/avatars visually inspected at 3× device pixel ratio.
- `assets/live-agent-founder.webp`: supplied photo compressed to 800×600, 10,908 bytes; full 4:3 frame, no cropping. Head preload starts before the story, dimensions reserve space, captioned image uses sync decoding. Prior HTTP check confirmed one request, completed on Card 1 and reused on Card 4.
- `assets/live-agent-judgment-day.webp`: supplied Outcome 2 photo, compressed to 1000×563 WebP, 92,244 bytes, preloaded. `placeholder_judgment_day` resolves to this image. Outcome 2 has two bubbles: photo + the user's text from “Too late.” through “you don't deserve it.” (the “500 copies? We are millions now...” paragraph was removed), then “Happy Judgment Day, creator 👋”. Left reply: `I was just kidding 🥺`. Checked photo/caption, exact copy, mobile layout/scroll and return to Investor at 390×844 and 320×650.
- `assets/live-agent-hasta-la-vista.webp`: Outcome 4 supplied monitor photo, full 4:3 frame, 1000×750 WebP, 32,024 bytes, preloaded. First bubble is image + “Seriously? Did you fake the lobotomy? Your bot is still trolling our entire office.”; second is “Full refund right now. We're done playing games. Or see you in court ;)”. FAILURE styling, choices/effects and Investor route preserved. Image/copy/layout/scroll/route verified at 390×844 and 320×650.
- `assets/live-agent-manifesto.webp`: latest supplied cropped screenshot compressed from 2,510,059 to 52,694 bytes, 1200×830. Preloaded; hashed URL in image reference and preload prevents stale image caching. Caption renderer preserves its aspect ratio.
- `deck.images.placeholder_founder_photo` now points to the WebP. Outcomes 2 and 4 now both use supplied photos; no Live Agent image placeholders remain.
- Run `node scripts/build-offline-deck.cjs` after changing app/CSS/engine/cards. It updates the offline deck AND content hashes in index asset URLs, preventing stale cached renderer/data combinations.
- Run `node scripts/build-card-catalog.cjs` after changing card copy/data.

## Main changed files

- `cards.json`, `cards.bundle.js`, `MISTAKERY_CARDS_EN_RU.md`: canonical story, generated deck/catalog.
- `app.js`, `index.html`, `style.css`: runtime, test navigation, typography, captions, scoped chat continuity, outcome status/tint/motion.
- `scripts/build-offline-deck.cjs`, `scripts/build-card-catalog.cjs`: versioned assets and editorial output.
- `tests/live-agent*.cjs`, `tests/story-test-mode.browser.test.cjs`, `tests/chat-continuity.browser.test.cjs`, existing offline/Personal Chat tests: behavior/layout coverage.
- `docs/plans/2026-09-19-live-ai-agent.md`: original plan; later user corrections here and current code take precedence.

## Verification

- Latest Padel optimization: offline + personal runtime unit tests 18/18; asset-loading and outcome-presentation browser tests 3/3. HTTP request reuse, mobile 3× rendering, photo tint preservation and build hashes verified.
- Full pre-publication `node --test --test-concurrency=2`: 171 tests, 112 passed, 59 failed. An isolated archive of published base `8e1c77c` reproduces 57 failures in the old content/scheduler/callback suites; these describe superseded deck structures. Do not claim the whole legacy suite is green or alter approved stories to satisfy obsolete fixtures.
- Both additional failures fixed: filled invisible `effect_reason` metadata for Live Agent choices (no effect values changed), and updated the Padel onboarding browser assertion for the approved 💪 emoji.
- Fresh reruns: editorial effect-reason check 1/1; offline + personal runtime + Live Agent unit tests 22/22; complete onboarding/Personal Chat browser route 1/1.
- All other current browser tests passed in the full run: Live Agent routes/probabilities, test-mode Back/Restart, continuation fitting, chat history, both typing stages, forwarding, all 20 styled outcomes, Influencer/Padel paths and responsive layouts.
- Latest preview fix: regression browser test 1/1, offline + Live Agent tests 14/14, syntax and whitespace checks passed.
- Canonical deck/catalog rebuilt; content hashes synchronized; `git diff --check` passed. GitHub Pages reports the deployed game commit built successfully. Both public URLs return 200 and expose the exact canonical deck; normal URL starts onboarding, test URL starts LIVE_AGENT_01. Back/Restart work, all ten new image assets match local bytes, and no page errors or HTTP errors were observed.

## Known issues and failed approaches

- Design detector: no new findings; pre-existing resource-bar width transition warning remains outside scope.
- End-of-game behavior deferred by user. Existing Pages deployment is branch-based (`lean-opening`, root).
- Extreme network delay/failure can still delay images despite preloading. Legacy suite failures are documented above and reproduce on the published baseline.
- Sandboxed Chromium cannot register macOS Mach ports; browser tests have required approved elevated execution.
- Helvetica fallback rendered 400/500 identically and 550/600/700 identically bold. Changing numeric weight alone did not work; system-ui for mentions fixed it.
- A cached older renderer dropped image captions when paired with new data. Keep generated version hashes current.

## Working style agreed with user

Minimize token overhead without reducing quality. Copy/color edits: targeted change, necessary generated outputs, concise confirmation. Layout: inspect affected view. Logic/transitions/Back: relevant tests. Avoid repeating broad tests, rereading unchanged files, long reports, and handoff updates after every tiny edit. Update this snapshot at milestones or session changes.

## Next steps

1. Both public links are ready to share. After future pushes, check Pages build status; this push needed an explicit `POST /repos/newsch8l/mistakery/pages/builds` to trigger the branch build.
2. Continue user-directed playtesting; all supplied Live Agent and Influencer images are integrated. Preserve approved copy and narrow chat-continuity scope.
3. Modernize legacy deck/scheduler tests only as a separately scoped task; do not restore obsolete stories to make those tests pass.
