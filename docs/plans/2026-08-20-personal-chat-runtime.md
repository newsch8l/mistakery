# Personal Chat Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the published game's old messenger presentation with the approved onboarding, Saved Messages, opening Personal Chat, and Quiet Glass UI while preventing every unapproved card from entering play.

**Architecture:** Keep `cards.json`, `cards.bundle.js`, and `game.js` unchanged. Rebuild the DOM/CSS presentation in `index.html`, `style.css`, and `app.js`; add an explicit six-card UI allowlist and stop on `OPEN_INVESTOR` before engine navigation. Use app-owned onboarding/Saved/terminal view stages around the existing engine-driven opening sequence.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node test runner, Playwright.

---

### Task 1: Lock the approved runtime contract

**Files:**
- Create: `tests/personal-chat-runtime.test.cjs`
- Create: `tests/personal-chat-runtime.browser.test.cjs`

**Step 1: Write the failing structural tests**

Assert:

- exact six-card `ACTIVE_CARD_IDS` allowlist;
- exact onboarding/Saved copy and cumulative onboarding bubble behavior;
- Screen 13 component hooks in `index.html`;
- Quiet Glass dimensions and 16/8 px gap tokens;
- no terminal plaque or post-Investor render path;
- `cards.json` and `game.js` contain no migration edits.

**Step 2: Run the structural test and verify RED**

Run: `node --test tests/personal-chat-runtime.test.cjs`

Expected: FAIL because the runtime still uses the old component structure and has no active-card gate.

**Step 3: Write the failing Playwright journey**

Automate onboarding → two Saved Messages → opening → Investor. Collect every rendered `data-card-id`, click an Investor reply, and assert the page remains on `OPEN_INVESTOR` with disabled replies and without `AGENT_01`, `PADEL_01`, an ending, or a terminal plaque.

**Step 4: Run the journey and verify RED**

Run: `node --test tests/personal-chat-runtime.browser.test.cjs`

Expected: FAIL against the old DOM and post-Investor navigation.

**Step 5: Commit checkpoint**

Do not commit until the user explicitly authorizes a commit.

### Task 2: Add the approved visual assets and semantic shell

**Files:**
- Create: `assets/icons/wallet.svg`
- Create: `assets/icons/users-three.svg`
- Create: `assets/icons/handshake.svg`
- Create: `assets/icons/lightning.svg`
- Create: `assets/icons/PHOSPHOR-LICENSE.txt`
- Modify: `index.html`

**Step 1: Add the licensed resource glyphs**

Copy the four approved Phosphor SVGs and their MIT license from the visual workspace.

**Step 2: Replace old messenger markup**

Create one 340 × 700 phone shell with:

- brand/header and restart button;
- dynamic four-resource strip;
- intro scene and game scene using contact, optional pinned strip, chat, reply hint, and choices rows;
- no legacy composer or terminal plaque;
- accessible live regions and disabled-state hooks.

**Step 3: Run structural tests**

Run: `node --test tests/personal-chat-runtime.test.cjs`

Expected: markup assertions pass; CSS/app assertions remain red.

### Task 3: Port Screen 13 and Quiet Glass CSS

**Files:**
- Modify: `style.css`

**Step 1: Implement the shell and HUD tokens**

Port the approved 340 × 700 phone, B2BuyerSpyer brand, resource glyph/bar treatment, scene glass, contact card, pinned strip, chat, messages, and pill replies.

**Step 2: Implement mode variants**

Add onboarding cumulative stack, Saved outgoing blue note, normal incoming chat, progressive HUD shell stages, and disabled Investor choice treatment.

**Step 3: Protect shadows and geometry**

Use normal-flow rows, `overflow: visible` on chat, explicit z-index for chat/hint/choices, 4 px message clearance, 4 px hint top inset, and 8 px chat gap.

**Step 4: Run structural tests**

Run: `node --test tests/personal-chat-runtime.test.cjs`

Expected: CSS assertions pass; app behavior assertions remain red.

### Task 4: Implement onboarding and Saved Messages view stages

**Files:**
- Modify: `app.js`

**Step 1: Preserve exact approved copy**

Keep the three onboarding messages, three onboarding replies, two Saved notes, their date chips, and four Saved replies unchanged.

**Step 2: Render cumulative onboarding**

Render 1/2/3 separate message bubbles. Apply shell stages:

- first: no brand/HUD;
- second: brand and 100/100/100/100 HUD;
- third: real 25/60/15/65 HUD and disabled restart.

**Step 3: Render Saved Messages**

Use the same bottom-aligned chat geometry as opening cards, date chip, outgoing blue bubble, bookmark avatar, no pinned strip, and free choices.

**Step 4: Run structural and browser tests**

Run: `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs`

Expected: onboarding/Saved journey passes; terminal gate remains red.

### Task 5: Gate the playable opening and stop on Investor

**Files:**
- Modify: `app.js`

**Step 1: Add the exact active-card allowlist**

Expose `ACTIVE_CARD_IDS` containing only `OPEN_01`, `OPEN_02a`, `OPEN_02b`, `OPEN_BOSS`, `OPEN_DEV`, and `OPEN_INVESTOR`.

**Step 2: Guard card rendering**

Reject any attempt to render an ID outside the allowlist. Do not delete or mutate its card data.

**Step 3: Stop before post-Investor navigation**

Intercept either Investor reply, mark the view `opening-complete`, keep the Investor card on screen, disable both choices, clear resource preview, and ignore keyboard choice shortcuts. Do not call engine navigation and do not render a new plaque or ending.

**Step 4: Verify GREEN**

Run: `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs`

Expected: both files pass.

### Task 6: Playtest and responsive QA

**Files:**
- Create: `docs/qa/personal-chat-runtime-desktop.png`
- Create: `docs/qa/personal-chat-runtime-mobile.png`

**Step 1: Boot locally**

Run: `python3 -m http.server 4174`

**Step 2: Exercise the complete approved flow**

Verify all onboarding stages, both Saved screens, both `OPEN_01` branches, both Boss/Dev orders where deterministic control permits, and both Investor replies.

**Step 3: Measure layout**

Assert:

- message-to-hint ≈ 16 px;
- hint-to-choices ≈ 8 px;
- message shadows are not clipped;
- no phone/scene/page overflow;
- phone remains 340 × 700 on desktop and fits narrow mobile viewport;
- browser console has no errors or warnings.

**Step 4: Run focused regression suite**

Run: `node --test tests/personal-chat-runtime.test.cjs tests/personal-chat-runtime.browser.test.cjs tests/offline.test.cjs tests/engine.test.cjs tests/balance.test.cjs`

Expected: all selected current-scope tests pass. Separately record the pre-existing legacy full-suite baseline of 76 pass / 56 fail.

### Task 7: Update continuation status

**Files:**
- Modify: `PROJECT_STATUS.md`

**Step 1: Record branch, SHA, changed files, and checks**

Document that publication has not occurred, `lean-opening` remains unchanged, and disabled card data remains preserved but unreachable in the browser runtime.

**Step 2: Record the next publication gate**

The next external action requires explicit authorization to commit, push, and change GitHub Pages. Preserve the old public build under `/classic/` during that later publication stage.

