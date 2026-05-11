# Tasks

- [x] Unify web import/export snapshot parsing and normalization with the sync snapshot contract.
- [x] Make desktop `import-with-prompthub.json` embed a full re-importable snapshot.
- [x] Preserve compatibility for PromptHub backup/export envelopes and legacy `versions` payloads.
- [x] Preserve `skillFiles` across web import/export, sync pull/push, and desktop self-hosted sync flows.
- [x] Make web `/api/sync/data` and `/api/sync/pull` reuse the canonical `parseSyncSnapshot()` path instead of maintaining a second schema/normalizer.
- [x] Add regression tests for JSON import/export, ZIP import payloads, media/settings consistency, and skill workspace file preservation.
- [x] Run relevant lint, typecheck, targeted tests, and build verification.
