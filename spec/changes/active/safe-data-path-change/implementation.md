# Implementation

## Changes

- Added reusable target directory inspection based on PromptHub data markers.
- Reworked data path changes into explicit `migrate`, `switch`, and `overwrite` actions.
- Updated settings UI to warn when the selected target already has data and default users toward switching.

## Verification

- `pnpm --filter @prompthub/desktop test:run tests/unit/main/data-path.test.ts tests/unit/components/data-settings.test.tsx`
- `pnpm --filter @prompthub/desktop typecheck`
- `pnpm --filter @prompthub/desktop lint`
- `pnpm --filter @prompthub/desktop test:run` was attempted; it failed under full-suite parallel load with unrelated timeouts in existing slow tests and one permission error writing to the real Application Support path.
