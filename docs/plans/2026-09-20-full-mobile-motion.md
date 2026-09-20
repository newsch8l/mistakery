# Full mobile motion

The user explicitly rejected static phone animations and requested the same full animation quality as desktop. This supersedes the system-reduced-motion policy in the earlier mobile audit/fix plan.

Use the same existing desktop CSS timelines on mobile regardless of OS reduced-motion preference: typing dots 1.1 s with stagger, message entrances, outcome success/failure and decoded-image effect. Remove automatic CSS/JS suppression, including the shorter reduced-mode input lock. Keep the bounded image-decode wait, navigation cancellation, normal message pauses, outcome double-tap protection, Back/Restart and game data unchanged. Do not add new motion libraries or settings UI to accomplish parity.

Verify red/green mobile-vs-desktop typing styles and actual changing opacity in Chromium/WebKit, both system settings, outcome motion and protection through the complete success entrance, delayed-image effect after system setting changes, existing regressions. Rebuild hashes, review, publish all three branches, verify Pages/public tests.
