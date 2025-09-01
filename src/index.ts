#!/usr/bin/env node

import { join } from 'node:path';
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
 * Parse command line arguments and return CLI options
 */
const parseArguments = (args: readonly string[]): CliOptions => {
  // For now, use default values as per requirements
  // Future enhancement could add argument parsing with commander
  return {
    outputDir: PROMPTS_CONFIG.baseDirectory,
    languages: PROMPTS_CONFIG.supportedLanguages,
    verbose: false,
  };
};

/**
 * Generate prompt files for a specific language
 */
const generatePromptFiles = async (
  language: string,
  outputDir: string,
): Promise<readonly string[]> => {
  const createdFiles: string[] = [];
  const skippedFiles: string[] = [];
  const errors: string[] = [];

  try {
    // Load templates from repository
    const templateResult = await loadTemplatesFromRepository(language);

    if (!templateResult.success) {
      errors.push(
        `Failed to load templates for ${language}: ${templateResult.error}`,
      );
      return [];
    }

    // Create files for each template
    for (const template of templateResult.templates) {
      const filePath = join(outputDir, language, template.fileName);

      try {
        const result = await createFileIfNotExists(filePath, template.content);

        if (result.success) {
          if (result.skipped) {
            skippedFiles.push(filePath);
          } else {
            createdFiles.push(filePath);
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

    return createdFiles;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Error generating files for ${language}: ${errorMessage}`);
    return [];
  }
};

/**
 * Main CLI function that orchestrates the prompt file generation
 */
const main = async (options: CliOptions): Promise<void> => {
  try {
    console.log('🚀 Generating prompt files...');

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
        const createdFiles = await generatePromptFiles(
          language,
          options.outputDir,
        );
        allCreatedFiles.push(...createdFiles);
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
      for (const file of result.createdFiles) {
        console.log(`   - ${file}`);
      }
    }

    if (result.skippedFiles.length > 0) {
      console.log(`⏭️  Skipped ${result.skippedFiles.length} existing files:`);
      for (const file of result.skippedFiles) {
        console.log(`   - ${file}`);
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

// Execute CLI if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArguments(process.argv.slice(2));
  main(options).catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
