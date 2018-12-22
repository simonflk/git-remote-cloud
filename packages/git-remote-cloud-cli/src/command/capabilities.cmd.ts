import { HelperCommand } from '../command-context';

// Capabilities Command
export default {
    test: line => line === 'capabilities',
    run: (ctx, line) => ctx.write('option', 'push', 'fetch'),
} as HelperCommand;

