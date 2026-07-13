# Mistakery — Start Here

This folder is the canonical Mistakery project.

Open `index.html` directly in a browser to play. No terminal or local server is required.

## Source of truth

1. `cards.json` — canonical English deck, rules data, resources, flags and endings.
2. `game.js` — scheduler and resolution logic.
3. `docs/core/STATE_BIBLE.md` — facts of the world and sales vocabulary. If copy contradicts it, the copy is wrong.
4. `docs/core/CHARACTER_BIBLE.md` — canonical character motives, behavior under pressure and individual voices. It is derived from the author's Validation character PDF preserved in `docs/source/`.
5. `docs/core/TOV_BIBLE.md` — global message, humor and writing constraints.
6. `docs/core/REJECTED_PATTERNS.md` — known failures that must not quietly return.

`cards.bundle.js` and `MISTAKERY_CARDS_EN_RU.md` are generated views of `cards.json`; do not edit them as the primary source.

## Read only what the task needs

| Task | Read first |
| --- | --- |
| Rewrite or create a character message or choice | State Bible, Character Bible, TOV Bible, Rejected Patterns, then every current card from that sender |
| Fix story logic or resources | State Bible, Reigns Rubric, `cards.json`, `game.js` |
| Change scheduling, callbacks or pressure | Reigns Research, Reigns Rubric, `game.js`, `cards.json` |
| Verify Reigns-like design | Reigns Rubric, then run the project skill analyzer |
| Check a translation | `MISTAKERY_CARDS_EN_RU.md` after checking `cards.json` |
| Investigate why a Reigns rule exists | Reigns Research |

## Design documents

- `docs/core/` — active game truth and language rules.
- `docs/design/` — the audit rubric.
- `docs/research/` — sources and rationale behind the rubric.
- `docs/source/` — preserved author source files. `MISTAKERY_VALIDATION_CHARACTERS_SOURCE.pdf` is the source behind Character Bible and must not be silently dropped from future rewrites.

The documents are intentionally separate. Do not merge them into one large brief and do not treat the research document as current game data.

## Project skill

`.agents/skills/reigns-like-narrative-design/` contains the project-local workflow for audits and Reigns-like narrative work. It routes future agents to only the documents needed for the request and includes a non-mutating `cards.json` analyzer.

## Current test status

The current runtime is a full-run direction-review build. After the approved onboarding, `Build for enterprise` enters Agents and `Hunt a whale` enters ClosedAI Padel; both arcs can reach their complete paid and unpaid endings. Treat the existing scheduler as a vertical-slice implementation under review, not as an approved final architecture, and do not rewrite card copy until the full-run Direction Review is resolved.
