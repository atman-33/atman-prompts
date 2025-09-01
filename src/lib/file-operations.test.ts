import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkFileExists, createFileIfNotExists } from './file-operations';

describe('file-operations', () => {
  let tempDir: string;
  let testFilePath: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await fs.mkdtemp(join(tmpdir(), 'file-ops-test-'));
    testFilePath = join(tempDir, 'test-file.txt');
  });

  afterEach(async () => {
    // Clean up temporary directory after each test
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('checkFileExists', () => {
    it('should return exists: true for existing files', async () => {
      // Create a test file
      await fs.writeFile(testFilePath, 'test content');

      const result = await checkFileExists(testFilePath);

      expect(result.exists).toBe(true);
      expect(result.path).toBe(testFilePath);
    });

    it('should return exists: false for non-existing files', async () => {
      const nonExistentPath = join(tempDir, 'non-existent.txt');

      const result = await checkFileExists(nonExistentPath);

      expect(result.exists).toBe(false);
      expect(result.path).toBe(nonExistentPath);
    });
  });

  describe('createFileIfNotExists', () => {
    it('should create file when it does not exist', async () => {
      const content = 'Hello, World!';

      const result = await createFileIfNotExists(testFilePath, content);

      expect(result.success).toBe(true);
      expect(result.path).toBe(testFilePath);
      expect(result.skipped).toBe(false);
      expect(result.error).toBeUndefined();

      // Verify file was actually created with correct content
      const fileContent = await fs.readFile(testFilePath, 'utf8');
      expect(fileContent).toBe(content);
    });

    it('should skip file creation when file exists', async () => {
      const originalContent = 'Original content';
      const newContent = 'New content';

      // Create file first
      await fs.writeFile(testFilePath, originalContent);

      const result = await createFileIfNotExists(testFilePath, newContent);

      expect(result.success).toBe(true);
      expect(result.path).toBe(testFilePath);
      expect(result.skipped).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify original content is preserved
      const fileContent = await fs.readFile(testFilePath, 'utf8');
      expect(fileContent).toBe(originalContent);
    });

    it('should handle file creation errors gracefully', async () => {
      // Try to create a file in a non-existent directory
      const invalidPath = join(tempDir, 'non-existent-dir', 'test.txt');

      const result = await createFileIfNotExists(invalidPath, 'content');

      expect(result.success).toBe(false);
      expect(result.path).toBe(invalidPath);
      expect(result.skipped).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });
  });
});
