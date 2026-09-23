# Project Status

## Verified snapshot

- Updated: 2026-09-23 19:36 MSK.
- Branch: `design/personal-chat-runtime` in `/Users/Newschxxl/Documents/mistakery/.worktrees/personal-chat-runtime`.
- Base commit: `054e42b4751ea6ee10615aeef0fca84e8071e969`. `git ls-remote` confirmed that `main`, `lean-opening`, and `design/personal-chat-runtime` pointed to this commit before the documentation cleanup.
- Working tree: initially clean. This cleanup changes only `README.md`, `CLAUDE.md`, and this status file. The parent visual workspace is not a Git repository; the separate desktop checkout has pre-existing untracked files and was not changed.

## Current objective

Keep the published repository's entry documents accurate and remove only files demonstrated to be disposable. Preserve active gameplay, approved copy, project history, and source assets.

## Completed work

- Replaced the obsolete July itch demo handoff in `CLAUDE.md` with the current status entry point and active route map.
- Corrected README navigation and documented deck regeneration and the focused runtime check.
- Audited large tracked files and references. The three high-resolution Padel/CEO PNG originals are not loaded by the game, but accompany its smaller WebP assets. Root audition documents are read by project skills and tests. Historical plans and checkpoints are deliberately retained. No tracked file was proved disposable, so none was deleted.

## Key technical decisions

- `cards.json` remains canonical; generated `cards.bundle.js` and `MISTAKERY_CARDS_EN_RU.md` must be rebuilt after relevant changes.
- GitHub Pages serves `lean-opening` from `/`. `main`, `lean-opening`, and `design/personal-chat-runtime` were aligned before this cleanup.
- Current gameplay includes the opening, Live AI Agent, AI Influencer, and Padel. Keep the portrait phone interface and full mobile motion; no itch.io package or upload is planned.
- Every gameplay turn costs Cash −0.5; zero resources do not end a run. The RU / ± card inspector is read-only. Back restores prior turn state. Reload resets progress because there is no persistent save.
- The full historical test suite is not a release gate: it includes expectations for superseded routes and scheduler behavior. Browser tests also require an environment that can launch Chromium.

## Main changed files

- `README.md`: current entry point, regeneration commands, focused check.
- `CLAUDE.md`: removed stale roadmap and incorrect source-of-truth/test guidance.
- `PROJECT_STATUS.md`: concise verified continuation snapshot.

## Verification

| Command or check | Result |
|---|---|
| `git ls-remote origin HEAD refs/heads/main refs/heads/lean-opening refs/heads/design/personal-chat-runtime` | All three branches and HEAD at `054e42b4751ea6ee10615aeef0fca84e8071e969` before edits. |
| `node --test tests/offline.test.cjs tests/personal-chat-runtime.test.cjs tests/live-agent.test.cjs` | 22 passed, 0 failed. |
| `node --check app.js` | Passed; runtime was not changed. |
| `git diff --check` | Passed after all three documentation files were updated. |
| `node --test tests/*.test.cjs` | Failed on obsolete expectations and sandboxed Chromium launch. This is not the current release gate. |

## Known issues and unverified assumptions

- The broad historical suite remains red and needs a separate migration or archival decision. It was not removed under this conservative cleanup.
- Physical phone rotation, browser chrome, and frame rate remain unverified; earlier browser coverage used desktop engine emulation.
- No gameplay, assets, or dependencies changed in this cleanup.

## Failed approaches — do not repeat

- Do not use the July itch demo plan or the newest date in `docs/plans/` as an automatic current roadmap.
- Do not delete the original PNGs or audition documents solely because the runtime does not load them; they retain source and approval value.
- Do not use a blanket `node --test tests/*.test.cjs` result as evidence that the current game is broken without separating obsolete assertions from actual runtime failures.

## Next steps

1. Continue user-directed work from this snapshot and the specific relevant plan.
2. If the historical suite is addressed later, classify each failing test against current behavior before updating or removing it.
