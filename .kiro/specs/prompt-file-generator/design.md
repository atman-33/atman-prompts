# Design Document

## Overview

The atman-prompts package is a Node.js CLI tool that generates a standardized prompt file structure. It creates a `.prompts` directory with language-specific subdirectories (`en` and `ja`) containing template markdown files. The tool is designed to be executed via npx without requiring global installation and follows functional programming principles throughout its implementation.

## Architecture

The application follows a modular, functional architecture with clear separation of concerns:

```
src/
├── index.ts              # CLI entry point and argument parsing
├── lib/
│   ├── file-operations.ts    # File system operations
│   ├── directory-manager.ts  # Directory creation and management
│   ├── template-generator.ts # Prompt template generation
│   └── logger.ts            # Logging and user feedback
templates/
├── en/
│   ├── xxx.md            # English prompt templates
│   └── yyy.md
└── ja/
    ├── xxx.md            # Japanese prompt templates
    └── yyy.md
```

The architecture emphasizes:
- **Functional composition**: Small, pure functions that can be easily tested and composed
- **Immutable data flow**: Data transformations without side effects where possible
- **Error handling**: Graceful handling of file system errors and edge cases
- **Separation of concerns**: Each module has a single responsibility

## Components and Interfaces

### CLI Entry Point (`index.ts`)
```typescript
type CliOptions = {
  readonly outputDir: string;
  readonly languages: readonly string[];
  readonly verbose: boolean;
};

const parseArguments = (args: readonly string[]): CliOptions => { /* ... */ };
const main = async (options: CliOptions): Promise<void> => { /* ... */ };
```

### File Operations (`file-operations.ts`)
```typescript
type FileCheckResult = {
  readonly exists: boolean;
  readonly path: string;
};

type FileCreationResult = {
  readonly success: boolean;
  readonly path: string;
  readonly skipped: boolean;
  readonly error?: string;
};

const checkFileExists = (filePath: string): FileCheckResult => { /* ... */ };
const createFileIfNotExists = (filePath: string, content: string): Promise<FileCreationResult> => { /* ... */ };
```

### Directory Manager (`directory-manager.ts`)
```typescript
type DirectoryStructure = {
  readonly baseDir: string;
  readonly languageDirs: readonly string[];
};

const createDirectoryStructure = (baseDir: string, languages: readonly string[]): Promise<DirectoryStructure> => { /* ... */ };
const ensureDirectoryExists = (dirPath: string): Promise<boolean> => { /* ... */ };
```

### Template Generator (`template-generator.ts`)
```typescript
type PromptTemplate = {
  readonly fileName: string;
  readonly content: string;
  readonly language: string;
};

const loadTemplatesFromRepository = (language: string): Promise<readonly PromptTemplate[]> => { /* ... */ };
const getTemplateFilePath = (templateName: string, language: string): string => { /* ... */ };
const readTemplateFile = (filePath: string): Promise<string> => { /* ... */ };
```

### Logger (`logger.ts`)
```typescript
type LogLevel = 'info' | 'success' | 'warning' | 'error';

const log = (level: LogLevel, message: string): void => { /* ... */ };
const logResults = (results: readonly FileCreationResult[]): void => { /* ... */ };
```

## Data Models

### Core Data Types
```typescript
// Immutable configuration object
type PromptsConfig = {
  readonly baseDirectory: '.prompts';
  readonly supportedLanguages: readonly ['en', 'ja'];
  readonly defaultTemplates: readonly string[];
};

// Result aggregation for reporting
type GenerationResult = {
  readonly totalFiles: number;
  readonly createdFiles: readonly string[];
  readonly skippedFiles: readonly string[];
  readonly errors: readonly string[];
};

// Template metadata
type TemplateMetadata = {
  readonly name: string;
  readonly description: string;
  readonly defaultContent: string;
};
```

## Error Handling

The application implements comprehensive error handling using functional error patterns:

### Error Types
```typescript
type FileSystemError = {
  readonly type: 'PERMISSION_DENIED' | 'PATH_NOT_FOUND' | 'DISK_FULL';
  readonly message: string;
  readonly path: string;
};

type ValidationError = {
  readonly type: 'INVALID_PATH' | 'INVALID_LANGUAGE';
  readonly message: string;
  readonly value: string;
};
```

### Error Handling Strategy
1. **Graceful degradation**: Continue processing other files when individual operations fail
2. **Detailed logging**: Provide clear error messages with context
3. **Non-zero exit codes**: Return appropriate exit codes for different error scenarios
4. **Rollback prevention**: Never partially create directory structures

### File System Error Handling
- **Permission errors**: Log error and continue with other operations
- **Disk space errors**: Fail fast and report to user
- **Path resolution errors**: Validate paths before operations

## Testing Strategy

### Unit Testing Approach
Each module will be tested in isolation using pure function testing patterns:

```typescript
// Example test structure
describe('file-operations', () => {
  describe('checkFileExists', () => {
    it('should return exists: true for existing files', () => { /* ... */ });
    it('should return exists: false for non-existing files', () => { /* ... */ });
  });
  
  describe('createFileIfNotExists', () => {
    it('should create file when it does not exist', async () => { /* ... */ });
    it('should skip file creation when file exists', async () => { /* ... */ });
    it('should handle permission errors gracefully', async () => { /* ... */ });
  });
});
```

### Integration Testing
- **CLI integration**: Test complete command execution with temporary directories
- **File system integration**: Test actual file creation and directory structure
- **Error scenarios**: Test behavior with various file system error conditions

### Test Data Management
- **Temporary directories**: Use OS temp directories for test isolation
- **Mock file systems**: Use in-memory file systems for unit tests where appropriate
- **Fixture templates**: Maintain test template files for validation

### Testing Tools
- **Vitest**: Primary testing framework for unit and integration tests with fast execution and TypeScript support
- **Temporary directories**: Use `tmp` package for isolated test environments
- **File system mocking**: Use `mock-fs` for unit tests requiring file system isolation

## Template Storage Strategy

The prompt template files are stored within the npm package repository structure and distributed with the package:

### Repository Template Structure
```
templates/
├── en/
│   ├── system-prompt.md     # System prompt template
│   ├── code-review.md       # Code review prompt template
│   ├── documentation.md     # Documentation generation template
│   └── debugging.md         # Debugging assistance template
└── ja/
    ├── system-prompt.md     # Japanese system prompt template
    ├── code-review.md       # Japanese code review template
    ├── documentation.md     # Japanese documentation template
    └── debugging.md         # Japanese debugging template
```

### Template Loading Strategy
1. **Package bundling**: Template files are included in the npm package distribution
2. **Runtime loading**: Templates are read from the package's `templates/` directory at runtime
3. **Language resolution**: Templates are loaded based on the target language directory
4. **File discovery**: The system scans the template directory to discover available templates dynamically

### Template File Resolution
```typescript
const getPackageTemplatesPath = (): string => {
  // Resolve path relative to the package installation
  return path.join(__dirname, '..', 'templates');
};

const discoverTemplateFiles = (language: string): Promise<readonly string[]> => {
  const templatesDir = path.join(getPackageTemplatesPath(), language);
  // Return list of .md files in the language directory
};
```

## Package Configuration

### NPM Package Setup
```json
{
  "name": "atman-prompts",
  "bin": {
    "atman-prompts": "./dist/index.js"
  },
  "files": [
    "dist/",
    "templates/",
    "README.md"
  ],
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### Build Configuration
- **TypeScript compilation**: Target ES2020 for modern Node.js compatibility
- **Shebang handling**: Ensure executable has proper shebang for cross-platform compatibility
- **Dependency bundling**: Include only necessary runtime dependencies
- **Template inclusion**: Ensure templates/ directory is included in the build output

### Development Tools Configuration
- **Biome**: Used for both linting and code formatting with consistent rules
- **Vitest**: Testing framework with TypeScript support and fast execution
- **TypeScript**: Strict type checking with modern ES features

### Package Scripts
```json
{
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "biome lint src/",
    "format": "biome format --write src/",
    "check": "biome check src/"
  }
}
```