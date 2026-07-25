# Mistakery

Browser card game about a startup chasing its first paying customer. Open `index.html` directly — no build step, no server.

## Gotchas

- `cards.json` is the only card source. `cards.bundle.js` and `MISTAKERY_CARDS_EN_RU.md` are generated from it by `scripts/build-offline-deck.cjs` and `scripts/build-card-catalog.cjs`. Editing them by hand desyncs the game and fails `tests/offline.test.cjs`.
- `docs/core/STATE_BIBLE.md` outranks everything else on world facts, funnel stage and what exists yet. If copy contradicts it, the copy is wrong. Character motive and voice come from `docs/core/CHARACTER_BIBLE.md`, itself derived from the author's PDF in `docs/source/` — that PDF must survive any rewrite.
- `ME` is run quality, not a fourth resource. Internal work never raises Customers; Cash rises only through payment, funding or explicit savings.
- Card copy reaches `cards.json` only after the author approves it line by line. Drafts and auditions stay out of production files.
- Root `MISTAKERY_*.md` files are dated checkpoints. Any status they state is history, not current state — the newest file in `docs/plans/` wins.
- Tests are `node --test` from the repo root. The deck analyzers (`audit-deck.cjs`, `audit-callback-slots.cjs`) are non-mutating and safe to run before judging anything.

## Current work

`docs/plans/` holds the plans; the newest date is the live one. As of 24 July 2026 that is `docs/plans/2026-07-22-month-plan-itch-prototype.md` — the month plan toward an itch demo on 2 September 2026. Start a session there.

## Skills

`.claude/skills/` holds three project skills (`.agents/skills` is a symlink to the same directory for Codex):

- `reigns-like-narrative-design` — deck, arcs, resources, structural audits
- `mistakery-reigns-scheduler` — callbacks, forced pairs, delays, slot policy
- `mistakery-messenger-writer` — drafting and editing card copy

Each skill routes to the documents its task actually needs. Load them when the task matches rather than reading the design bibles up front.
