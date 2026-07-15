# Mistakery Messenger Writer — Full Character Calibration Checkpoint

Status: **NOT READY for Package A**. Full-cast calibration is present, but the manual audition result is **PASS 13 / WEAK 2 / FAIL 0**, and the author has not approved the results. This supersedes the earlier premature readiness statement.

This checkpoint does not approve or modify production copy. `cards.json`, `game.js`, UI, scheduler, production cards, generated bundles, and game mechanics are outside this work.

## Scope completed

- Read the full current canon: Start Here, State Bible, Character Bible, TOV Bible, Rejected Patterns, the 15-page PDF with examples, current skill, taste memory, and every existing sender card in `cards.json`.
- Confirmed the current `cards.json` cast contains 15 source keys.
- Added a behavioral voice engine for every source.
- Added exactly three audition-only messages per source: 45 total.
- Recorded a distinct emotional state and pressure tactic for every message.
- Added a nearest-neighbor swap test and honest status for every character.
- Preserved Writer/Editor separation.
- Added an automated full-cast coverage contract before implementation.
- Manually reviewed all 45 messages after the structural tests.

## Cast resolution

The expected 15-role outline matches the current source count, with naming details resolved from Character Bible and `cards.json`:

- `Freeloader @user[number]` is the Character Bible collective archetype; the current visible deck identity is **Free User @user481516**, with source key `@user[number]`.
- The three corporate sources are **Customer @head_of_agile**, **ClosedAI CEO @iclosedai**, and **German Factory @wmwerke**.
- `@wmwerke` has no current production card, so its audition uses archive situations explicitly marked audition-only from Character Bible/PDF territory.

## New RED evidence

### Baseline without the voice engine

An independent drafting run was told not to read the project skill and received fact-locked situations for Marketer, Sales, and Designer under time pressure. It produced structurally clean but generic professional copy:

- Marketer relied on `momentum`, `lift`, and `attention`, then declared itself recognizable as a promotional voice.
- Sales relied on `pipeline`, `touches`, `persistence`, and `professional pressure`, with no charm, guilt, victim, or personal upside.
- Designer balanced typography against budget like a reasonable design manager, without hierarchy or intellectual venom.

This reproduces the failure the voice engines must prevent: surface-safe job language that looks distinct only while role labels remain visible.

### Automated RED

The new contract test was added before the artifacts. Its first run failed for the expected missing behavior:

```text
AssertionError: required full-cast artifact is missing:
.agents/skills/mistakery-messenger-writer/references/character-voice-engines.md
```

The test checks only mechanically provable requirements: 15/15 engines, 15/15 audition sections, exactly three messages per character, three distinct states and tactics, required engine fields, swap tests, and Writer's mandatory voice-engine read. It does not claim to measure humor or human voice.

## Implementation

### Voice engine reference

Created `.agents/skills/mistakery-messenger-writer/references/character-voice-engines.md` with, for every current source:

- want from founder;
- relationship to founder and team;
- 4–6 pressure modes;
- 4–6 emotional states;
- length and rhythm range;
- language territory;
- permissions for slang, profanity, emoji, mistakes, and punctuation;
- identity beyond surface markers;
- nearest neighbor and core distinction;
- anti-voice, including the new baseline failures.

The entries are behavior ranges, not ready-made sentences, catchphrases, question templates, or fixed structures.

### Full audition

Created `MISTAKERY_MESSENGER_WRITER_FULL_CHARACTER_AUDITION.md` with 45 audition-only messages. Each section keeps the full current identity visible, identifies the canonical source situation, uses three different state/tactic combinations, and includes a swap test.

### Writer and Editor

`SKILL.md` still requires Writer to create vivid candidates before editorial checks. Writer does not optimize checker findings. Editor still begins after creative selection, cannot rewrite, and cannot choose finalists.

The new routing is:

1. Writer reads the current sender's voice engine and current deck.
2. Writer chooses a situation-appropriate emotional state and pressure mode.
3. Different cards vary those combinations.
4. Editor alone reads the PDF section after creative selection to check broad authorial range.
5. The PDF never supplies wording, syntax, construction, event, brand, company, mechanic, or reusable shape.

`project-reading-map.md` and the authorial-calibration contract were updated to match this routing.

### GREEN behavior retest

The same independent Writer repeated the three baseline situations after reading the updated skill and relevant voice engines:

- Marketer moved from neutral `momentum/lift` language to public visibility, imagined audience judgment, embarrassment, and the cost of letting a moment die politely.
- Sales moved from CRM vocabulary to flattery, clean-hands risk transfer, guilt, and management blame without inventing an open or reply.
- Designer moved from balanced budget commentary to controlled aesthetic hierarchy and withdrawal of endorsement, while remaining grammatical and distinct from Dev.

The retest still identified one Marketer urgency variant and one Designer verdict as the closest to generic. That is useful human review evidence, not an automatic failure; the full audition was assessed independently below.

## Honest result

| Status | Count | Characters |
| --- | ---: | --- |
| PASS | 13 | AI Assistant, Cofounder, Marketer, Sales, Dev, Designer, Investor, Ex-Boss, College Rival, Mom, Padel Coach, Customer, ClosedAI CEO |
| WEAK | 2 | German Factory, Free User |
| FAIL | 0 | — |

### Remaining weak voices

- **German Factory @wmwerke:** exact process and secrecy are distinct, but there is no live card to validate range; without counts/contract context it approaches Ex-Boss.
- **Free User @user481516:** entitlement is visible, but the collective archetype has deliberately variable register and only one current family-mode card, so three messages do not yet prove stable range across situations.

## Manual cross-voice review

- Marketer uses current internet language, several slang territories, public timing, and social embarrassment; it is not just lowercase plus `💀`.
- Sales and Cofounder separate through deal leverage/commission versus shared belief/momentum.
- Investor, Padel Coach, and ClosedAI CEO separate through cheque ownership, opponent-specific court tactics, and quiet institutional inevitability.
- Ex-Boss uses personal history and reply traps; German Factory uses vendor process and secrecy, though the latter remains weak.
- Designer protects aesthetic hierarchy in composed sentences; Dev exposes labor and failure in tired plain language.
- The 45-message set does not default to three short lines with a punchline.

## Verification

Fresh final verification on 2026-07-13:

```text
full character voice coverage: pass (15 characters, 45 audition messages)
writer-editor separation contract: pass
authorial-calibration skill contract: pass
messenger checker tests: pass
```

Full project suite:

```text
tests 82
pass 82
fail 0
```

Additional mechanical review:

- every three-message character set varies length by at least six words and uses at least two explicit line rhythms;
- the full audition contains zero six-token overlaps with the PDF examples or current `cards.json` messages;
- automatic checks confirm structure and coverage only; the PASS/WEAK decisions come from the manual cross-voice review.

## Package A readiness

Not ready. A `WEAK` remains sufficient to block readiness, and author approval is still required even if both weak voices are later revised to `PASS`.

Stop point: this checkpoint is the requested handoff boundary.
