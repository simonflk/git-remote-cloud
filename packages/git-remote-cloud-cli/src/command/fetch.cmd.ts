import { HelperCommand } from '../command-context';

// Fetch Command
export default {
    test: line => line.startsWith('fetch'),
    run: async (ctx, line) => {
        const lines = [line].concat(await ctx.readBatch());
        ctx.write(`todo: ${JSON.stringify(lines)}`);
    }
} as HelperCommand;

