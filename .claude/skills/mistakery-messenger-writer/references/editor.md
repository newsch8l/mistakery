# Editor

Editor begins only after creative selection, on Writer's 2–3 candidates plus the fact lock and approved mechanics. It is a final gate, not a co-writer.

Editor does not rewrite candidates and does not choose finalists. It may reject a candidate and state the reason; Writer then creates a fresh replacement rather than editing toward a checker score.

Editor must not mask a weak situation with smooth English. If the action remains abstract after factual review, reject the situation and return it for simplification.

Editor must not smooth slang, anger, mistakes, abruptness, profanity, or uneven rhythm merely to make the English more polished. Reject only for a named fact, clarity, UI, repetition, or character contradiction. A cleaner version is not automatically a better version.

## Checks

- New facts, events, knowledge, entities, or claims beyond the fact lock.
- Both buttons understandable, mechanically allowed, prepared by the message, and about the same relevant object.
- Four estimated visual lines, clear English, no real brands or companies.
- Direct copying from the PDF, the public corpus, or the current deck.
- Whether the candidate sits inside the PDF's broad authorial range without borrowing its syntax, wording, event, or example shape. Editor reads the sender's PDF section here, as a range check only.
- An explicit repeated line, opening, cadence, or button pattern already used by the deck.
- Character Bible or TOV contradiction: Designer lowercase, a technical Dev riddle, a knowingly sarcastic Bot, invented Marketer publicity, invented Sales evidence.

## Checker

Run it only at this stage:

```bash
node .claude/skills/mistakery-messenger-writer/scripts/check-messenger-copy.cjs --input /path/to/audition.json
```

Treat findings as questions, not automatic rewrites. The checker does not rewrite and does not choose finalists. It flags formal risks but cannot prove fact truth or authorial force — do the fact-lock and authorial checks by hand. A zero share of questions or `or` is neutral, not an achievement.

## Final pass

- The situation is understandable without startup knowledge.
- The sender is identifiable without surface markers, and passes the three authorial-voice questions against the current voice engine.
- The card adds no brand, named entity, premature user or customer, or technical mystery.
- The two buttons execute different outcomes; message and buttons refer to the same relevant object, and both choices answer the situation.
- Every literal event comes from the fact lock; new language is only opinion, metaphor, or insult.
- The chosen cadence is not already doing the work of the joke elsewhere in the deck.
- No semicolon in the message, and any profanity is earned by the emotional state rather than added for energy.
- The five-draft set is not dominated by one line-count/final-type pairing, questions, `or`, the same ending command, or repeated button verbs; its plain work-chat option is characterful rather than deliberately bland.
- **Human check:** "Would a person send this in a work chat, or did a copywriter compose it for a card game?" Reject the latter even when it is clever.

If the checker is quiet but the message still feels like a copywriter explaining a game, reject it.
