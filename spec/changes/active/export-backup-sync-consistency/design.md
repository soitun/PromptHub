# Design

## Overview

The fix is to converge on one logical snapshot contract instead of keeping separate per-route payload schemas.

## Key Decisions

- Treat `apps/web/src/services/sync-snapshot.ts` as the web-side normalization boundary for importable/exportable sync snapshots.
- Keep accepting historical PromptHub envelopes (`prompthub-backup`, `prompthub-export`) and legacy `versions` payloads for compatibility.
- Make desktop `import-with-prompthub.json` contain a full re-importable snapshot, even when the ZIP also includes human-readable file trees.
- Treat `skillFiles` as part of the recoverable snapshot contract, with the web skill workspace acting as the durable backing store instead of introducing a separate database table.
- Keep bulky binary/media duplication out of future enhancements when possible, but correctness and re-importability take priority over ZIP size in the embedded JSON payload.

## Affected Areas

- `apps/web/src/routes/import-export.ts`
- `apps/web/src/services/sync-snapshot.ts`
- `apps/web/src/services/backup.service.ts`
- `apps/web/src/services/skill-workspace.ts`
- `apps/web/src/routes/sync.ts`
- `apps/web/src/routes/import-export.test.ts`
- `apps/web/src/routes/sync.test.ts`
- `apps/web/src/services/skill-workspace.test.ts`
- `apps/desktop/src/renderer/services/database-backup.ts`
- `apps/desktop/src/renderer/services/self-hosted-sync.ts`
- `apps/desktop/tests/unit/services/database-backup.test.ts`
- `apps/desktop/tests/unit/services/self-hosted-sync.test.ts`

## Tradeoffs

- Embedding a full snapshot inside selective ZIP exports increases ZIP size when media is included, but it restores the important invariant that the embedded JSON is directly importable.
- Reusing one parser reduces drift, but some route-specific error messages become slightly less bespoke.
