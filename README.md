# Mistakery

Browser-based startup survival game about finding B2BuyerSpyer's first paying customer.

- [Play the game](https://newsch8l.github.io/mistakery/) — starts from the beginning.
- [Test the Live AI Agent story](https://newsch8l.github.io/mistakery/?story=live-agent) — opens the story directly with Back and Restart controls.

Both links use the same cards, images and game runtime.

Open `index.html` directly in a browser. No terminal or local server is required.

For the current project state, start with [PROJECT_STATUS.md](PROJECT_STATUS.md). [CLAUDE.md](CLAUDE.md) covers the project map and source-of-truth order. Design documents live in `docs/core/`, implementation plans in `docs/plans/`, and historical checkpoints in `docs/archive/`.

- `cards.json` is the canonical English deck and gameplay data.
- `cards.bundle.js` is the generated offline copy used by `index.html`.
- `MISTAKERY_CARDS_EN_RU.md` contains the synchronized English/Russian card catalog.

After changing the deck, regenerate its offline copy with `node scripts/build-offline-deck.cjs`; after changing card copy or translations, also run `node scripts/build-card-catalog.cjs`.

Run the focused runtime checks with `node --test tests/offline.test.cjs tests/personal-chat-runtime.test.cjs tests/live-agent.test.cjs`. The full historical suite still includes tests for superseded routes and scheduler behavior; do not treat it as the current release gate.
