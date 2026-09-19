# Live AI Agent implementation plan

**Goal:** Add the approved eight-card English story and five outcomes to the existing messenger prototype.

**Architecture:** Reuse canonical card data, the storylet flags/gates, resource engine, Personal Chat / Dream Team renderers, media bubbles, and scoped prototype outcome handlers. Keep the shared engine unchanged. Sales selection queues the story after Boss and Dev. Every new outcome returns directly to Investor; resource boundaries must not stop this prototype loop.

**Tech stack:** Existing vanilla JavaScript, JSON, CSS, Node test runner, Playwright.

Source: https://docs.google.com/document/d/1K5rt9p63YyMBYOTXmyPhddnjg8vkPiEPH2024HUtVRo/edit

## Steps

1. Add failing route, probability, resource, completion and browser checks in `tests/live-agent.test.cjs` and `tests/live-agent.browser.test.cjs`. Verify the missing story fails these checks.
2. Add `LIVE_AGENT_01–08` and `LIVE_AGENT_OUTCOME_0–4` to `cards.json`; preserve source English exactly except splitting into bubbles. Add the source handles and the pending/completed gates. Leave Investor's existing two destinations intact.
3. Extend `app.js` with the existing scalar story-state pattern for a hidden score. Resolve one random draw on terminal choices; apply outcome resources once through the existing engine, before rendering the outcome. Zero all resources for outcome 2. Decorative outcome replies only complete the branch and return to Investor.
4. Reuse media placeholders with stable asset references; support media at its authored position in personal messages. Add scoped scrolling for this story, retaining existing chrome and reply controls.
5. Regenerate offline bundle and editorial catalog, update the approved runtime allowlist test, and run focused Node/Playwright regressions. Exercise every probability threshold, all outcome replies, both Boss/Dev orders, English bubble rendering and mobile geometry.
6. Inspect representative screenshots, open local preview for review, and update `PROJECT_STATUS.md` with fresh results. Do not commit, push or publish during this local implementation.

## Accepted changes to the original brief

- English only; no Russian translation work.
- Entry: `OPEN_02b` → `Sales, wake up`, after both mandatory Boss/Dev check-ins.
- All five new outcomes return to `OPEN_INVESTOR`; even zero resources must allow continued prototype interaction.
- No art search or generation. Three stable placeholder references; replacement uses the existing media mechanism.
- Preserve resources from the brief, disable extra passive cash burn inside this branch, retain existing 0–100 clamping.

## Test-mode extension (approved)

- Direct `?story=live-agent` entry with initial resources and a fresh score.
- Back restores the entire pre-choice state without rerolling; choosing again may reroll.
- Restart story and page reload clear navigation history.
- Test controls are hidden in ordinary play; test panel remains adjacent to the phone across mobile/desktop widths.
- Acceptance: `tests/story-test-mode.browser.test.cjs`, existing story and runtime regressions.
