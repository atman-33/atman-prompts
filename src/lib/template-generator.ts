import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Type definitions for template data structures
export type PromptTemplate = {
  readonly fileName: string;
  readonly content: string;
  readonly language: string;
};

export type TemplateLoadResult = {
  readonly success: boolean;
  readonly templates: readonly PromptTemplate[];
  readonly error?: string;
};

/**
 * Resolves the path to the templates directory within the package
 * @returns The absolute path to the templates directory
 */
export const getPackageTemplatesPath = (): string => {
  // Get the current file's directory and navigate to the templates folder
  const currentDir = dirname(fileURLToPath(import.meta.url));
  // Navigate from src/lib/ to templates/
  return join(currentDir, '..', '..', 'templates');
};

/**
 * Discovers all template files (.md) in a specific language directory
 * @param language - The language code (e.g., 'en', 'ja')
 * @returns Promise resolving to array of template file names
 */
export const discoverTemplateFiles = async (
  language: string,
): Promise<readonly string[]> => {
  try {
    const templatesPath = getPackageTemplatesPath();
    const languageDir = join(templatesPath, language);

    const files = await readdir(languageDir);

    // Filter for .md files only
    const templateFiles = files.filter((file) => file.endsWith('.md'));

    return templateFiles;
  } catch (_error) {
    // Return empty array if directory doesn't exist or can't be read
    return [];
  }
};

/**
 * Reads the content of a specific template file
 * @param templateName - The name of the template file (e.g., 'system-prompt.md')
 * @param language - The language code
 * @returns Promise resolving to the file content
 */
export const readTemplateFile = async (
  templateName: string,
  language: string,
): Promise<string> => {
  const templatesPath = getPackageTemplatesPath();
  const filePath = join(templatesPath, language, templateName);

  try {
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(
      `Failed to read template file ${templateName} for language ${language}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

/**
 * Loads all available templates from the repository for a specific language
 * @param language - The language code to load templates for
 * @returns Promise resolving to TemplateLoadResult with templates or error info
 */
export const loadTemplatesFromRepository = async (
  language: string,
): Promise<TemplateLoadResult> => {
  try {
    const templateFiles = await discoverTemplateFiles(language);

    if (templateFiles.length === 0) {
      return {
        success: false,
        templates: [],
        error: `No template files found for language: ${language}`,
      };
    }

    // Load content for each template file
    const templatePromises = templateFiles.map(
      async (fileName): Promise<PromptTemplate> => {
        const content = await readTemplateFile(fileName, language);
        return {
          fileName,
          content,
          language,
        };
      },
    );

    const templates = await Promise.all(templatePromises);

    return {
      success: true,
      templates,
    };
  } catch (error) {
    return {
      success: false,
      templates: [],
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred while loading templates',
    };
  }
};
