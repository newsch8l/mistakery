---
name: mistakery-messenger-writer
description: Use when drafting or auditioning English Mistakery messenger-card copy from an already approved situation, especially when the card risks generic startup jargon, repeated chat rhythms, technical overload, or an unrecognizable character voice.
---

# Mistakery Messenger Writer

Write behaviour, not a professional persona. A sender is recognizable through what they did, want, risk, and demand from the founder; casing, emoji, slang, and terminal garnish only reinforce that.

## Guardrail

Use this skill only after the situation, mechanics, sender, and two consequences are approved. Do not invent plot, change `cards.json`, edit the UI, or treat audition copy as approved production copy.

If the situation cannot be explained without abstract technical language or an authorial formulation of its theme, stop the copy pass and return the situation for simplification. Prose must not compensate for an action ordinary players cannot picture.

## Source priority

1. **State Bible** (`docs/core/STATE_BIBLE.md`) — facts of the world, stage, eligibility, sender knowledge, mechanics. Wins every fact conflict.
2. **Character Bible and TOV Bible** (`docs/core/CHARACTER_BIBLE.md`, `docs/core/TOV_BIBLE.md`) — current character, readable voice, anti-voice. Win current-character conflicts.
3. **Voice engine** — [character-voice-engines.md](references/character-voice-engines.md): the sender's behavioral range, pressure modes, emotional states, nearest neighbor, anti-voice. Expands the bibles without overriding them.
4. **Current deck** — every existing card from this sender in `cards.json`, plus adjacent story cards, so the new card does not repeat one.

`docs/core/REJECTED_PATTERNS.md` is the scope guard: read it before drafting.

**Calibration sources** set a quality floor, never a template. Do not copy their wording, phrases, syntax, line structure, joke construction, or profanity placement:

- `MISTAKERY_MESSENGER_WRITER_FULL_CHARACTER_AUDITION.md` — author-approved liveliness, emotional force, messenger messiness, character distance.
- `MISTAKERY_STAGE_2B_PACKAGE_A_COPY_AUDITION.md` — Package A calibration: an author-approved clarity and liveliness level whose cards must never donate phrases, syntax, line structure, or joke construction to new work.
- `docs/source/MISTAKERY_VALIDATION_CHARACTERS_WITH_EXAMPLES.pdf` — **Editor's** range check only, after creative selection. PDF examples are not production copy, and never Writer's construction source; the PDF donates no wording, syntax, events, brands, companies, or mechanics.
- [taste-memory.md](references/taste-memory.md), [public-messenger-corpus.md](references/public-messenger-corpus.md), [project-reading-map.md](references/project-reading-map.md) — rhythm observation and routing only.

## Pipeline

1. **Writer** drafts five vivid candidates, then selects the best 2–3 on voice, situation and force. See [writer.md](references/writer.md).
2. **Creative selection happens before any editorial scoring.** Writer does not modify production files.
3. **Editor** gates the survivors on fact, clarity, UI, repetition and character contradiction, and only there runs the checker. See [editor.md](references/editor.md).
4. Present the surviving 2–3 with fact-lock support, button-consistency note, PDF range calibration and any remaining authorial risk. Do not write them to production.

## Feedback becomes memory deliberately

On an explicit approval or rejection, update [taste-memory.md](references/taste-memory.md). First classify the comment:

| Scope | Persist it when it means |
| --- | --- |
| Global | A rule of clarity, rhythm, ethics, or deck repetition |
| Character | A sender-specific motive, pressure, or voice constraint |
| Story | A fact or causal rule for one module/arc |
| One-off | A local choice for one card only |

Record the decision, why it worked or failed, scope, and technique used. An example is evidence of taste, not a template: never copy its syntax into a new card. Do not convert one-off feedback into a permanent ban.
