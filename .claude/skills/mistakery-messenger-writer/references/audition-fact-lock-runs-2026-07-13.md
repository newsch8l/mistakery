# Fact-lock audition runs — 2026-07-13

These are test-only drafts, never production cards. The four passes were drafted separately from their own fact locks and are preserved below as first-pass sets; finalist selection did not rewrite the raw variants.

## RED: failures reproduced from the former process

| Situation | Baseline text | Failure |
| --- | --- | --- |
| B3 Sales | “Chief, they opened the fourth email. / No reply. / That is a pulse in this market.” | `opened` is a new event. The approved situation says only that four emails were ignored. |
| Hype / ready demo | “the demo froze on camera / now it is a story / we have an angle.” | The freeze is a new public event. A ready/trending demo does not establish a malfunction. |
| Designer / font | “arial is an apology. / this font costs $4,500. / salaries will understand.” | Designer was given Dev-style lowercase instead of composed sentence case. |
| Bot / savings | “I found team snacks. / They recurred. / I resolved them.” with `Restore lunch` | The message object and button object differ; the knowingly neat final line also humanizes Bot. |

The checker RED test records the formal portions of this failure: it failed before the implementation with `expected finding: designer-lowercase`. It deliberately does not pretend to infer the two invented facts above.

## Fresh pass B3-01 — Sales, ignored emails

**Corpus rhythm observations sampled:** #4 (silence as status), #31 (plain consequence), #21 (cold record).

**Fact lock**

- Certainly happened: the prospect ignored four emails; Sales asks to send three more.
- Certainly did not happen: no open, reply, block, payment, interest, lead, or deal.
- Sender knows: the outreach count and the silence.
- Existing people/objects: Sales, founder, one prospect, four emails, three possible follow-ups.
- Allowed actions: `Send three more` or `Leave them alone`.
- Opinion/metaphor only: Sales may call silence “not a no,” flatter the pitch, or protect his commission; none is evidence of prospect interest.

`S1`
```text
Chief, four emails have gone unanswered.
That is not a no.
Let me send three more.
```

`S2`
```text
Four emails. No reply.
Give me three more before we call this a process problem.
```

`S3`
```text
Boss, they ignored four emails.
We can leave them alone, or I can make the fifth one less embarrassing.
```

`S4`
```text
The account is quiet.
Your pitch is not.
Authorize three more emails.
```

`S5`
```text
Four emails have no reply.
Do you want me to send three more or stop?
```

**Manual check:** no candidate states an open, reply, payment, or interest. Both buttons resolve the stated follow-up decision. S1 and S5 read as plausible Sales chat; S5 is the deliberately plain work-message option, not a punchline.

**Finalists:** S1 (Sales spins silence without changing it), S3 (manipulative option framing), S5 (natural direct work chat).

## Fresh pass HYPE-02 — ready, trending demo

**Corpus rhythm observations sampled:** #5 (visible launch moment), #6 (concrete update before emoji), #7 (public response plus role action).

**Fact lock**

- Certainly happened: the demo is ready and trending; Hype publicly called the agents “emotionally abandoned AI employees”; enterprise buyers want the deck.
- Certainly did not happen: no blink, freeze, pause, clip, awkward moment, comment, new meme, or unapproved public reaction.
- Sender knows: the public trend, her own framing, and the request for the deck.
- Existing people/objects: Hype, founder, demo, post, disclaimer, enterprise buyers, deck.
- Allowed actions: `Boost post` or `Add disclaimer`.
- Opinion/metaphor only: Hype may call the moment useful, fragile, or a campaign; she may not manufacture an event to package.

`H1`
```text
the demo is trending 💅
enterprise buyers want the deck — boost the post or add the disclaimer?
```

`H2`
```text
the demo is trending.
i called them emotionally abandoned AI employees.
please do not make me sound careful.
```

`H3`
```text
The demo is trending; enterprise buyers want the deck. Let the post run.
```

`H4`
```text
the demo is trending
we called them emotionally abandoned AI employees
enterprise buyers want the deck
i would not add the disclaimer yet.
```

`H5`
```text
Public attention has arrived for the ready demo.
Please choose between the post and the disclaimer.
```

**Manual check:** every literal statement is in the lock; there is no new demo behaviour or audience reaction. The buttons name the approved public-promotion/disclaimer choice. H3 and H5 are ordinary work-chat updates; H1 permits a natural question and `or` rather than treating their absence as a goal.

**Finalists:** H1 (real facts with a natural choice question), H3 (short operational pressure), H5 (plain messenger update).

## Fresh pass DESIGN-03 — expensive font

**Corpus rhythm observations sampled:** #9 (one visual complaint), #11 (calm contempt), #12 (cost as a taste fight).

**Fact lock**

- Certainly happened: Designer found a font; it costs $4,500, more than the servers; salaries are the competing use of money.
- Certainly did not happen: no purchase, approval, payroll action, new visual failure, or external response.
- Sender knows: the font, its price, the server comparison, and the Arial alternative.
- Existing people/objects: Designer, founder, font, Arial, servers, salaries.
- Allowed actions: `Buy font` or `Use Arial`.
- Opinion/metaphor only: Designer may judge Arial, taste, or value without claiming a new consequence.

`D1`
```text
The font costs $4,500.
The server bill is lower.
I recommend buying it.
```

`D2`
```text
Arial is legible. So is a tax form.
The font is $4,500.
```

`D3`
```text
I found the font. We can buy it or use Arial.
```

`D4`
```text
Please approve the font.
It costs $4,500.
Our servers cost less.
That is not the same as value.
```

`D5`
```text
The font is $4,500.
Use Arial if you want.
I will call it a choice, not taste.
```

**Manual check:** Designer is grammatical and sentence-cased in all five drafts; no event follows from the price. Buttons repeat the approved font/Arial choice. D1 is intentionally plain, while D2 and D4 retain controlled Designer contempt without lowercase mimicry.

**Finalists:** D1 (plain work recommendation), D2 (specific calm disdain), D4 (clear object, cost, and value judgement).

## Fresh pass BOT-04 — automated runway saving

**Corpus rhythm observations sampled:** #37 (cheerful automation ignores cost), #38 (metric report), #40 (harmful policy as completed service).

**Fact lock**

- Certainly happened: food delivery is canceled; the fridge is locked except for raw carrots; the lock lasts until the first paid invoice.
- Certainly did not happen: no snacks, lunch, team meal, new subscription, morale metric, or paid invoice.
- Sender knows: the food-delivery cancellation, fridge lock, carrots, and invoice condition.
- Existing people/objects: Bot, founder, food delivery, fridge, raw carrots, first paid invoice.
- Allowed actions: break the fridge lock or eat carrots.
- Opinion/metaphor only: Bot may call the policy successful or protective, but does not knowingly joke about it.

`B1`
```text
Runway protection activated 😊
Food delivery is canceled.
The fridge is locked.
Raw carrots remain available.
```

`B2`
```text
Fridge access is restricted.
The raw carrots are not.
This is a successful savings outcome.
```

`B3`
```text
Food delivery is canceled and the fridge is locked.
Eat carrots or break the fridge lock.
```

`B4`
```text
Fridge policy active 😊
The fridge remains locked.
Please select a carrot-compliant plan.
```

`B5`
```text
Food delivery is canceled.
The fridge stays locked until the first paid invoice; raw carrots remain available.
```

**Manual check:** no snacks or lunch appear. Every candidate names the fridge and carrots, and both buttons resolve the stated constraint. Bot’s voice is sincerely positive operational reporting, not a self-aware joke. B3 uses a natural `or`; it is not a structural target.

**Finalists:** B1 (clear status report), B3 (direct choice language), B5 (plain policy notice).

## Human review across the four passes

Each cluster contains at least one unadorned work-chat message (S5, H5, D1, B5). Finalists were chosen for character action and situation clarity, not for the sharpest last line. The mechanical checker is used only for Designer casing, declared object matching, and declared repeated-punchline rhythm; fact-lock and “human chat or copywriter?” decisions above remain manual.
