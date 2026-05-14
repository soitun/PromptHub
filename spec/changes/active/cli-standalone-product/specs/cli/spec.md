# CLI Standalone Spec Delta

## Added Requirements

### Requirement: CLI as Independent Product

PromptHub MUST provide a standalone CLI product under `apps/cli` that can be installed and executed without requiring the desktop application binary or Electron runtime.

#### Scenario: CLI bootstraps shared workspace

- **WHEN** the user runs the standalone CLI with a valid PromptHub workspace
- **THEN** the CLI resolves the same workspace layout as desktop
- **AND** it reads and writes the same PromptHub data directories.

### Requirement: Shared Runtime Path Contract

PromptHub MUST keep runtime path resolution in a shared module consumed by both desktop and CLI.

#### Scenario: Desktop and CLI resolve the same skills directory

- **WHEN** desktop and CLI run against the same appData / userData roots
- **THEN** `skills`, `rules`, `prompts`, and asset directories resolve to the same absolute paths.

### Requirement: Desktop CLI Compatibility During Migration

PromptHub desktop MUST continue to expose its current CLI entry during Phase 1 migration.

#### Scenario: Existing desktop package bin continues to work

- **WHEN** the existing desktop package bin entry is invoked
- **THEN** it still executes successfully
- **AND** it reuses the shared CLI implementation instead of duplicating command logic.
