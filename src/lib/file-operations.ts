import { access, constants, promises as fs } from 'node:fs';
import { promisify } from 'node:util';

const accessAsync = promisify(access);

// Type definitions for file operations
export type FileCheckResult = {
  readonly exists: boolean;
  readonly path: string;
};

export type FileCreationResult = {
  readonly success: boolean;
  readonly path: string;
  readonly skipped: boolean;
  readonly error?: string;
};

/**
 * Check if a file exists at the specified path
 */
export const checkFileExists = async (
  filePath: string,
): Promise<FileCheckResult> => {
  try {
    await accessAsync(filePath, constants.F_OK);
    return {
      exists: true,
      path: filePath,
    };
  } catch {
    return {
      exists: false,
      path: filePath,
    };
  }
};

/**
 * Create a file with the specified content if it doesn't already exist
 * If the file exists, skip creation and return skipped: true
 */
export const createFileIfNotExists = async (
  filePath: string,
  content: string,
): Promise<FileCreationResult> => {
  try {
    // Check if file already exists
    const fileCheck = await checkFileExists(filePath);

    if (fileCheck.exists) {
      return {
        success: true,
        path: filePath,
        skipped: true,
      };
    }

    // Create the file with the provided content
    await fs.writeFile(filePath, content, 'utf8');

    return {
      success: true,
      path: filePath,
      skipped: false,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      success: false,
      path: filePath,
      skipped: false,
      error: errorMessage,
    };
  }
};
