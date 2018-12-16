import { HelperCommand } from '../command-context';

// Capabilities Command
export default {
    test: line => line === 'capabilities',
    run: (ctx, lines) => ['option', 'push', 'fetch'],
} as HelperCommand;

