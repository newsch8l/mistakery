# Mistakery

Browser card game about a startup chasing its first paying customer. Open `index.html` directly — no build step, no server.

## Gotchas

- `cards.json` is the only card source. `cards.bundle.js` and `MISTAKERY_CARDS_EN_RU.md` are generated from it by `scripts/build-offline-deck.cjs` and `scripts/build-card-catalog.cjs`. Editing them by hand desyncs the game and fails `tests/offline.test.cjs`.
- `docs/core/STATE_BIBLE.md` outranks everything else on world facts, funnel stage and what exists yet. If copy contradicts it, the copy is wrong. Character motive and voice come from `docs/core/CHARACTER_BIBLE.md`, itself derived from the author's PDF in `docs/source/` — that PDF must survive any rewrite.
- `ME` is run quality, not a fourth resource. Internal work never raises Customers; Cash rises only through payment, funding or explicit savings.
- Card copy reaches `cards.json` only after the author approves it line by line. Drafts and auditions stay out of production files.
- `PROJECT_STATUS.md` is the current continuation snapshot. Root audition documents and `docs/archive/` preserve approved copy and project history; they are not current status reports.
- The focused runtime checks are `node --test tests/offline.test.cjs tests/personal-chat-runtime.test.cjs tests/live-agent.test.cjs`. Older tests cover superseded deck and scheduler behavior, so a blanket `node --test tests/*.test.cjs` is not a release gate. The deck analyzers (`audit-deck.cjs`, `audit-callback-slots.cjs`) are non-mutating.

## Current work

Start with `PROJECT_STATUS.md`, then read only the plan relevant to the requested change. The current playable routes are the opening, Live AI Agent, AI Influencer, and Padel. GitHub Pages serves `lean-opening` from the repository root. Do not use the July itch demo plan as the current roadmap.

## Skills

`.claude/skills/` holds three project skills (`.agents/skills` is a symlink to the same directory for Codex):

- `reigns-like-narrative-design` — deck, arcs, resources, structural audits
- `mistakery-reigns-scheduler` — callbacks, forced pairs, delays, slot policy
- `mistakery-messenger-writer` — drafting and editing card copy

Each skill routes to the documents its task actually needs. Load them when the task matches rather than reading the design bibles up front.
