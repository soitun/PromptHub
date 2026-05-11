# Implementation

## Shipped Changes

- Web import/export now reuses `parseSyncSnapshot()` as the normalization boundary for JSON and ZIP imports, preserving PromptHub envelope compatibility, legacy `versions`, numeric timestamps, media payloads, and desktop `settings.state` snapshots.
- Web `/api/import` now keeps validation failures on the `VALIDATION_ERROR`/422 contract while still accepting the broader normalized sync snapshot shape.
- Web backup export/import now includes `skillFiles`, and skill workspace rebuilds preserve or restore additional skill repo files instead of silently dropping everything except `SKILL.md` and `versions/`.
- Web `/api/sync/data` and WebDAV `/api/sync/pull` now reuse the same `parseSyncSnapshot()` normalization boundary as `/api/import`, so PromptHub envelopes, legacy `versions`, numeric timestamps, media payloads, and desktop `settings.state` snapshots no longer depend on a duplicated route-local schema.
- Desktop selective ZIP export embeds a full re-importable snapshot in `import-with-prompthub.json`, including media, `settingsUpdatedAt`, skills, skill versions, and `skillFiles`.
- Desktop self-hosted sync now carries `skillFiles` in push/pull payloads and uses the web captcha flow for login/bootstrap helpers so real self-hosted sync remains functional after auth hardening.

## Verification

- `pnpm --filter @prompthub/web exec tsc --noEmit`
- `pnpm --filter @prompthub/web test -- src/routes/import-export.test.ts --run`
- `pnpm --filter @prompthub/web test -- src/routes/sync.test.ts --run`
- `pnpm --filter @prompthub/web exec tsc --noEmit`
- `pnpm --filter @prompthub/web test -- src/services/skill-workspace.test.ts --run`
- `pnpm --filter @prompthub/desktop test -- tests/unit/services/self-hosted-sync.test.ts --run`
- `pnpm --filter @prompthub/web lint`
- `pnpm --filter @prompthub/web build`

## Follow-up

- Desktop and E2E self-hosted helpers now rely on the current math captcha prompt format; if web auth changes captcha semantics again, the shared solving logic should be centralized across desktop/web test helpers.
