---
name: mistakery-reigns-scheduler
description: Use when changing or reviewing Mistakery's card scheduler, delayed callbacks, forced pairs, reactions, variable-card budget, active arcs, or Reigns-like replayability.
---

# Mistakery Reigns Scheduler

Treat a delayed story as a reservation with a named destination, not as a flag plus a hopeful timer. A seed is valid only when its callback, delay, and later reader of the resolved state are all demonstrably valid.

## Required context

Read `docs/archive/MISTAKERY_STAGE_2B_ADAPTIVE_POOL_BLUEPRINT.md`, `docs/design/REIGNS_RUBRIC.md`, `docs/research/REIGNS_RESEARCH.md`, `cards.json`, `game.js`, and relevant tests. Then run:

```bash
node .claude/skills/reigns-like-narrative-design/scripts/audit-deck.cjs cards.json --json
node .claude/skills/mistakery-reigns-scheduler/scripts/audit-callback-slots.cjs cards.json --json
```

`references/mistakery-slot-policy.json` defines protected pairs and locks. Change it only as an explicit, reviewed narrative-structure decision.

## Workflow

1. Map every main route, including crisis, rescue, and refusal branches.
2. Label each link forced, conditional, weighted, reaction, callback, or selection slot.
3. For every module, prove the seed eligibility, exclusive lock, exact spine delay, callback slot, terminal horizon, crisis rule, and later state reader.
4. Reject a module that fits only by firing immediately or splitting a protected pair.
5. Run deterministic and 10,000-run simulation checks after a scheduler change.

Example: a callback after `AGENT_05_ORDER` is not valid merely because that card is weighted; if it must appear before `AGENT_06_LEGAL`, it splits a protected pair and must be moved or rejected.

## Non-negotiable rules

- One open narrative thread at a time; callback priority applies only to a named legal slot.
- A rescue preserves the episode; a failure takes the ending path.
- Reactions do not consume a delayed-callback slot.
- No variable card after `PADEL_01` starts its forced lock.
- `ME` is run quality, not a normal fourth resource; cash and customers retain their defined semantics.
- Every persistent state needs a later, observable consumer.
- Do not alter card copy, the UI, or unrelated game logic while auditing scheduler capacity.

## Common mistakes

| Shortcut | Why it fails |
| --- | --- |
| Shorten a two-spine delay to one decision | It hides a structural capacity problem instead of solving it. |
| Treat early onboarding as a generic safe lane | It still needs an eligible seed, a legal callback, and a later reader. |
| Treat a weighted Padel card as a pool slot | The Padel lock forbids variable insertion after `PADEL_01`. |

## Report format

State the production behavior, the exact seed and callback location, state read/write timing, protected-pair or lock effects, balance impact, tests run, and any required engine contract change. Do not invent a working schedule just because a timer eventually fires.
