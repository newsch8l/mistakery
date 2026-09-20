# Influencer resource effects

**Goal:** Apply the source document's decision and outcome resources without changing approved story presentation or probabilities.

**Source:** https://docs.google.com/document/d/1oGlgbtUK7Ayrq8sx4O9HCHPtVhOJ-_wJJ0xjH5wgjcc/edit . Read the complete native document (one tab) through Google Drive on 2026-09-20.

**Architecture:** Keep values in `cards.json`; in `app.js` resolve the actual contextual choice and selected outcome together through one engine history entry. Clamp resources using the existing engine, with crises, passive burn and turn-cap endings disabled for this branch. Preserve Padel and Live Agent behavior.

**Tech stack:** Vanilla JavaScript, canonical JSON, Node test runner, Playwright Chromium.

1. Add independent document-value fixtures and failing resource tests. Cover every decision/context, all seven outcomes, one-shot history, both decorative replies, zero/100 boundaries, hover/focus without state or RNG changes, exact 40/60 boundaries and Back.
2. Add canonical effects and editorial reasons. User confirmed the total refusal penalty is Cash −25 / Founder −5: Cash belongs to the choice; outcome 1 adds only Founder −5.
3. Resolve contextual choices and roll once before applying effects; preview both possible outcomes without rolling. Keep all copy, media, routes and presentation unchanged.
4. Update existing expectations that Influencer effects are empty. Extend catalog output to include Influencer outcome entry effects. Rebuild with `node scripts/build-offline-deck.cjs` and `node scripts/build-card-catalog.cjs`.
5. Run focused unit/browser regressions including Padel, Live Agent previews and outcome presentation; review diff and update `PROJECT_STATUS.md`. Commit, atomic push to all three approved branches, verify Pages build and both public URLs plus controlled Influencer playthrough.
