import { HelperCommand } from '../types';

// Options Command
export default {
    test: line => line.startsWith('option'),
    run: (ctx, line) => {
        const matchOption = /option (\S+) (\S+)/;
        const [match = '', name = '', value = ''] = line.match(matchOption) || [];
        if (ctx.hasOption(name)) {
            ctx.setOption(name, Number(value));
            return ctx.write('ok');
        }
        ctx.write('unsupported');
    },
} as HelperCommand
