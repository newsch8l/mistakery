# IRL Padel Runtime Design

## Scope

Add exactly one approved runtime card, `IRL_PADEL_01`, immediately after `DREAM_TEAM` in the canonical deck. Both Dream Team choices lead to it. No other disabled content becomes reachable, and no production publish, commit, or push is part of this stage.

## Experience

The card introduces a third scene mode, `irl`, based on Screen 13 `IRL · Padel Club`. The existing phone shell, header, resources, and bottom choice row remain. Inside the scene, the padel-court photograph fills the scene background beneath a dark atmospheric overlay. The top contact card shows `@padel_pro` with a letter `P` avatar. The normal pinned Masterplan becomes a location card reading `IRL · PADEL CLUB` and `Score: 0–0`.

The centered white dialogue card contains three authored lines with no extra paragraph margins:

1. `Bro, you do NOT pitch here.`
2. `Start selling, and you're a nobody to him.`
3. `Earn his respect on the court first.`

The visible terminal-period normalization remains active, so the final visible line does not end in a single period. Quiet Glass `Choose a reply...` is hidden in IRL mode. Choices are exactly `Mouth shut, game on` and `Now or never, pitching`.

## Runtime behavior

The active-card gate expands from eight to exactly nine IDs. Both Dream Team choices retain empty effects and flags and transition to `IRL_PADEL_01`. Both IRL choices also have empty effects and flags; selecting either keeps the IRL card visible, disables both buttons, and stops the approved runtime. Restart and earlier modes must clear IRL-specific classes and restore their existing UI.

## Verification

Structural tests cover card order, data, exact copy, empty effects, transition targets, the nine-ID gate, and bundle parity. Browser tests cover both Dream Team branches, both IRL terminal choices, IRL DOM and mode classes, hidden Quiet Glass, location/contact content, image background, line spacing, punctuation, disabled-card gate, and no page/scene overflow at 390×844 and 320×650.
