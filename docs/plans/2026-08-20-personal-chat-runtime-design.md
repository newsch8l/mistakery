# Personal Chat Runtime Design

## Goal

Move the approved onboarding, Saved Messages, opening Personal Chat, and S Quiet Glass reply hint into the real browser game while preserving the current published branch and excluding every unapproved card from play.

## Approved flow

1. Onboarding message 1: one bubble, no startup shell.
2. Onboarding message 2: two cumulative bubbles, B2BuyerSpyer shell, optimistic 100/100/100/100 HUD.
3. Onboarding message 3: three cumulative bubbles, real 25/60/15/65 HUD, disabled `Back to 9–5`.
4. Saved Messages plan.
5. Saved Messages five-month update.
6. `OPEN_01`.
7. Exactly one of `OPEN_02a` or `OPEN_02b`.
8. `OPEN_BOSS` and `OPEN_DEV` in either order.
9. `OPEN_INVESTOR`.
10. Either Investor reply locks the run on the same card. No next card, ending card, or terminal plaque is rendered.

The only playable deck card IDs are `OPEN_01`, `OPEN_02a`, `OPEN_02b`, `OPEN_BOSS`, `OPEN_DEV`, and `OPEN_INVESTOR`. All other card data remains present and unchanged but is never rendered by the browser runtime.

## Visual system

- Phone: 340 × 700 design authority, responsive down to the available viewport.
- Material: final screen 13 Personal Chat shell.
- Message typography: 14.5 px / 1.42 everywhere, including cumulative onboarding and Saved Messages.
- Onboarding: no pinned strip.
- Saved Messages: bookmark avatar, outgoing blue self-chat bubble, date chip, no pinned strip.
- Opening cards: contact header, pinned founder update, incoming white message, actual resource HUD.
- Reply prompt: approved S Quiet Glass pill, 34 px high and full 300 px content width, 24 px upward-arrow circle, normal-weight `Choose a reply...`.
- Message-to-hint gap: approved 16 px, implemented in normal flow with 8 px chat gap, 4 px hint top inset, and 4 px clearance.
- Hint-to-buttons gap: 8 px.
- Message/chat overflow stays visible and stacking is explicit so the message shadow is not clipped by the hint row.

## Architecture options

### A. UI gate after the approved opening (selected)

Keep `cards.json` and `game.js` unchanged. The browser app exposes the approved card allowlist, refuses to render any other card, and intercepts either `OPEN_INVESTOR` reply before engine navigation. The same card remains visible with its replies disabled.

This is the smallest reversible change, leaves unapproved material intact, and cannot accidentally change narrative data or scheduler behavior.

### B. Filter the deck before engine startup

Rejected because direct `next` references and validation assume the full source deck. Filtering creates a second deck representation and risks silent scheduler changes.

### C. Add a disabled-card contract to cards and engine

Rejected for this stage because it broadens a visual migration into a data-schema and engine change. It would also require updating many unrelated legacy tests.

## Runtime state

The app owns view stages separately from engine state:

- `onboarding`: delivered bubble count 1–3 and shell stage `intro`, `optimistic`, or `real`;
- `saved`: note index 0–1;
- `playing`: approved opening card rendered from engine state;
- `opening-complete`: current card remains `OPEN_INVESTOR`, choices are disabled, and keyboard choice shortcuts are ignored.

No invented ending, success message, or disabled-content plaque is introduced.

## Verification

- Static contract tests assert exact copy, active IDs, component structure, Quiet Glass geometry, 16/8 px gap tokens, and the terminal UI gate.
- Browser tests click through onboarding, both Saved screens, and an opening path; assert that every rendered deck ID belongs to the allowlist; and verify that Investor selection cannot render `AGENT_01`, `PADEL_01`, or any other disabled card.
- Browser geometry checks cover 340 × 700, a narrow mobile viewport, message-shadow clearance, HUD stages, and zero page/phone overflow.
- Existing legacy tests that expect the superseded 57-card deck remain documented as pre-existing baseline failures and do not authorize restoring old cards.

