# Reigns Narrative System Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Mistakery's project context navigable and add a project-local skill that audits Reigns-like narrative design and `cards.json` structure.

**Architecture:** Keep short, specialised documentation in `docs/` and add one root entrypoint. The skill contains a concise workflow, references to the project documents, and a Node.js analyzer that produces a non-mutating audit report.

**Tech Stack:** Markdown, vanilla Node.js, existing `cards.json` and CommonJS test runner.

---

### Task 1: Organise project documentation

**Files:**

- Create: `MISTAKERY_START_HERE.md`
- Move: existing project bibles and research into `docs/core/`, `docs/design/`, `docs/research/`
- Modify: `README.md`

**Steps:**

1. Keep the documents separate; do not merge their content.
2. Create one short entrypoint that defines the reading order and authority hierarchy.
3. Preserve all document contents and update only relative links where needed.
4. Verify no old root-level bible or research file remains after the move.

### Task 2: Define failing analyzer tests

**Files:**

- Create: `.agents/skills/reigns-like-narrative-design/tests/audit-deck.test.cjs`

**Steps:**

1. Write tests for a broken fixture: duplicate IDs, missing targets, same-next choices without persistent distinction, pressure-card stacking, unknown source, and dead flags.
2. Run tests before the analyzer exists and confirm expected failure.

### Task 3: Implement the minimal analyzer

**Files:**

- Create: `.agents/skills/reigns-like-narrative-design/scripts/audit-deck.cjs`
- Create: `.agents/skills/reigns-like-narrative-design/tests/fixtures/broken-deck.json`

**Steps:**

1. Read a deck JSON path from the command line.
2. Emit machine-readable JSON and readable summary.
3. Detect the invariants defined in Task 2.
4. Run the tests and confirm they pass.

### Task 4: Create the project-local skill

**Files:**

- Create: `.agents/skills/reigns-like-narrative-design/SKILL.md`
- Create: `.agents/skills/reigns-like-narrative-design/agents/openai.yaml`
- Create: `.agents/skills/reigns-like-narrative-design/references/project-map.md`

**Steps:**

1. Keep SKILL.md concise and procedural.
2. Route agents to only the relevant project documents for each task type.
3. Require semantic audit before copywriting and automated audit before claims of structural correctness.
4. Reference, but do not duplicate, the project bibles and research.

### Task 5: Validate and forward-test

**Files:**

- Test: `.agents/skills/reigns-like-narrative-design/tests/audit-deck.test.cjs`
- Test: existing project tests

**Steps:**

1. Run skill structural validation.
2. Run analyzer against the production `cards.json` and save no game-state changes.
3. Run existing project tests.
4. Conduct a clean audit scenario using the new skill and confirm it identifies meaningful current issues rather than only formatting.
