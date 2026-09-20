# Default Cash burn

User change on 2026-09-20 supersedes previous no-passive-burn instructions: every gameplay turn in every branch costs 0.5 Cash in addition to canonical choice/outcome effects.

- Set `cards.json` meta.baseCashBurn to -0.5 and remove all runtime branch overrides. Use the existing single engine resolution and clamp, preserving fractional resources and history deltas. Never deduct during rendering or hover.
- All gameplay replies, including neutral interludes and decorative outcome replies, are turns. Onboarding/Saved Messages navigation and Back/Restart are controls, not additional turns. Back restores the snapshot including fractional Cash. Existing implicit-burn preview convention remains: only explicit choice/outcome resource effects highlight.
- Keep crises and turn-cap endings disabled throughout the active prototype, including opening/Investor at zero. Preserve all card effects, probabilities, routes, copy and presentation.
- Add a failing cross-branch regression, update resource expectations, rebuild offline deck/catalog/hash, run unit/browser regressions, refresh PROJECT_STATUS.md, commit and atomically publish all three branches; verify Pages and both public entries.
