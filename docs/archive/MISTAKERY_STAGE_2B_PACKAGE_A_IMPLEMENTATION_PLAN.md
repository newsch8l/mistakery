# Mistakery — Stage 2B Package A: Implementation Plan

**Status (13 July 2026):** implemented in the canonical production project and stopped at the technical checkpoint documented in `MISTAKERY_STAGE_2B_PACKAGE_A_PRODUCTION_CHECKPOINT.md`.

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Add the approved ten Package A cards only after the route-aware slot graph, named callback reservations, exact eligibility, and observable state readers are implemented and tested.

**Architecture:** Option 2 is fixed. This document is the technical source of truth for Package A slots, eligibility, resource thresholds, effects, readers, tests, and count gates. `MISTAKERY_STAGE_2B_ADAPTIVE_POOL_BLUEPRINT.md` remains the source of truth for composition and creative causality.

**Copy checkpoint:** the ten Package A texts are author-approved in `MISTAKERY_STAGE_2B_PACKAGE_A_COPY_AUDITION.md` and integrated without edits.

**Historical plan note:** game code, production data and generated files were out of scope when this implementation plan was approved; that production work is now complete. Existing B3 text remained unchanged.

---

## 1. Fixed structural decisions

Do not reconsider these decisions:

```text
AGENT_03_HYPE → [agents_pre_serious_lead: due callback only] → AGENT_04_LEAD
AGENT_04_LEAD → AGENT_05_ORDER → AGENT_06_LEGAL → AGENT_07_*
```

`agents_pre_serious_lead` is an intentional exception to the current slot policy. It permits only a due reservation whose `callbackSlot` is exactly that name. It rejects a new seed, state reaction, legacy pressure, and generic ambient card. Lead → Order → Legal → final remains an unbroken causal closure.

Accepted Padel remains closed after `PADEL_01`; a refusal first switches to Agents and only then evaluates Agents eligibility. No new compulsory middle scene is proposed.

### Future policy and audit work — not current edits

Future implementation must update `.agents/skills/mistakery-reigns-scheduler/references/mistakery-slot-policy.json` with `callbackOnlyBoundaries: [{ before: 'AGENT_03_HYPE', after: 'AGENT_04_LEAD', id: 'agents_pre_serious_lead' }]` and retain the commercial closure in `protectedPairs`.

It must extend `audit-callback-slots.cjs` so a callback-only boundary is reported separately from an ordinary open slot. RED tests must prove: a due callback is legal at Hype → Lead; a seed, reaction, legacy pressure, and ambient card are each illegal there. Do not edit skill files at this checkpoint.

## 2. Named slot map and ordering

| Boundary | Allowed role and priority |
| --- | --- |
| `opening_after_evidence`, after `OPEN_03_*` / before `OPEN_04` | One eligible legacy reaction only. No Package A seed or callback. |
| `opening_shared_seed`, after `OPEN_04` / before `OPEN_05` | Seed only: Mom vs Investor or Fake Founder Coma. |
| `opening_health_resolution`, after `OPEN_05` / before `OPEN_06` | 1) due health callback; 2) Mom Flyers only when no health module is open, reserved, or due; 3) continue to `OPEN_06`. No legacy card or second variable card. |
| `agents_entry_seed`, after direct `OPEN_06 → Agents` or an actual Padel refusal / before `AGENT_01` | Seed only: Restricted AI Payroll, Dev Hostage, or existing B3. |
| `agents_pre_serious_lead`, after `AGENT_03_HYPE` / before `AGENT_04_LEAD` | Due callback only, after exactly `AGENT_01`, `AGENT_02_DEV`, and `AGENT_03_HYPE`. |

Fake Coma has one seed and two ordinary callback cards. The seed reserves exactly one:

```text
coma_campaign: authorized → COMA_CALLBACK_AUTHORIZED at opening_health_resolution
coma_campaign: blocked    → COMA_CALLBACK_BLOCKED at opening_health_resolution
```

Only the reserved callback is eligible in a run. Neither branch uses `choice.conditional`, dynamic text/button replacement, or a conditional engine path.

## 3. Eligibility, reachability, and real opening routes

The audit universe is the 32 real opening traces: every combination from `OPEN_01` through the answer to `OPEN_05`, before Package A effects. A future fixture must emit the full trace string (for example, `OPEN_01:L > OPEN_02:R > OPEN_03_INVOICES:L > OPEN_04:R > OPEN_05:L`) for every classification below; an abstract resource range alone is not a reachability proof.

The current verified aggregate matrix is:

| Opening class | Real traces out of 32 | What can occur |
| --- | ---: | --- |
| health-control + Agents | 11 | One health pair and one Agents lane |
| health-control, no Agents lane | 5 | One health pair only |
| no health + Agents | 9 | Mom Flyers and one Agents lane |
| no health, no Agents lane | 7 | Mom Flyers only |
| no Package A after corrected Flyers rule | 0 | — |

Thus health-control is reachable on **16/32** traces, an Agents lane on **20/32**, and both together on **11/32**. The previous Flyers predicate had **0/32** routes: without health, Founder was already 66–78 after `OPEN_05`, while the old predicate demanded Founder at most 61. That predicate is removed.

### Package A and B3 eligibility contract

All rows also require `oncePerRun: true`, no incompatible open module/reservation, and their named active arc where relevant. Counts are candidate-route counts, not a promise that competing cards all display in the same run.

| Item | Exact slot and eligibility | Real opening paths / count | Compatible lanes | Required writer aligned with range | Initial weight | Required future reachability test |
| --- | --- | ---: | --- | --- | ---: | --- |
| Restricted AI Payroll | `agents_entry_seed`; Agents candidate range Cash 12–19, Team 47–53, Founder 59–83; `payroll_unresolved`; `activeArc: agents` | **16/32**; Payroll and Dev overlap on the same 16 | health pair + Payroll; Flyers + Payroll | Existing `OPEN_05` **Promise revenue** writes `payroll_unresolved`; fixture must prove every selected candidate also satisfies its resource range | **3** | 16 eligible traces; fail if range matches without `payroll_unresolved`, flag matches outside range, or reported overlap with Dev is not 16 |
| Dev Hostage | `agents_entry_seed`; Cash 12–19, Team 47–50, Founder 56–83; `payroll_unresolved` and `dev_payroll_risk_visible` | **16/32**; exactly the same 16 Payroll-eligible traces | health pair + Dev; Flyers + Dev | Existing **Promise revenue** writes both flags; fixture must prove its tighter Team band is genuinely reachable | **2** | 16 eligible traces; fail if `dev_payroll_risk_visible` has no qualifying entry state or Payroll/Dev overlap is not 16 |
| Mom vs Investor | `opening_shared_seed`; health-control class at `OPEN_04`, Founder 58–65; `opening_overload_exposed`; no `health_control_story` | 16 health-class traces; weighted competitor with Fake Coma, never co-displayed | one Agents lane on 11; no Agents lane on 5 | `OPEN_04` writes `opening_overload_exposed`; fixture records the exact 16 source traces | **2** | 16 candidates; fail if the claimed health + Agents pair is absent |
| Fake Founder Coma | same `opening_shared_seed` health-control class, Founder 58–65; `opening_overload_exposed`; no `health_control_story` | 16 health-class traces; weighted competitor with Mom vs Investor, never co-displayed | one Agents lane on 11; no Agents lane on 5 | same `OPEN_04` writer; seed reserves one named callback before `OPEN_05` closes | **1** | 16 candidates; fail if either reserved callback has no real route |
| Mom Flyers | `opening_health_resolution`, after `OPEN_05`; **no health seed/reservation/due callback**, Founder **66–78**; no `sales_outreach_started` requirement | all 16 non-health traces: 9 with Agents lane, 7 without | Flyers + exactly one Agents lane; never with a health pair | no new writer: it reacts to visible high founder mania/confidence, and the no-health predicate is the guard | fallback; schema weight **1** only if required | at least one real route (expected 16); fail if eligible with a health module or reservation |
| Existing B3 | `agents_entry_seed`; Cash 12–19, Team 47–61, Founder 56–83; `sales_outreach_started`; active Agents | **8/32**: 4 overlap Payroll/Dev, 4 are B3-only Agents traces; union of all Agents seed candidates is **20/32** | health + B3 or Flyers + B3; mutually exclusive with other Agents commercial seed | **Call five** remains the only writer of `sales_outreach_started`; it is not a Flyers prerequisite | **1** | 8 eligible traces; fail if B3/Payroll-or-Dev overlap is not 4, B3-only count is not 4, union is not 20, or B3 is reachable in accepted Padel |

`opening_overload_exposed`, `payroll_unresolved`, `dev_payroll_risk_visible`, and `sales_outreach_started` are future non-copy metadata on existing named choices. Every one has a named writer and reader; no orphan flag is allowed.

Weights are provisional starting weights, not character or architecture decisions. The 10,000-run report must show eligibility rate, weighted selection rate, and callback completion rate for every module. If Investor or one module dominates in the observed mix, tune weights after playtest; do not alter character logic or Option 2 to compensate.

### Mom’s knowledge is causal, not startup fluency

Mom knows founder’s phone number because she is his mother. She knows the public company name because founder has been building and talking about **B2BuyerSpyer** for five months; she copies that literal name onto paper flyers. Her action is a literal, well-meant attempt to find help for an overconfident, overworked child—not prospecting. She does not know or use prospect, funnel, user, investor, or other startup vocabulary. `Call five` continues to write `sales_outreach_started` only for B3 and sales events.

## 4. Consequence contracts with exact existing readers

Numbers are preliminary; the state transitions, reader card IDs, and observable behavior are mandatory and RED-testable. No new card may be added merely to consume a flag.

### Restricted AI Payroll — 2 cards, one shared callback

| Stage | Contract |
| --- | --- |
| Seed choice | Accept compute credits → Cash `0`, Team `-2`, Founder `+2`, `payroll_offer: 'compute_only'`; refuse → Cash `0`, Founder `-2`, `payroll_offer: 'ordinary_compute'`. No Customers. |
| Immediate/retained state | `payroll_unresolved` persists; shared callback is reserved. |
| Callback choice | Machines → `payroll_priority: 'machines'`, Team `-3`; people → `payroll_priority: 'people'`, Team `+2`, Founder `-2`. |
| Exact reader | Existing `AGENT_01` reads `payroll_offer`: only `compute_only` reduces the selected existing compute Cash cost by `1` toward zero. Existing `AGENT_04_LEAD` reads both values. |
| Final change/player notice | At Lead: machines adds Team `-2`; people adds Team `+2`, Founder `-1`. Credit relief is visible as a smaller expense, never Cash income; Team consequence exposes who was prioritised. |

RED: all four offer/priority pairs; `AGENT_01` and `AGENT_04_LEAD` read proof; no Cash-from-credits and no Customers.

### Dev Hostage — 2 cards

Конкретная ситуация: продукт продолжает работать, но Dev останавливает выпуск новых обновлений после публичного заявления Investor о его заменимости. Founder публично защищает Dev либо обходит его и восстанавливает возможность обновлений. В callback обновления снова работают, а выбор идёт между письменными правилами доступа и временным shortcut. Dev не увольняется, не уничтожает продукт, не крадёт код и остаётся доступен будущим карточкам.

| Stage | Contract |
| --- | --- |
| Seed choice | Publicly protect Dev while updates are stopped → Team `+1`, Founder `-3`, `dev_conflict: 'public'`; bypass Dev and restore update capability → Team `-3`, Founder `+2`, `dev_conflict: 'bypassed'`. The existing product stays online in both branches. |
| Immediate/retained state | Named callback is reserved with `dev_conflict`. |
| Callback choice | Updates work again. Written access rules → `dev_access: 'protected'`, Team `+2`, Founder `-1`; temporary shortcut → `dev_access: 'contested'`, Team `-3`, Founder `+2`. |
| Exact reader | Existing `AGENT_04_LEAD` reads the pair. |
| Final change/player notice | Public/protected: Team `+2`; public/contested: Team `-1`, Founder `-1`; bypassed/protected: Founder `-2`; bypassed/contested: Team `-4`, Founder `+1`. No Cash or Customers. Buyer-arrival delivery capacity visibly differs. |

RED: all four pairs; prove seed choice remains observable after callback.

### Mom vs Investor — 2 cards

| Stage | Contract |
| --- | --- |
| Seed choice | Back Mom → Team `+1`, Founder `-2`, `health_control_story: 'mom_investor'`, `control_seed: 'mom'`; back Investor → Team `-2`, Founder `+2`, `control_seed: 'investor'`. |
| Immediate/retained state | The health group excludes Fake Coma for the run; callback is reserved. Mom’s contact path is a recurring money-demand notification on founder’s phone. |
| Callback choice | Mom boundary → `route_control: 'mom_boundary'`; Investor directive → `route_control: 'investor_directive'`. |
| Exact reader | Existing `OPEN_06` reads the pair and modifies either existing route choice. |
| Final change/player notice | mom/mom: Team `+3`, Founder `-4`; mom/investor: Team `-1`, Founder `-1`; investor/mom: Team `+1`, Founder `-4`; investor/investor: Team `-3`, Founder `+3`. No Cash, Customers, or route availability change. |

RED: four pairs, mutual exclusion with Fake Coma, and both values survive to `OPEN_06`.

### Fake Founder Coma — 3 cards: seed plus one branch callback

| Stage | Contract |
| --- | --- |
| Seed choice | Authorize campaign → Team `-2`, Founder `+1`, `health_control_story: 'coma'`, `coma_campaign: 'authorized'`, reserve `COMA_CALLBACK_AUTHORIZED`; block → Team `+1`, Founder `-2`, `coma_campaign: 'blocked'`, reserve `COMA_CALLBACK_BLOCKED`. |
| Callback choice | Authorized card: leave live → `coma_callback: 'public'`, Customers `+2` for actual external response; retract → `coma_callback: 'retracted'`, Founder `-2`. Blocked card: send home → `coma_callback: 'rest'`, Team `+2`, Founder `-3`; deny rest → `coma_callback: 'denied'`, Team `-2`, Founder `-3`. |
| Exact reader | Existing `OPEN_06` reads seed plus callback-specific state. |
| Final change/player notice | authorized/public: Team `-3`, Founder `-4`; authorized/retracted: Team `-1`, Founder `-2`; blocked/rest: Team `+2`, Founder `-3`; blocked/denied: Team `-2`, Founder `-3`. Cash never changes. Only public external response changes Customers. |

RED: two reservation IDs, one callback only per run, both two-choice cards, all four `OPEN_06` reads, and exclusion of Mom vs Investor.

### Mom Flyers — 1 reaction

| Stage | Contract |
| --- | --- |
| Choice and retained state | Remove flyers → Team `+1`, Founder `-1`, `mom_flyers: 'removed'`; leave them → Team `-1`, Founder `-3`, `mom_flyers: 'public'`. |
| Exact reader | Existing `OPEN_06` reads it. |
| Final change/player notice | Removed adds Founder `+1`; public adds Team `-1`, Founder `-3` to either existing route choice. Cash and Customers never change. The player sees the difference as restored privacy versus a public family intervention. |

RED: Flyers are reachable; neither health seed, health reservation, nor due health callback can coexist on the same boundary; Flyers occur at most once per run.

### B3 free opt-out — existing two-card module

Existing visible content and seed effects remain unchanged. `b3_free_optout_granted` is set on existing **Waive the fee**; existing `AGENT_04_LEAD` adds Team `+1` to either Lead choice because Sales no longer maintains the suppression/complaint thread. Cash and Customers remain unchanged. The paid route ends immediately, so `paid_to_disappear` consumes its paid/non-validation state. RED: both outcomes, reader proof, accepted-Padel exclusion, and no B3 seed/callback at the callback-only Hype → Lead boundary unless it is the named due reservation.

## 5. Counts, combinations, and empirical gates

- **Package A:** 10 new cards — Restricted AI Payroll 2, Dev Hostage 2, Mom vs Investor 2, Fake Founder Coma 3, Mom Flyers 1.
- **Package B:** 8 new cards.
- **Stage 2B:** 18 new cards. With existing B3’s 2 cards, the deck has 20 variable cards available across Stage 2B content.
- Fake Coma’s second possible callback does not add a run card: a run sees one seed and exactly one reserved callback.

### Preliminary direct-Agents distribution from the 32 opening traces

B3 is an existing two-card module. It occupies the Agents lane but is never counted as Package A. `Legacy reactions` below are independently governed by `opening_after_evidence`; they are shown separately and never used to satisfy a non-legacy budget gate.

| Opening class | Traces | Package A cards | B3 cards | Legacy reactions | Total variable cards |
| --- | ---: | --- | --- | --- | --- |
| health-control + Agents | 11 | 4 if Payroll/Dev wins; 2 if B3 wins | 0 if Payroll/Dev; 2 if B3 | 0–1 | 4 + legacy: health pair plus exactly one two-card Agents module |
| health-control, no Agents lane | 5 | 2 | 0 | 0–1 | 2 + legacy |
| Flyers + Agents | 9 | 3 if Payroll/Dev wins; 1 if B3 wins | 0 if Payroll/Dev; 2 if B3 | 0–1 | 3 + legacy: Flyers plus exactly one two-card Agents module |
| Flyers, no Agents lane | 7 | 1 | 0 | 0–1 | 1 + legacy |

Thus four **Package A** cards are possible only when a health trace selects Payroll or Dev; when it selects B3, the same run has 2 Package A cards + 2 B3 cards = 4 non-legacy variable cards. Likewise, Flyers + Payroll/Dev is 3 Package A cards, while Flyers + B3 is 1 Package A card + 2 B3 cards = 3 non-legacy variable cards. Mom Flyers never coexists with a health pair.

### Accepted Padel

On Padel runs, only the opening health pair (2) or Flyers (1) can appear before `OPEN_06`. After accepted `PADEL_01`, there are zero Package A/B3 seeds, callbacks, reactions, legacy pressure, or ambient insertions.

### Simulation acceptance gates

Package A is not ready until 10,000 seeded full runs show:

- completed direct Agents runs with **zero Package A cards ≤10%**;
- median Package A cards in completed direct Agents runs is **measured and reported separately**; no threshold is asserted before the weighted fixture simulation proves it;
- median non-legacy variable cards (`Package A + B3`) in completed direct Agents runs is **≥3**; legacy reactions do not count toward this threshold;
- callback loss in continuing runs: **0**;
- callback-only/protected-pair violations: **0**;
- post-accepted-`PADEL_01` insertions: **0**;
- health/Flyers mutual-exclusion violations: **0**.

The fixture report must include: eligible traces and ineligibility reasons for every seed; eligibility, selection, and callback-completion rates after weights; Package A, B3, legacy, and total variable cards per run with median and distribution of each; and the shares of health + Payroll, health + Dev, health + B3, Flyers + Payroll, Flyers + Dev, and Flyers + B3.

Option 2 remains recommended: it yields a meaningful variable distribution without breaking the forced commercial closure or reopening accepted Padel.

## 6. Future implementation sequence

1. Write RED scheduler and slot-policy tests on **fixture cards**: due callback legal at Hype → Lead; seed/reaction/legacy/ambient forbidden there.
2. Implement reservations and callback-only boundaries on fixture data, including the health-resolution priority: due callback first, Flyers only otherwise.
3. Add fixture metadata/effects and run an exhaustive reachability check plus 10,000-run simulation; assert every route count, overlap, weight selection rate, card-pool distribution, and ineligibility reason in sections 3 and 5 before production data is added.
4. Final English-copy task complete: the ten texts are author-approved in the copy audition and await production integration.
5. Add approved copy and production data, then exact readers/effect modifiers and their RED tests.
6. Run the full browser/UI/playtest checkpoint and the complete regression suite.

## 7. Final checkpoint answers

1. **Flyers eligibility:** after `OPEN_05`, with Founder 66–78, no health seed/reservation/due callback, once per run; no sales-outreach flag. It is high mania/confidence, not low Founder.
2. **Reachability:** Payroll 16/32; Dev 16/32; B3 8/32; Payroll + Dev overlap 16/32; B3 intersects them on 4/32 and is B3-only on 4/32; union Agents lane 20/32. Health-control is 16/32, both health + Agents are 11/32, and Flyers is 16/32 on no-health routes.
3. **Preliminary Agents distribution:** Package A, B3, legacy, and total variable cards are reported separately in section 5. A two-card B3 selection never inflates Package A; it preserves the non-legacy total of 4 for health + B3 or 3 for Flyers + B3.
4. **Resolved contradictions:** the obsolete Flyers low-Founder/outreach rule, the unsupported “normal run = 4” assertion, and Blueprint’s stale shared-middle/safe-slot descriptions are removed. The two documents now have one technical contract.
5. **Blockers before fixture scheduler implementation:** no creative or slot-policy blocker. The only required proof is the fixture reachability audit of exact 32 trace IDs and the 10,000-run report; a candidate with an incompatible writer/range or no named reader stays ineligible rather than receiving an invented effect.

Production integration was separately authorized and is complete. Do not modify the approved Package A copy, current B3 copy, or fundamental scheduler invariants, and do not begin Package B, without another explicit request.
