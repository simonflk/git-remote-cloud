import { HelperCommand } from '../command-context';

// push Command
export default {
    test: line => line.startsWith('push'),
    run: (ctx, lines) => ['todo'],
    batch: true,
} as HelperCommand;

