import { HelperCommand } from '../command-context';

// list Command
export default {
    test: line => line.startsWith('list'),
    run: (ctx, lines) => ['todo'],
} as HelperCommand;

