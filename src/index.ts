#!/usr/bin/env node

import { join } from 'node:path';
import { Command } from 'commander';
import { createDirectoryStructure } from './lib/directory-manager.js';
import { createFileIfNotExists } from './lib/file-operations.js';
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
): Promise<{
  createdFiles: readonly string[];
  skippedFiles: readonly string[];
  errors: readonly string[];
}> => {
  const createdFiles: string[] = [];
  const skippedFiles: string[] = [];
  const errors: string[] = [];

  try {
    if (verbose) {
      console.log(`📝 Loading templates for language: ${language}`);
    }

    // Load templates from repository
    const templateResult = await loadTemplatesFromRepository(language);

    if (!templateResult.success) {
      errors.push(
        `Failed to load templates for ${language}: ${templateResult.error}`,
      );
      return { createdFiles, skippedFiles, errors };
    }

    if (verbose) {
      console.log(
        `📋 Found ${templateResult.templates.length} templates for ${language}`,
      );
    }

    // Create files for each template
    for (const template of templateResult.templates) {
      const filePath = join(outputDir, language, template.fileName);

      try {
        const result = await createFileIfNotExists(filePath, template.content);

        if (result.success) {
          if (result.skipped) {
            skippedFiles.push(filePath);
            if (verbose) {
              console.log(`⏭️  Skipped existing file: ${filePath}`);
            }
          } else {
            createdFiles.push(filePath);
            if (verbose) {
              console.log(`✅ Created file: ${filePath}`);
            }
          }
        } else {
          errors.push(`Failed to create ${filePath}: ${result.error}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Error creating ${filePath}: ${errorMessage}`);
      }
    }

    return { createdFiles, skippedFiles, errors };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Error generating files for ${language}: ${errorMessage}`);
    return { createdFiles, skippedFiles, errors };
  }
};

/**
 * Main CLI function that orchestrates the prompt file generation
 */
const main = async (options: CliOptions): Promise<void> => {
  try {
    if (options.verbose) {
      console.log('🚀 Starting prompt file generation with options:', {
        outputDir: options.outputDir,
        languages: options.languages,
        verbose: options.verbose,
      });
    } else {
      console.log('🚀 Generating prompt files...');
    }

    // Create directory structure
    const directoryStructure = await createDirectoryStructure(
      options.outputDir,
      options.languages,
    );

    console.log(
      `📁 Created directory structure: ${directoryStructure.baseDir}`,
    );

    // Generate files for each language
    const allCreatedFiles: string[] = [];
    const allSkippedFiles: string[] = [];
    const allErrors: string[] = [];

    for (const language of options.languages) {
      try {
        const result = await generatePromptFiles(
          language,
          options.outputDir,
          options.verbose,
        );
        allCreatedFiles.push(...result.createdFiles);
        allSkippedFiles.push(...result.skippedFiles);
        allErrors.push(...result.errors);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        allErrors.push(`Error processing ${language}: ${errorMessage}`);
      }
    }

    // Report results
    const result: GenerationResult = {
      totalFiles: allCreatedFiles.length + allSkippedFiles.length,
      createdFiles: allCreatedFiles,
      skippedFiles: allSkippedFiles,
      errors: allErrors,
    };

    if (result.createdFiles.length > 0) {
      console.log(`✅ Created ${result.createdFiles.length} prompt files:`);
      if (!options.verbose) {
        for (const file of result.createdFiles) {
          console.log(`   - ${file}`);
        }
      }
    }

    if (result.skippedFiles.length > 0) {
      console.log(`⏭️  Skipped ${result.skippedFiles.length} existing files:`);
      if (!options.verbose) {
        for (const file of result.skippedFiles) {
          console.log(`   - ${file}`);
        }
      }
    }

    if (result.errors.length > 0) {
      console.error(`❌ Encountered ${result.errors.length} errors:`);
      for (const error of result.errors) {
        console.error(`   - ${error}`);
      }
      process.exit(1);
    }

    console.log('🎉 Prompt file generation completed successfully!');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`❌ Fatal error: ${errorMessage}`);
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
