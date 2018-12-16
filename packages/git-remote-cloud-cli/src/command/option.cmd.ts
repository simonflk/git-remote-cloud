import { HelperCommand } from '../command-context';

// Options Command
export default {
    test: line => line.startsWith('option'),
    run: (ctx, lines) => {
        const matchOption = /option (\S+) (\S+)/;
        const [match = '', name = '', value = ''] = lines[0].match(matchOption) || [];
        if (name === 'verbosity') {
            ctx.options[name] = Number(value);
            return ['ok'];
        }
        return ['unsupported'];
    },
} as HelperCommand
