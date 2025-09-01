import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createDirectoryStructure,
  ensureDirectoryExists,
} from './directory-manager';

describe('directory-manager', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'directory-manager-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('ensureDirectoryExists', () => {
    it('should create a directory when it does not exist', async () => {
      const testDir = join(tempDir, 'new-directory');

      const result = await ensureDirectoryExists(testDir);

      expect(result).toBe(true);
      const stats = await stat(testDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should return true when directory already exists', async () => {
      const testDir = join(tempDir, 'existing-directory');

      // Create directory first
      await ensureDirectoryExists(testDir);

      // Try to create it again
      const result = await ensureDirectoryExists(testDir);

      expect(result).toBe(true);
      const stats = await stat(testDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should create nested directories recursively', async () => {
      const nestedDir = join(tempDir, 'level1', 'level2', 'level3');

      const result = await ensureDirectoryExists(nestedDir);

      expect(result).toBe(true);
      const stats = await stat(nestedDir);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('createDirectoryStructure', () => {
    it('should create base directory and language subdirectories', async () => {
      const baseDir = join(tempDir, '.prompts');
      const languages = ['en', 'ja'] as const;

      const result = await createDirectoryStructure(baseDir, languages);

      expect(result.baseDir).toBe(baseDir);
      expect(result.languageDirs).toHaveLength(2);
      expect(result.languageDirs).toContain(join(baseDir, 'en'));
      expect(result.languageDirs).toContain(join(baseDir, 'ja'));

      // Verify directories actually exist
      const baseStats = await stat(baseDir);
      expect(baseStats.isDirectory()).toBe(true);

      const enStats = await stat(join(baseDir, 'en'));
      expect(enStats.isDirectory()).toBe(true);

      const jaStats = await stat(join(baseDir, 'ja'));
      expect(jaStats.isDirectory()).toBe(true);
    });

    it('should handle empty languages array', async () => {
      const baseDir = join(tempDir, '.prompts');
      const languages: readonly string[] = [];

      const result = await createDirectoryStructure(baseDir, languages);

      expect(result.baseDir).toBe(baseDir);
      expect(result.languageDirs).toHaveLength(0);

      // Base directory should still exist
      const baseStats = await stat(baseDir);
      expect(baseStats.isDirectory()).toBe(true);
    });

    it('should handle single language', async () => {
      const baseDir = join(tempDir, '.prompts');
      const languages = ['en'] as const;

      const result = await createDirectoryStructure(baseDir, languages);

      expect(result.baseDir).toBe(baseDir);
      expect(result.languageDirs).toHaveLength(1);
      expect(result.languageDirs[0]).toBe(join(baseDir, 'en'));

      // Verify directory exists
      const enStats = await stat(join(baseDir, 'en'));
      expect(enStats.isDirectory()).toBe(true);
    });

    it('should work when base directory already exists', async () => {
      const baseDir = join(tempDir, '.prompts');
      const languages = ['en', 'ja'] as const;

      // Create base directory first
      await ensureDirectoryExists(baseDir);

      const result = await createDirectoryStructure(baseDir, languages);

      expect(result.baseDir).toBe(baseDir);
      expect(result.languageDirs).toHaveLength(2);

      // Verify all directories exist
      const baseStats = await stat(baseDir);
      expect(baseStats.isDirectory()).toBe(true);

      const enStats = await stat(join(baseDir, 'en'));
      expect(enStats.isDirectory()).toBe(true);

      const jaStats = await stat(join(baseDir, 'ja'));
      expect(jaStats.isDirectory()).toBe(true);
    });
  });
});
