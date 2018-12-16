import readline from 'readline';
import { ReadlineAsyncIterator } from 'async-iterators-kit';

import CommandContext, { HelperCommand, HelperOptions } from './command-context';
import capabilitiesCmd from './command/capabilities.cmd';
import optionCmd from './command/option.cmd';
import listCmd from './command/list.cmd';
import pushCmd from './command/push.cmd';
import fetchCmd from './command/fetch.cmd';

export default async function run(options: {
    driver: any,
    input: NodeJS.ReadStream,
    output: NodeJS.WriteStream,
    verbosity: 0 | 1 | 2
}) {
    const handlers : HelperCommand[] = [
        capabilitiesCmd,
        optionCmd,
        listCmd,
        pushCmd,
        fetchCmd,
    ];

    const rl = readline.createInterface({
        input: options.input,
        crlfDelay: Infinity,
        prompt: '',
    });
    const iterator = new ReadlineAsyncIterator(rl);

    let helperOptions : HelperOptions = {
        verbosity: options.verbosity
    }

    for await (const line of iterator) {
        const handler = handlers.find(h => h.test(line));
        if (handler) {
            const output = handler.run(new CommandContext(line, helperOptions));
            output.forEach(out => {
                options.output.write(`${out}\n`);
            });
        } else if (line === '') {
            break;
        } else {
            throw new Error(`Fatal: Unsupported operation: ${line}`);
        }
    }
}
