import { HelperCommand } from '../command-context';

// push Command
export default {
    test: line => line.startsWith('push'),
    run: async (ctx, line) => {
        const lines = [line].concat(await ctx.readBatch());
        ctx.write(`todo: ${JSON.stringify(lines)}`);
    }
} as HelperCommand;

