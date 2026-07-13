---
name: reigns-like-narrative-design
description: Use when auditing, designing, rewriting, or implementing a Reigns-like narrative card game; when binary choices, resource balance, adaptive card selection, callbacks, pressure cards, story arcs, or narrative deck logic need review.
---

# Reigns Like Narrative Design

## Overview

Treat a Reigns-like game as a state-driven narrative system, not as a pile of short jokes with two buttons. Preserve player comprehension, meaningful choices and causal callbacks before polishing copy.

## Start with the correct project context

Read `MISTAKERY_START_HERE.md` first. Then load only the documents required by the task:

| Task | Required context |
| --- | --- |
| Rewrite or create a character message or choice | `docs/core/STATE_BIBLE.md`, `docs/core/CHARACTER_BIBLE.md`, `docs/core/TOV_BIBLE.md`, `docs/core/REJECTED_PATTERNS.md`, then every current card from that sender |
| Design a new situation driven by an existing character | State Bible, Character Bible, TOV Bible, Rejected Patterns, relevant current cards |
| Change narrative logic, resources, arcs or endings | State Bible, `docs/design/REIGNS_RUBRIC.md`, `cards.json`, `game.js` |
| Change scheduler, callbacks or pressure | `docs/research/REIGNS_RESEARCH.md`, Reigns Rubric, `cards.json`, `game.js` |
| Explain a Reigns principle | Reigns Research |
| Verify a deck change | `scripts/audit-deck.cjs`, Reigns Rubric, relevant tests |

Do not load the full research for a single copy edit. Do not rewrite cards until the relevant state and causal chain are understood.

## Mandatory character source

`docs/core/CHARACTER_BIBLE.md` is required for every task that generates, rewrites, audits or assigns an action to a named character. It is the canonical usable form of the author's source PDF preserved at `docs/source/MISTAKERY_VALIDATION_CHARACTERS_SOURCE.pdf`.

Do not substitute a checkpoint summary, job title, current card sample or remembered voice for reading Character Bible. Character motivation must survive removal of lowercase, caps, emoji and slang. State Bible still overrides character sources on world facts, stage and entity eligibility.

## Workflow

1. Establish the current **declared test scope** from `MISTAKERY_START_HERE.md`, `cards.json`, `game.js` and tests. Never treat an intentionally isolated onboarding test as evidence about the final production architecture.
2. Run `node .agents/skills/reigns-like-narrative-design/scripts/audit-deck.cjs cards.json --json` before judging copy or changing structure.
3. Audit semantics before style: entity existence, funnel stage, sender knowledge, sender motive and causal link from the previous event.
4. Audit character fidelity against Character Bible: personal desire, pressure behavior, knowledge, victim and why another character would not take the same action.
5. Audit the two answers: distinct actions, legible risk, persistent difference and resource reasons.
6. Audit scheduler behavior: eligible pool, weights, recency, forced causal pairs, callbacks and ambient cards.
7. Score findings with `docs/design/REIGNS_RUBRIC.md`; label each as FAIL, WARNING or PASS and cite the card ID.
8. Present the proposed structural change and wait for approval before rewriting a full arc or modifying game data.
9. After an approved implementation, run the analyzer, automated tests and a manual narrative playthrough.

## Non-negotiable checks

- A card must not contradict the State Bible or introduce an entity before an event creates it.
- A sender must have a reason to write now and a reason to know the information.
- A named character must act from Character Bible, not from a generic job description or surface formatting marker.
- A short card must still make the situation and the requested action clear.
- Two labels that converge immediately are acceptable only when they create a persistent difference that later cards read.
- A choice must not be erased by a routine `too late` reversal.
- Internal work does not increase Customers; Cash rises only through payment, funding or explicit savings.
- Active arcs must affect eligibility or weights; a flag that only points to the next forced card is not meaningful global state.
- Ambient pressure must be eligible in the current world and must not interrupt an immediate causal pair.
- Hidden numerical direction is allowed only when the textual consequence remains reasonably inferable.

## Analyzer

`scripts/audit-deck.cjs` is non-mutating. It reports structural errors and warnings; it does not judge humor, natural English or story comprehension.

Run it with:

```bash
node .agents/skills/reigns-like-narrative-design/scripts/audit-deck.cjs cards.json --json
```

Treat its report as a starting point. Use the rubric and a human playthrough for semantic failures.

## Output format

For an audit, return:

1. Production snapshot: what actually runs now.
2. Top findings: card IDs, severity and evidence.
3. Player-understanding risks.
4. Scheduler and replayability risks.
5. Smallest safe next change.
6. Tests or playthrough needed to verify it.

For a rewrite proposal, return the causal map and expected resource consequences before final English copy.

## Common failure modes

- Treating Reigns as only two buttons and four bars.
- Making every arc a fixed queue with random comedy interruptions.
- Using `our users` before users exist.
- Turning a resource into an unexplained plot-progress score.
- Calling an answer meaningful because its number changes, even though no future state reads the difference.
- Replacing a causal beat with a pressure card because a slot is available.
- Optimising a line's English before confirming what the line factually means.

### assets/
Files not intended to be loaded into context, but rather used within the output Codex produces.

**Examples from other skills:**
- Brand styling: PowerPoint template files (.pptx), logo files
- Frontend builder: HTML/React boilerplate project directories
- Typography: Font files (.ttf, .woff2)

**Appropriate for:** Templates, boilerplate code, document templates, images, icons, fonts, or any files meant to be copied or used in the final output.

---

**Not every skill requires all three types of resources.**
