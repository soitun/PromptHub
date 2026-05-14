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

### Requirement: Desktop Stops Shipping a CLI Entry

PromptHub desktop MUST stop exposing and packaging any CLI entry once `apps/cli` becomes the standalone CLI product.

#### Scenario: Desktop package no longer installs or launches CLI entrypoints

- **WHEN** the desktop application is installed or launched
- **THEN** it does not install a `prompthub` shell wrapper or desktop CLI bin
- **AND** desktop only surfaces standalone CLI guidance in Settings.
