import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import type { Config } from './init';

export const helloCommand = new Command('hello')
  .description('Say hello to someone.')
  .action(() => {
    const filePath = path.resolve(process.cwd(), 'my-npx-config.json');

    if (!fs.existsSync(filePath)) {
      console.error(`Configuration file not found at ${filePath}`);
      process.exit(1);
    }

    const config: Config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Hello, ${config.name}!`);
  });
