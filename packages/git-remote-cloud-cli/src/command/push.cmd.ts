import { HelperCommand } from '../command-context';

// push Command
export default {
    test: line => line.startsWith('push'),
    run: ctx => ['todo'],
} as HelperCommand;

