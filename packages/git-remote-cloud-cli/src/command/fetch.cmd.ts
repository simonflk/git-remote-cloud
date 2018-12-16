import { HelperCommand } from '../command-context';

// Fetch Command
export default {
    test: line => line.startsWith('fetch'),
    run: (ctx, lines) => ['todo'],
    batch: true,
} as HelperCommand;

