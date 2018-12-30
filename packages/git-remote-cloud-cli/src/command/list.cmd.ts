import { HelperCommand } from '../types';

// list Command
export default {
    test: line => line.startsWith('list'),
    run: async (ctx, line) => {
        const forPush = line.includes('for-push');
        const files = await ctx.driver.list('refs', forPush);
        for await (const file of files) {
            ctx.cache.refs.set(file.name, file);
            ctx.write(`${file.sha} ${file.name}`);
        }
        ctx.write();

    },
} as HelperCommand;

