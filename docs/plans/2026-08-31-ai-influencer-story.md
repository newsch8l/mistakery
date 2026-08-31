# AI Influencer Story Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development and execute this plan task-by-task in the existing `personal-chat-runtime` worktree. Do not commit, push, publish, or discard pre-existing changes.

**Goal:** Add the complete English “Breaking Point” AI-influencer story to the active Personal Chat runtime while preserving the Padel branch, existing UI, resources, and all pre-existing uncommitted work.

**Architecture:** Keep `cards.json` canonical and regenerate `cards.bundle.js`. Route only `OPEN_INVESTOR` left to the new branch; keep the right choice routed to Padel. Use one app-owned previous-card field to select the contextual labels and destinations for Cards 5 and 6, one exact 40/60 selector for terminal outcomes, and the existing no-burn resolution boundary so new-story choices do not move resources. Extend the existing personal/team renderers with compact optional media-placeholder bubbles and preserve document paragraph boundaries as separate message bubbles.

**Tech Stack:** Vanilla JavaScript, JSON card deck, Node test runner, Playwright browser tests, CSS.

---

### Task 1: Lock the canonical story content and graph

**Files:**
- Modify: `tests/personal-chat-runtime.test.cjs`
- Modify: `cards.json`
- Regenerate: `cards.bundle.js`

1. Add structural assertions for exactly `INFLUENCER_01`, `INFLUENCER_02`, `INFLUENCER_02A`, `INFLUENCER_03`…`INFLUENCER_08`, and `INFLUENCER_OUTCOME_1`…`INFLUENCER_OUTCOME_7`.
2. Assert English document copy, paragraph boundaries, sources/modes, two choices per card, empty effects, and placeholder labels.
3. Assert `OPEN_INVESTOR` keeps its existing effects but its left canonical destination becomes `INFLUENCER_01`; its right/P⁠adel destination remains unchanged.
4. Run `node --test tests/personal-chat-runtime.test.cjs` and confirm RED because the new cards are absent.
5. Add the minimal canonical card data and new `@ai_evangelist` source. Represent long personal-card paragraphs as separate `messages` strings; represent team-chat content as the existing message objects. Attach compact placeholders to the card or exact team message that owns the future screenshot.
6. Regenerate with `node scripts/build-offline-deck.cjs`.
7. Re-run the structural test and confirm remaining failures are runtime-only.

### Task 2: Add branch routing, contextual Cards 5/6, and exact 40/60 outcomes

**Files:**
- Modify: `tests/personal-chat-runtime.test.cjs`
- Modify: `tests/personal-chat-runtime.browser.test.cjs`
- Modify: `app.js`

1. Add tests for the active runtime allowlist, left Investor entry, right Padel preservation, no-burn resource invariance, and outcome completion through `SAVED_02_UPDATE`.
2. Add boundary cases proving one draw per terminal selection: `0` and `0.399999` select the win; `0.4` and `0.999999` select the failure for all three outcome pairs.
3. Add all Card 4→5/6 routes:
   - `4→5→7`, `4→5→6→7`, `4→5→6→8`;
   - `4→6→5→7`, `4→6→5→8`, `4→6→8`.
   Assert every route contains no duplicate ID.
4. Run focused tests and confirm RED because the runtime functions and state do not exist.
5. Add `influencerPreviousCardId`, reset it on run/restart/completion, and set it only while advancing through this branch.
6. Resolve every influencer choice with a temporary `baseCashBurn: 0` deck. Preserve the Investor card’s existing effects at entry; keep all subsequent branch resources unchanged.
7. Override only the displayed/selected Card 5/6 choice set based on the stored previous card; do not duplicate canonical cards.
8. Add `selectInfluencerOutcome(cardId, side, rng = Math.random)` using `rng() < 0.4`, exactly once per Card 7/8 choice.
9. Re-run focused structural and browser tests to GREEN.

### Task 3: Render paragraph bubbles and compact screenshot placeholders

**Files:**
- Modify: `tests/personal-chat-runtime.browser.test.cjs`
- Modify: `app.js`
- Modify: `style.css`

1. Add browser assertions that document paragraphs render as separate personal message bubbles and team messages keep their stated order.
2. Add assertions for `Video preview screenshot`, `Positive review screenshot`, and `Hate video screenshot` placeholders at their intended cards/messages.
3. Assert placeholders are visually compact: full available bubble width but capped height, smaller than the surrounding chat viewport, and no scene/page overflow at 390×844 and 320×650.
4. Run the focused browser test and confirm RED because placeholder markup/styles are absent.
5. Add one reusable `.media-placeholder` bubble fragment. Render card-level placeholders in personal chat and message-level placeholders inside the relevant team bubble, using the existing messenger spacing/radius/color language.
6. Add only narrowly scoped CSS for the neutral rectangular placeholder; do not change the overall phone, scene, header, resources, reply controls, or choice layout.
7. Re-run browser tests to GREEN and visually inspect representative personal/team cards at both viewport sizes.

### Task 4: Full verification and handoff

**Files:**
- Update: `PROJECT_STATUS.md`

1. Run `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs tests/engine.test.cjs tests/balance.test.cjs tests/offline.test.cjs`.
2. Run `node --check app.js`, `node --check cards.bundle.js`, deck validation, bundle equality, and `git diff --check`.
3. Manually traverse all six Card 4→7/8 routes and both probability boundaries for every outcome pair; confirm no duplicated card and no resource movement after entry.
4. Verify Padel’s existing left/right runtime behavior and probability tests remain green.
5. Update `PROJECT_STATUS.md` with the fresh branch/SHA, changed files, checks, decisions, and remaining limitations.
6. Report results without committing, pushing, or publishing.
