import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  discoverTemplateFiles,
  getPackageTemplatesPath,
  loadTemplatesFromRepository,
  type PromptTemplate,
  readTemplateFile,
} from './template-generator.js';

describe('template-generator', () => {
  describe('getPackageTemplatesPath', () => {
    it('should return a path ending with templates', () => {
      const templatesPath = getPackageTemplatesPath();
      expect(templatesPath).toMatch(/templates$/);
    });

    it('should return an absolute path', () => {
      const templatesPath = getPackageTemplatesPath();
      expect(templatesPath).toMatch(/^[/\\]|^[a-zA-Z]:[/\\]/); // Unix or Windows absolute path
    });
  });

  describe('discoverTemplateFiles', () => {
    it('should discover existing template files for English', async () => {
      const files = await discoverTemplateFiles('en');

      expect(files).toBeInstanceOf(Array);
      expect(files.length).toBeGreaterThan(0);

      // Check that all files are .md files
      files.forEach((file) => {
        expect(file).toMatch(/\.md$/);
      });
    });

    it('should discover existing template files for Japanese', async () => {
      const files = await discoverTemplateFiles('ja');

      expect(files).toBeInstanceOf(Array);
      expect(files.length).toBeGreaterThan(0);

      // Check that all files are .md files
      files.forEach((file) => {
        expect(file).toMatch(/\.md$/);
      });
    });

    it('should return empty array for non-existent language', async () => {
      const files = await discoverTemplateFiles('nonexistent');
      expect(files).toEqual([]);
    });

    it('should filter out non-markdown files', async () => {
      const files = await discoverTemplateFiles('en');

      // All returned files should be .md files
      const nonMarkdownFiles = files.filter((file) => !file.endsWith('.md'));
      expect(nonMarkdownFiles).toHaveLength(0);
    });
  });

  describe('readTemplateFile', () => {
    it('should read existing template file content', async () => {
      const content = await readTemplateFile('system-prompt.md', 'en');

      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('System Prompt Template');
    });

    it('should read Japanese template file content', async () => {
      const content = await readTemplateFile('system-prompt.md', 'ja');

      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('システムプロンプトテンプレート');
    });

    it('should throw error for non-existent template file', async () => {
      await expect(readTemplateFile('nonexistent.md', 'en')).rejects.toThrow(
        /Failed to read template file/,
      );
    });

    it('should throw error for non-existent language', async () => {
      await expect(
        readTemplateFile('system-prompt.md', 'nonexistent'),
      ).rejects.toThrow(/Failed to read template file/);
    });
  });

  describe('loadTemplatesFromRepository', () => {
    it('should load all English templates successfully', async () => {
      const result = await loadTemplatesFromRepository('en');

      expect(result.success).toBe(true);
      expect(result.templates).toBeInstanceOf(Array);
      expect(result.templates.length).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();

      // Check template structure
      result.templates.forEach((template: PromptTemplate) => {
        expect(template).toHaveProperty('fileName');
        expect(template).toHaveProperty('content');
        expect(template).toHaveProperty('language');
        expect(template.language).toBe('en');
        expect(template.fileName).toMatch(/\.md$/);
        expect(typeof template.content).toBe('string');
        expect(template.content.length).toBeGreaterThan(0);
      });
    });

    it('should load all Japanese templates successfully', async () => {
      const result = await loadTemplatesFromRepository('ja');

      expect(result.success).toBe(true);
      expect(result.templates).toBeInstanceOf(Array);
      expect(result.templates.length).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();

      // Check template structure
      result.templates.forEach((template: PromptTemplate) => {
        expect(template).toHaveProperty('fileName');
        expect(template).toHaveProperty('content');
        expect(template).toHaveProperty('language');
        expect(template.language).toBe('ja');
        expect(template.fileName).toMatch(/\.md$/);
        expect(typeof template.content).toBe('string');
        expect(template.content.length).toBeGreaterThan(0);
      });
    });

    it('should return error result for non-existent language', async () => {
      const result = await loadTemplatesFromRepository('nonexistent');

      expect(result.success).toBe(false);
      expect(result.templates).toEqual([]);
      expect(result.error).toContain(
        'No template files found for language: nonexistent',
      );
    });

    it('should include expected template files', async () => {
      const result = await loadTemplatesFromRepository('en');

      expect(result.success).toBe(true);

      const fileNames = result.templates.map((t) => t.fileName);
      expect(fileNames).toContain('system-prompt.md');
      expect(fileNames).toContain('code-review.md');
      expect(fileNames).toContain('documentation.md');
      expect(fileNames).toContain('debugging.md');
    });

    it('should load template content correctly', async () => {
      const result = await loadTemplatesFromRepository('en');

      expect(result.success).toBe(true);

      const systemPromptTemplate = result.templates.find(
        (t) => t.fileName === 'system-prompt.md',
      );
      expect(systemPromptTemplate).toBeDefined();
      expect(systemPromptTemplate?.content).toContain('System Prompt Template');
      expect(systemPromptTemplate?.content).toContain('Core Principles');
    });
  });
});
