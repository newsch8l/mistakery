# Padel Invite and Dream Team Runtime Design

## Scope

Extend the approved Personal Chat opening with exactly two new runtime cards after `OPEN_INVESTOR`: a normal personal chat with `@padel_pro`, followed by a `Dream Team` group chat. Keep every other legacy card disabled and leave the old Padel arc untouched.

## Flow

- Both existing Investor choices keep their current effects, flags, and canonical legacy targets. The scoped Personal Chat runtime resolves either choice and then explicitly bridges both outcomes to `PADEL_INVITE`; this preserves the direct-engine balance contract without exposing either legacy target in the UI.
- `PADEL_INVITE` renders two incoming bubbles simultaneously through the existing `\n\n` multi-bubble pattern.
- Both Padel choices have no effects or flags and route to `DREAM_TEAM`.
- `DREAM_TEAM` renders one outgoing founder bubble and two incoming member rows simultaneously.
- Both Dream Team choices have no effects or flags. Choosing either leaves the card visible and disables both buttons.
- No typing delays are introduced between the new messages or scenes.

## Data and rendering

`cards.json` remains canonical and `cards.bundle.js` mirrors it exactly. `PADEL_INVITE` uses the default personal-card shape. `DREAM_TEAM` uses `mode: "team"` plus a data-driven `messages` array containing outgoing/incoming direction, source, and copy. The runtime gate expands from six to exactly eight approved IDs, and `continueFromInvestor` is the only runtime-only bridge into the new sequence.

The team renderer follows Screen 13: `DT` contact avatar, `Dream Team`, `6 members · 3 online`, pinned Masterplan, blue outgoing bubble on the right, orange `BD` and violet `HQ` participant avatars on the left, member handles, and the existing Quiet Glass `Choose a reply...` between messages and choices. Team message text is `12.2px`; existing personal/onboarding/Saved message text remains `13.5px`.

## Constraints

- Preserve the 620 ms onboarding typing treatment, cumulative onboarding, progressive HUD, Saved Messages, current opening branches and copy, 6 px multi-bubble gap, 16 px last-message-to-Quiet-Glass gap, and 8 px Quiet-Glass-to-choice gap.
- Keep the visible terminal-period normalization at every message boundary.
- At 390×844 and 320×650, the page and scene must not overflow or overlap.
- Do not commit, push, publish, or activate any other disabled content.

## Verification design

Structural tests cover exact card order, copy, labels, effects/flags/next targets, eight-ID allowlist, team schema, and bundle parity. Browser tests cover both Investor branches, both Padel choices, both terminal Dream Team choices, simultaneous bubble rendering, direction/participant styling, Quiet Glass geometry, `12.2px` team typography, disabled-card gate, terminal punctuation, and both required viewports.
