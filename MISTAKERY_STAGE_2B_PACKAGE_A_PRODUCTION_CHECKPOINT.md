# Mistakery — Stage 2B Package A: Production Technical Checkpoint

Дата: 13 июля 2026. Канонический проект: `/Users/Newschxxl/Desktop/Mistakery Игра/mistakery`.

## Что встроено

В production добавлены ровно 10 утверждённых карточек: Restricted AI Payroll (seed + callback), Dev Hostage (seed + callback), Mom vs Investor (seed + callback), Fake Founder Coma (seed + authorized/blocked callbacks) и Mom Flyers (state reaction). Видимый английский текст и labels совпадают с author-approved copy audition.

Package A использует `opening_shared_seed`, `opening_health_resolution`, `agents_entry_seed` и callback-only `agents_pre_serious_lead`. Existing B3 перенесён в тот же Agents lane без изменения copy. PRESS_CAPITALISM возвращается в безопасном break после Legal. Lead → Order → Legal и Padel protected pairs не разрываются.

## Production verification

- Automated production/core/scheduler/analyzer suite: 112/112 pass.
- Project analyzer: 0 errors, 8 известных `same-next-without-future-state` warnings; false `unused-flag` для Package A отсутствуют.
- Callback-slot audit: 0 findings.
- 32 opening traces: health 16/32; Payroll 16/32; Dev 16/32; B3 8/32; Agents union 20/32; утверждённые overlaps совпадают.
- Deterministic traces: все 18 Package A outcomes проходят seed → reserved callback → reader; pending callback очищается на terminal.
- Browser: direct-file smoke и HTTP smoke pass; полные Agents и контрольный Padel walkthrough pass.
- Mobile 390×844: все 10 карт занимают не больше 4 визуальных строк, используют общий 15.6px шрифт, не перекрывают timestamp и не обрезают кнопки. Copy не сокращался.

## 10,000 production seeded runs

Во всех direct Agents runs была хотя бы одна Package A card; median Package A — 2, median Package A + B3 — 3, median всех variable cards — 4. Callback loss, protected-pair violations, post-accepted-`PADEL_01` insertions и health/Flyers mutex violations: 0.

| Карта/линия | Показов | Частота от 10,000 runs |
| --- | ---: | ---: |
| Mom vs Investor seed | 3,518 | 35.18% |
| Fake Founder Coma seed | 1,767 | 17.67% |
| Mom Flyers | 4,715 | 47.15% |
| Restricted AI Payroll seed | 2,310 | 23.10% |
| Dev Hostage seed | 1,293 | 12.93% |

Health pair либо Flyers появляется в каждом run по утверждённой 32-trace матрице. Agents-модуль зависит от route, opening choice flags, resource range и weighted pool; Payroll + Dev вместе были выбраны в 36.03% всех runs этого фиксированного production sample.

## Открытые риски и stop

- Восемь старых same-next warnings остаются вне Package A scope.
- Длинные ID видны только как слабая debug-подпись; player copy и controls не переполняются.
- Частоты являются результатом фиксированного 10,000-seed sample и могут немного колебаться при другом sample.
- RU-переводы Package A не утверждены: generated bilingual catalog сохраняет точный EN вместо создания альтернативного текста.

Checkpoint достигнут. Package B, новые персонажи, дальнейшая copy-редактура, commit, push и PR не выполнялись.
