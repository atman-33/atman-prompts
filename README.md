# Atman prompts

A CLI tool to generate prompt files in a structured directory format for different languages.

## Features

*   Generate prompt files for multiple languages (English and Japanese by default).
*   Customize the output directory for the generated files.
*   Enable verbose logging for detailed output.

## Installation

```bash
npm install -g atman-prompts
```

## Usage

Once installed, you can use the `atman-prompts` command to generate the prompt files.

### Default Usage

This will create a `.prompts` directory in the current location with subdirectories for `en` and `ja` languages.

```bash
atman-prompts
```

### Options

*   `-o, --output-dir <dir>`: Specify a custom output directory.
*   `-l, --languages <languages...>`: Specify the languages to generate.
*   `-v, --verbose`: Enable verbose output.
*   `-h, --help`: Display help for the command.

### Examples

**Generate prompts in a custom directory:**

```bash
atman-prompts --output-dir my-prompts
```

**Generate prompts for a single language:**

```bash
atman-prompts --languages en
```

**Generate prompts for multiple specified languages:**

```bash
atman-prompts --languages en fr de
```

## Development

### Prerequisites

*   Node.js (>=16.0.0)
*   npm

### Setup

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    npm install
    ```

### Building the Project

To compile the TypeScript code, run:

```bash
npm run build
```

### Running Tests

This project uses `vitest` for testing.

*   Run all tests:

    ```bash
    npm run test
    ```

*   Run tests with coverage:

    ```bash
    npm run test:coverage
    ```

### Linting and Formatting

This project uses `biome` for linting and formatting.

*   Lint the code:

    ```bash
    npm run lint
    ```

*   Format the code:

    ```bash
    npm run format
    ```

*   Check for linting and formatting issues:

    ```bash
    npm run check
    ```