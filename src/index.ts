#!/usr/bin/env node

import { Command } from 'commander';
import { helloCommand } from './lib/commands/hello';
import { initCommand } from './lib/commands/init';

const program = new Command();

program
  .name('my-npx-command')
  .description('sample npx command')
  .version('0.1.0');

program.addCommand(initCommand);
program.addCommand(helloCommand);

program.parse(process.argv);
