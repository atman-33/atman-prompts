import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

type DirectoryStructure = {
  readonly baseDir: string;
  readonly languageDirs: readonly string[];
};

/**
 * Ensures a directory exists by creating it if it doesn't exist
 * @param dirPath - The path to the directory to create
 * @returns Promise<boolean> - true if directory was created or already exists
 */
const ensureDirectoryExists = async (dirPath: string): Promise<boolean> => {
  try {
    await mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    // If the error is that the directory already exists, that's fine
    if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
      return true;
    }
    throw error;
  }
};

/**
 * Creates the complete directory structure for prompts with language subdirectories
 * @param baseDir - The base directory name (e.g., '.prompts')
 * @param languages - Array of language codes (e.g., ['en', 'ja'])
 * @returns Promise<DirectoryStructure> - The created directory structure
 */
const createDirectoryStructure = async (
  baseDir: string,
  languages: readonly string[],
): Promise<DirectoryStructure> => {
  // Create the base directory
  await ensureDirectoryExists(baseDir);

  // Create language subdirectories
  const languageDirs = await Promise.all(
    languages.map(async (lang) => {
      const langDir = join(baseDir, lang);
      await ensureDirectoryExists(langDir);
      return langDir;
    }),
  );

  return {
    baseDir,
    languageDirs,
  };
};

export { createDirectoryStructure, ensureDirectoryExists };
export type { DirectoryStructure };
