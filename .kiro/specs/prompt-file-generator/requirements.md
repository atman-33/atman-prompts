# Requirements Document

## Introduction

The atman-prompts package is an npm CLI tool that generates prompt files in a structured directory format. When executed via npx, it creates prompt files in a `.prompts` folder with language-specific subdirectories (en/ja), while preserving existing files to prevent accidental overwrites. The tool follows functional programming principles and uses kebab-case naming conventions.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to run `npx atman-prompts` to generate prompt files in my project, so that I can quickly set up a standardized prompt file structure.

#### Acceptance Criteria

1. WHEN the user runs `npx atman-prompts` THEN the system SHALL create a `.prompts` directory in the current working directory
2. WHEN the `.prompts` directory is created THEN the system SHALL create `en` and `ja` subdirectories within it
3. WHEN the command executes successfully THEN the system SHALL generate sample prompt files (xxx.md) in both language directories
4. WHEN the command completes THEN the system SHALL display a success message indicating the files were created

### Requirement 2

**User Story:** As a developer, I want existing prompt files to be preserved when running the command, so that I don't accidentally lose my custom prompts.

#### Acceptance Criteria

1. WHEN a prompt file already exists at the target location THEN the system SHALL NOT overwrite the existing file
2. WHEN attempting to create a file that already exists THEN the system SHALL skip that file and continue with other files
3. WHEN files are skipped due to existing content THEN the system SHALL log which files were skipped
4. WHEN the command completes THEN the system SHALL report both created and skipped files

### Requirement 3

**User Story:** As a developer, I want the codebase to follow functional programming principles, so that the code is maintainable and follows modern JavaScript best practices.

#### Acceptance Criteria

1. WHEN implementing functionality THEN the system SHALL use arrow functions for all function definitions
2. WHEN organizing code THEN the system SHALL avoid class-based implementations in favor of functional approaches
3. WHEN naming source files THEN the system SHALL use kebab-case naming convention (e.g., file-generator.ts)
4. WHEN writing functions THEN the system SHALL prefer pure functions and immutable data structures where possible

### Requirement 4

**User Story:** As a developer, I want all generated documentation and code comments to be in English, so that the codebase maintains consistency and international accessibility.

#### Acceptance Criteria

1. WHEN generating prompt template files THEN the system SHALL include English placeholder content
2. WHEN writing code comments THEN the system SHALL use English language exclusively
3. WHEN creating documentation files THEN the system SHALL write all content in English
4. WHEN displaying CLI messages THEN the system SHALL output messages in English

### Requirement 5

**User Story:** As a developer, I want the package to work as an npx command, so that users can run it without installing it globally.

#### Acceptance Criteria

1. WHEN the package is published THEN the system SHALL be executable via `npx atman-prompts`
2. WHEN executed via npx THEN the system SHALL run the main CLI command without requiring global installation
3. WHEN the package.json is configured THEN the system SHALL include proper bin configuration for CLI execution
4. WHEN dependencies are managed THEN the system SHALL include all necessary runtime dependencies