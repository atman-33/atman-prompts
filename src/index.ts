#!/usr/bin/env node

import { join } from 'node:path';
import { Command } from 'commander';
import { createDirectoryStructure } from './lib/directory-manager.js';
import {
  createFileIfNotExists,
  type FileCreationResult,
} from './lib/file-operations.js';
import {
  log,
  logDirectoryCreation,
  logResults,
  logTemplateLoading,
  logWelcome,
} from './lib/logger.js';
import { loadTemplatesFromRepository } from './lib/template-generator.js';

// Configuration constants
const PROMPTS_CONFIG = {
  baseDirectory: '.prompts',
  supportedLanguages: ['en', 'ja'] as const,
} as const;

type CliOptions = {
  readonly outputDir: string;
  readonly languages: readonly string[];
  readonly verbose: boolean;
};

type GenerationResult = {
  readonly totalFiles: number;
  readonly createdFiles: readonly string[];
  readonly skippedFiles: readonly string[];
  readonly errors: readonly string[];
};

/**
 * Generate prompt files for a specific language
 */
const generatePromptFiles = async (
  language: string,
  outputDir: string,
  verbose: boolean,
): Promise<readonly FileCreationResult[]> => {
  const results: FileCreationResult[] = [];

  try {
    if (verbose) {
      log('info', `Loading templates for language: ${language}`);
    }

    // Load templates from repository
    const templateResult = await loadTemplatesFromRepository(language);

    if (!templateResult.success) {
      const errorResult: FileCreationResult = {
        success: false,
        path: `templates/${language}`,
        skipped: false,
        error: `Failed to load templates for ${language}: ${templateResult.error}`,
      };
      results.push(errorResult);
      return results;
    }

    logTemplateLoading(language, templateResult.templates.length);

    // Create files for each template
    for (const template of templateResult.templates) {
      const filePath = join(outputDir, language, template.fileName);

      try {
        const result = await createFileIfNotExists(filePath, template.content);
        results.push(result);

        if (verbose) {
          if (result.success) {
            if (result.skipped) {
              log('warning', `Skipped existing file: ${filePath}`);
            } else {
              log('success', `Created file: ${filePath}`);
            }
          } else {
            log('error', `Failed to create ${filePath}: ${result.error}`);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorResult: FileCreationResult = {
          success: false,
          path: filePath,
          skipped: false,
          error: `Error creating ${filePath}: ${errorMessage}`,
        };
        results.push(errorResult);
      }
    }

    return results;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorResult: FileCreationResult = {
      success: false,
      path: `language-${language}`,
      skipped: false,
      error: `Error generating files for ${language}: ${errorMessage}`,
    };
    results.push(errorResult);
    return results;
  }
};

/**
 * Main CLI function that orchestrates the prompt file generation
 */
const main = async (options: CliOptions): Promise<void> => {
  try {
    // Welcome message
    logWelcome();

    if (options.verbose) {
      log(
        'info',
        `Starting with options: ${JSON.stringify({
          outputDir: options.outputDir,
          languages: options.languages,
          verbose: options.verbose,
        })}`,
      );
    }

    // Create directory structure
    const directoryStructure = await createDirectoryStructure(
      options.outputDir,
      options.languages,
    );

    logDirectoryCreation(directoryStructure.baseDir, true);

    // Generate files for each language
    const allResults: FileCreationResult[] = [];

    for (const language of options.languages) {
      try {
        const languageResults = await generatePromptFiles(
          language,
          options.outputDir,
          options.verbose,
        );
        allResults.push(...languageResults);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorResult: FileCreationResult = {
          success: false,
          path: `language-${language}`,
          skipped: false,
          error: `Error processing ${language}: ${errorMessage}`,
        };
        allResults.push(errorResult);
      }
    }

    // Report results using the logger
    logResults(allResults);

    // Check if there were any errors and exit with appropriate code
    const hasErrors = allResults.some((result) => !result.success);
    if (hasErrors) {
      process.exit(1);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    log('error', `Fatal error: ${errorMessage}`);
    process.exit(1);
  }
};

/**
 * Setup and configure the CLI using Commander.js
 */
const setupCli = (): void => {
  const program = new Command();

  program
    .name('atman-prompts')
    .description(
      'CLI tool to generate prompt files in a structured directory format',
    )
    .version('0.1.0')
    .option(
      '-o, --output-dir <dir>',
      'output directory for prompt files',
      PROMPTS_CONFIG.baseDirectory,
    )
    .option(
      '-l, --languages <languages...>',
      'languages to generate (space-separated)',
      [...PROMPTS_CONFIG.supportedLanguages],
    )
    .option('-v, --verbose', 'enable verbose output', false)
    .action(async (options) => {
      const cliOptions: CliOptions = {
        outputDir: options.outputDir,
        languages: Array.isArray(options.languages)
          ? options.languages
          : PROMPTS_CONFIG.supportedLanguages,
        verbose: options.verbose,
      };

      try {
        await main(cliOptions);
      } catch (error) {
        console.error('Unexpected error:', error);
        process.exit(1);
      }
    });

  program.parse();
};

// Execute CLI if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCli();
}
