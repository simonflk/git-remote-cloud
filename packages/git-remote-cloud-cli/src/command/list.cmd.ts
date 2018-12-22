import { HelperCommand } from '../command-context';

// list Command
export default {
    test: line => line.startsWith('list'),
    run: (ctx, line) => ctx.write(`todo: ${line}`),
} as HelperCommand;

