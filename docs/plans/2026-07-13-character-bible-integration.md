# Character Bible Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the existing Validation character PDF a canonical, mandatory source for all future Mistakery character and copy work.

**Architecture:** Preserve the original PDF under `docs/source/`, expose its usable rules through `docs/core/CHARACTER_BIBLE.md`, and route all future work through that file from `MISTAKERY_START_HERE.md`, `TOV_BIBLE.md`, and the project narrative skill. Game data and runtime behavior remain unchanged.

**Tech Stack:** Markdown project documentation, project-local `SKILL.md`, source PDF.

---

### Task 1: Canonical character source

**Files:**
- Create: `docs/source/MISTAKERY_VALIDATION_CHARACTERS_SOURCE.pdf`
- Create: `docs/core/CHARACTER_BIBLE.md`

1. Copy the author PDF unchanged into `docs/source/`.
2. Convert its character, TOV, pressure, and resource intent into the canonical Character Bible.
3. Reconcile only stage/existence conflicts through State Bible precedence.

### Task 2: Mandatory routing

**Files:**
- Modify: `MISTAKERY_START_HERE.md`
- Modify: `docs/core/TOV_BIBLE.md`
- Modify: `.agents/skills/reigns-like-narrative-design/SKILL.md`

1. Add Character Bible to source-of-truth order.
2. Require it for any new or rewritten character message.
3. Define TOV Bible as global language rules and Character Bible as character-specific authority.

### Task 3: Historical checkpoint status

**Files:**
- Modify: `MISTAKERY_CREATIVE_CALIBRATION_CHECKPOINT_3_CHARACTER_ENGINES.md`

1. Mark the checkpoint as supplementary exploration.
2. Make Character Bible authoritative on conflicts.

### Task 4: Verification

1. Confirm the source PDF is byte-identical to the supplied file.
2. Confirm every routing document references `CHARACTER_BIBLE.md`.
3. Confirm `cards.json`, `game.js`, and generated bundles are unchanged.
