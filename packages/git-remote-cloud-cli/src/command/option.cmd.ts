import { HelperCommand } from '../command-context';

// Options Command
export default {
    test: line => line.startsWith('option'),
    run: (ctx, line) => {
        const matchOption = /option (\S+) (\S+)/;
        const [match = '', name = '', value = ''] = line.match(matchOption) || [];
        if (name === 'verbosity') {
            ctx.options[name] = Number(value);
            return ctx.write('ok');
        }
        ctx.write('unsupported');
    },
} as HelperCommand
