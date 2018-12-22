import { HelperCommand } from '../types';

// list Command
export default {
    test: line => line.startsWith('list'),
    run: (ctx, line) => {
        const forPush = line.includes('for-push');
        ctx.write(`todo: ${line}`)
    },
} as HelperCommand;

