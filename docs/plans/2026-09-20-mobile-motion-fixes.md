# Mobile motion fixes

Historical plan: its reduced-motion policy is superseded by the user’s explicit full-motion request in `2026-09-20-full-mobile-motion.md`. Decode/cancellation and repeat-touch fixes remain active.

Implement the user-approved audit fixes, preserving game data, normal typing cadence and system reduced-motion preferences.

1. Regression first: Chromium/Pixel 7 and WebKit/iPhone 13, normal/reduced motion; assert static reduced typing, normal 1.1 s cycle, actual raw double tap protection, delayed-image motion after readiness, cleanup on navigation/error/timeout, Back and Restart.
2. Reduced motion: explicitly remove typing bubble/dot animation, with stable dot opacity; retain static outcome colors/status and existing absence of motion.
3. Outcome image: scene/status appears immediately. Only the catastrophic image effect waits for decode, bounded at 2.5 s; cancel on render/navigation and suppress stale/hidden/reduced-motion completion. Image readiness must never gate navigation indefinitely.
4. Input guard: extend the existing post-choice lock for actual outcome arrivals to 950 ms success / 670 ms failure/catastrophic, or 550 ms reduced motion. These cover current 900/620 ms visual effects with a margin; normal choices retain 280 ms. Back/Restart remain immediate.
5. Rebuild offline hashes, run focused and existing relevant regressions, inspect mobile screenshots, request independent review, update handoff, publish atomically to all three branches, verify Pages and public regressions.
