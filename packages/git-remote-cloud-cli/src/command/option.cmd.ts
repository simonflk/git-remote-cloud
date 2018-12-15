import { HelperCommand } from '../command-context';

// Options Command
export default {
    test: line => line.startsWith('option'),
    run: ctx => {
        const matchOption = /option (\S+) (\S+)/;
        const [match = '', name = '', value = ''] = ctx.input.match(matchOption) || [];
        if (name === 'verbosity') {
            ctx.options[name] = Number(value);
            return ['ok'];
        }
        return ['unsupported'];
    },
} as HelperCommand
