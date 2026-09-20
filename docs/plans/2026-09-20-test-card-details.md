# Test card translations and resources

Add a test-only RU / ± button opening an accessible, scrollable dialog with current-card Russian text, contextual reply translations, explicit decision effects, default Cash −0.5, and possible outcome effects. Outcome cards show their already-applied entry effects separately from the next reply's cost. Values are read from canonical cards; inspection never resolves a choice or rolls RNG.

Translations: fully read all three user-provided Google Docs on 2026-09-20. Use their RU copy aligned to the actual English cards, split Live Agent 04/04B and 07/07B, select the Padel variants matching approved current English. Remove obsolete lines, preserve author attribution; identify adaptations. Opening/Saved Messages and Live Agent outcome 0 lack complete source translations: provide translations of the current English with honest provenance.

Implementation: canonical `testTranslations` in cards.json; native dialog/button in index.html, scoped styles, rendering in app.js. Cover all active story/opening cards and both Saved Messages screens. Generate catalog using the same translations and rebuild offline bundle/hashes. Preserve gameplay, copy/media and main-version UI.

Verification: coverage/content tests; mobile modal geometry, scrolling, keyboard focus/Escape, arrows blocked while dialog open, opening/closing without state/history/resource/RNG mutation, contextual replies and all outcome families including reset-to-zero, base burn and early Padel outcome. Run existing story-test/resources/preview/offline checks; review screenshots and diff, update handoff, publish all three branches and verify Pages/public main+test entries.
