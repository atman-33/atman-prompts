/**
 * Logging and user feedback utilities for the atman-prompts CLI tool.
 * Provides structured logging with different levels and result reporting.
 */

export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export type FileCreationResult = {
  readonly success: boolean;
  readonly path: string;
  readonly skipped: boolean;
  readonly error?: string;
};

/**
 * Log a message with the specified level and appropriate formatting.
 * Uses console methods with color coding for different log levels.
 */
export const log = (level: LogLevel, message: string): void => {
  const _timestamp = new Date().toISOString();

  switch (level) {
    case 'info':
      console.log(`ℹ️  ${message}`);
      break;
    case 'success':
      console.log(`✅ ${message}`);
      break;
    case 'warning':
      console.warn(`⚠️  ${message}`);
      break;
    case 'error':
      console.error(`❌ ${message}`);
      break;
  }
};

/**
 * Report the results of file creation operations with summary statistics.
 * Displays created files, skipped files, and any errors encountered.
 */
export const logResults = (results: readonly FileCreationResult[]): void => {
  const createdFiles = results.filter(
    (result) => result.success && !result.skipped,
  );
  const skippedFiles = results.filter((result) => result.skipped);
  const errorFiles = results.filter(
    (result) => !result.success && result.error,
  );

  // Log summary statistics
  log('info', `File generation completed: ${results.length} files processed`);

  if (createdFiles.length > 0) {
    log('success', `Created ${createdFiles.length} new prompt files:`);
    createdFiles.forEach((file) => {
      console.log(`  📄 ${file.path}`);
    });
  }

  if (skippedFiles.length > 0) {
    log(
      'warning',
      `Skipped ${skippedFiles.length} existing files (preserved):`,
    );
    skippedFiles.forEach((file) => {
      console.log(`  📋 ${file.path}`);
    });
  }

  if (errorFiles.length > 0) {
    log('error', `Failed to create ${errorFiles.length} files:`);
    errorFiles.forEach((file) => {
      console.log(`  💥 ${file.path}: ${file.error}`);
    });
  }

  // Final status message
  if (errorFiles.length === 0) {
    log('success', 'All operations completed successfully!');
  } else {
    log(
      'warning',
      `Completed with ${errorFiles.length} errors. Check the messages above for details.`,
    );
  }
};

/**
 * Log the start of the prompt generation process with welcome message.
 */
export const logWelcome = (): void => {
  log('info', 'Starting atman-prompts file generation...');
};

/**
 * Log directory creation status with appropriate messaging.
 */
export const logDirectoryCreation = (path: string, created: boolean): void => {
  if (created) {
    log('success', `Created directory: ${path}`);
  } else {
    log('info', `Directory already exists: ${path}`);
  }
};

/**
 * Log template loading status and count.
 */
export const logTemplateLoading = (language: string, count: number): void => {
  log('info', `Loaded ${count} template files for language: ${language}`);
};
