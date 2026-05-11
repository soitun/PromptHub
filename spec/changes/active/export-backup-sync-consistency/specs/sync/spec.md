# Delta Spec

## Modified

- PromptHub export, backup, and sync entry points must share a recoverable snapshot contract for prompts, folders, versions, rules, skills, settings, and referenced media.
- `import-with-prompthub.json` inside desktop ZIP exports must itself be importable without needing ZIP side-channel reconstruction.
- Web `/api/import` must accept PromptHub backup/export envelopes and normalized sync snapshots with equivalent semantics.

## Scenarios

- Scenario: Desktop ZIP export is re-imported on web
  - Given desktop generates a selective ZIP export with `import-with-prompthub.json`
  - When web `/api/import` ingests that ZIP
  - Then the embedded JSON is sufficient to restore the exported records and settings without depending on undocumented ZIP-only reconstruction rules

- Scenario: Snapshot fields stay aligned across flows
  - Given a workspace contains media references, rules, skills, and `settingsUpdatedAt`
  - When the user exports a backup, uploads to self-hosted sync, or imports through web
  - Then those flows preserve the same logical snapshot fields and timestamp semantics
