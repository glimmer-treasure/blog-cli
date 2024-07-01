import getAddCommand from './addBlog.js'

import { Command } from 'commander';
const program = new Command();

program.addCommand(getAddCommand());
await program.parseAsync(process.argv);