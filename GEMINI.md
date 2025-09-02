# GEMINI.md

## Project Overview

This is a command-line interface (CLI) tool built with Node.js and TypeScript to generate prompt files in a structured directory format. The tool, named `atman-prompts`, reads templates from the `templates` directory and creates a `.prompts` directory with language-specific subdirectories containing the generated files.

The main application logic is in `src/index.ts`, which uses the `commander` library to handle command-line arguments. The core functionalities are separated into modules within the `src/lib` directory:

*   `directory-manager.ts`: Manages the creation of the directory structure.
*   `file-operations.ts`: Handles creating and writing files.
*   `logger.ts`: Provides logging functionalities.
*   `template-generator.ts`: Loads templates from the `templates` directory.

## Building and Running

### Building the project

To compile the TypeScript code, run:

```bash
npm run build
```

### Running the tool

Once built, the tool can be run from the command line to generate the prompt files:

```bash
node dist/index.js
```

You can also use the following options:

*   `-o, --output-dir <dir>`: Specify the output directory for prompt files (default: `.prompts`).
*   `-l, --languages <languages...>`: Specify the languages to generate (default: `en ja`).
*   `-v, --verbose`: Enable verbose output.

### Running tests

The project uses `vitest` for testing. To run the tests, use:

```bash
npm run test
```

To run tests with coverage, use:

```bash
npm run test:coverage
```

## Development Conventions

### Linting and Formatting

The project uses `biome` for linting and formatting.

*   To lint the code, run: `npm run lint`
*   To format the code, run: `npm run format`
*   To check the code for both linting and formatting errors, run: `npm run check`

### Contribution Guidelines

A `pre-commit` hook is set up with `husky` to run the `check` script before each commit, ensuring that all committed code is linted and formatted correctly.
