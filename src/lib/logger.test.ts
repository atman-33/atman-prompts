import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileCreationResult } from './logger.js';
import {
  log,
  logDirectoryCreation,
  logResults,
  logTemplateLoading,
  logWelcome,
} from './logger.js';

describe('logger', () => {
  let mockConsoleLog: ReturnType<typeof vi.spyOn>;
  let mockConsoleWarn: ReturnType<typeof vi.spyOn>;
  let mockConsoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log', () => {
    it('should log info messages with info icon', () => {
      log('info', 'Test info message');

      expect(mockConsoleLog).toHaveBeenCalledWith('ℹ️  Test info message');
    });

    it('should log success messages with success icon', () => {
      log('success', 'Test success message');

      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Test success message');
    });

    it('should log warning messages with warning icon', () => {
      log('warning', 'Test warning message');

      expect(mockConsoleWarn).toHaveBeenCalledWith('⚠️  Test warning message');
    });

    it('should log error messages with error icon', () => {
      log('error', 'Test error message');

      expect(mockConsoleError).toHaveBeenCalledWith('❌ Test error message');
    });
  });

  describe('logResults', () => {
    it('should log results for successful file creation', () => {
      const results: FileCreationResult[] = [
        { success: true, path: '.prompts/en/test1.md', skipped: false },
        { success: true, path: '.prompts/ja/test1.md', skipped: false },
      ];

      logResults(results);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'ℹ️  File generation completed: 2 files processed',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ Created 2 new prompt files:',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('  📄 .prompts/en/test1.md');
      expect(mockConsoleLog).toHaveBeenCalledWith('  📄 .prompts/ja/test1.md');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ All operations completed successfully!',
      );
    });

    it('should log results for skipped files', () => {
      const results: FileCreationResult[] = [
        { success: true, path: '.prompts/en/test1.md', skipped: true },
        { success: true, path: '.prompts/ja/test1.md', skipped: false },
      ];

      logResults(results);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'ℹ️  File generation completed: 2 files processed',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ Created 1 new prompt files:',
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '⚠️  Skipped 1 existing files (preserved):',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('  📋 .prompts/en/test1.md');
    });

    it('should log results for failed file creation', () => {
      const results: FileCreationResult[] = [
        {
          success: false,
          path: '.prompts/en/test1.md',
          skipped: false,
          error: 'Permission denied',
        },
        { success: true, path: '.prompts/ja/test1.md', skipped: false },
      ];

      logResults(results);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'ℹ️  File generation completed: 2 files processed',
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to create 1 files:',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '  💥 .prompts/en/test1.md: Permission denied',
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '⚠️  Completed with 1 errors. Check the messages above for details.',
      );
    });

    it('should handle mixed results with all types', () => {
      const results: FileCreationResult[] = [
        { success: true, path: '.prompts/en/created.md', skipped: false },
        { success: true, path: '.prompts/en/skipped.md', skipped: true },
        {
          success: false,
          path: '.prompts/en/failed.md',
          skipped: false,
          error: 'Disk full',
        },
      ];

      logResults(results);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'ℹ️  File generation completed: 3 files processed',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ Created 1 new prompt files:',
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '⚠️  Skipped 1 existing files (preserved):',
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to create 1 files:',
      );
    });

    it('should handle empty results array', () => {
      const results: FileCreationResult[] = [];

      logResults(results);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'ℹ️  File generation completed: 0 files processed',
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ All operations completed successfully!',
      );
    });
  });

  describe('logWelcome', () => {
    it('should log welcome message', () => {
      logWelcome();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'ℹ️  Starting atman-prompts file generation...',
      );
    });
  });

  describe('logDirectoryCreation', () => {
    it('should log success message for newly created directory', () => {
      logDirectoryCreation('.prompts', true);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '✅ Created directory: .prompts',
      );
    });

    it('should log info message for existing directory', () => {
      logDirectoryCreation('.prompts', false);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'ℹ️  Directory already exists: .prompts',
      );
    });
  });

  describe('logTemplateLoading', () => {
    it('should log template loading status with count', () => {
      logTemplateLoading('en', 4);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'ℹ️  Loaded 4 template files for language: en',
      );
    });

    it('should handle zero templates', () => {
      logTemplateLoading('ja', 0);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'ℹ️  Loaded 0 template files for language: ja',
      );
    });
  });
});
