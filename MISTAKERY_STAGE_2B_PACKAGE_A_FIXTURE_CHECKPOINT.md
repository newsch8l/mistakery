# Mistakery — Stage 2B Package A: Fixture Scheduler Checkpoint

Дата: 13 июля 2026. Это fixture-only checkpoint: production `cards.json`, видимый copy, UI и CSS не менялись.

## 1. Исправленный контракт scheduler

- `AGENT_03_HYPE → AGENT_04_LEAD` удалён из `protectedPairs`.
- Эта граница объявлена только как `agents_pre_serious_lead` callback-only boundary: разрешён один due callback из reservation; seed, reaction, legacy и ambient запрещены.
- Защищённая непрерывная последовательность теперь начинается с `AGENT_04_LEAD → AGENT_05_ORDER → AGENT_06_LEGAL`.
- В `game.js` добавлен только наблюдательный hook boundary scheduler для fixture/audit evidence. Он не добавляет production cards и не меняет copy/UI/CSS.

## 2. RED → GREEN

Сначала были добавлены и запущены RED-проверки. Они упали в пяти местах:

1. Hype → Lead оставалась в protected pairs.
2. Не было clean fixture audit с нулевыми findings на реальном evidence.
3. Broken fixture не проверял reachability реальным маршрутом.
4. `openingTraces()` был синтетическим, а не engine-played.
5. 10,000-run simulation выбирала модули заранее вместо scheduler RNG.

После исправления fixture-checkpoint suite GREEN: **10/10**.

Полный локальный Node suite: **82/82 pass**.

## 3. Реальные 32 opening trace

`tests/fixtures/package-a-scheduler.fixture.cjs` теперь клонирует только канонические production opening cards `OPEN_01`, `OPEN_02`, `OPEN_03_AUDIT`/`OPEN_03_INVOICES`, `OPEN_04`, `OPEN_05`, `OPEN_06` в fixture deck. Каждый из 32 наборов пяти left/right решений реально проигрывается engine от `OPEN_01` до `OPEN_05`.

Fixture-only overlay ставит только технические flags, являющиеся следствием фактических choice-веток; `health`, Agents lane, Payroll/Dev и B3 не назначаются по номеру маршрута. Fixture resources и side-story компенсация base cash burn существуют только для воспроизводимого checkpoint range, production effects не тронуты.

| Реальная eligibility среди 32 trace | Результат |
| --- | ---: |
| health-control | 16/32 |
| Restricted AI Payroll | 16/32 |
| Dev Hostage | 16/32 |
| Payroll + Dev overlap | 16/32 |
| B3 | 8/32 |
| B3 + Payroll/Dev | 4/32 |
| B3-only Agents lane | 4/32 |
| union Agents lane | 20/32 |

## 4. Slot audit и reachability

Clean fixture audit использует evidence из реальных engine runs: 32 opening trace × deterministic seeded scheduler samples × обе ветви callback. Итог: **0 findings**.

Reachability больше не читает ручное поле `scheduler.reachable = false`. Для каждого scheduler card audit требует хотя бы одно реально проигранное подходящее boundary window. Для callback требуется также реально достигнутое callback window.

Отдельные намеренно сломанные fixtures независимо проверяют:

- reservation без существующего callback boundary;
- callback внутри protected pair;
- variable content после Padel lock;
- seed без реального достижимого trace;
- seed/reaction/legacy/ambient role в callback-only boundary.

## 5. Seeded 10,000-run simulation

Запуск использует seed `0x12345678`. Ни Mom vs Investor/Coma, ни Payroll/Dev/B3 не выбираются заранее: engine получает обычный seeded RNG и сам выбирает eligible weighted pool.

| Метрика | Фактический результат |
| --- | ---: |
| completed direct Agents runs | 7,891 |
| direct Agents с 0 Package A cards | 0% |
| median Package A cards/run | 2 |
| median B3 cards/run | 0 |
| median legacy reactions/run | 0 |
| median non-legacy variables (`Package A + B3`) | 3 |
| median total variable cards | 3 |
| callback loss | 0 |
| protected-pair violations | 0 |
| post-accepted-`PADEL_01` insertions | 0 |
| health/Flyers mutual-exclusion violations | 0 |

### Наблюдаемые веса и callbacks

| Module | Eligible windows | Selected | Selection rate | Callback completion |
| --- | ---: | ---: | ---: | ---: |
| Mom vs Investor | 4,927 combined health windows | 3,204 | 65.03% | 3,204/3,204 (100%) |
| Fake Founder Coma | 4,927 combined health windows | 1,723 | 34.97% | 1,723/1,723 (100%) |
| Restricted AI Payroll | 4,171 | 2,373 | 56.89% | 2,373/2,373 (100%) |
| Dev Hostage | 4,171 | 1,628 | 39.03% | 1,628/1,628 (100%) |
| B3 | 2,051 | 1,187 | 57.87% | 618/618 reserved callbacks (100%) |

Mom vs Investor vs Coma therefore follows the configured **2:1** weight under normal RNG. Flyers has no balancing weight and appears only as the allowed callback-absent reaction.

### Условная проверка Agents weights

Aggregate B3 rate не используется как доказательство веса: в ней смешиваются pools разного состава. Проверка делится по фактическому `agents_entry_seed` pool каждого engine run.

Допуск в RED/GREEN-тесте — `max(2 percentage points, 4σ)`, где `σ = sqrt(p(1-p)/n)`: это двусторонний статистический допуск, рассчитанный отдельно для каждой ожидаемой доли `p` и числа окон `n`.

| Фактический pool | Windows | Expected | Observed selection | Допуск 4σ | Verdict |
| --- | ---: | --- | --- | --- | --- |
| Payroll + Dev | 3,137 | 3:2 | Payroll 1,858 (59.23%); Dev 1,279 (40.77%) | ±3.50 pp для обеих долей | pass |
| Payroll + Dev + B3 | 1,034 | 3:2:1 | Payroll 515 (49.81%); Dev 349 (33.75%); B3 170 (16.44%) | Payroll ±6.22 pp; Dev ±5.87 pp; B3 ±4.64 pp | pass |
| B3-only | 1,017 | no weighted comparison | B3 1,017 (100%) | — | reported separately, excluded from B3 weight proof |

Именно первые две строки доказывают соответственно веса **3:2** и **3:2:1**. B3-only windows показывают reachability/forced selection, но не участвуют в выводе о весе B3.

## 6. Production findings intentionally still open

Production migration has not started. Running the slot audit against current `cards.json` still reports exactly these earlier findings:

1. `B3_PAID_OPTOUT_CALLBACK` can land inside `AGENT_05_ORDER → AGENT_06_LEGAL`.
2. `PADEL_03_TEAM` is a variable slot after the `PADEL_01` lock.

They are reported separately, not waived and not treated as fixture findings. They remain for the later production-card migration.

## 7. Scope stop

Fixture scheduler checkpoint is complete. No production cards, English copy, UI or CSS were added or changed here.
