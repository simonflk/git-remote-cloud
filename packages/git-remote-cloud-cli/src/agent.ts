import readline from 'readline';

import CommandContext, { HelperCommand, HelperOptions } from './command-context';

import capabilitiesCmd from './command/capabilities.cmd';
import optionCmd from './command/option.cmd';
import listCmd from './command/list.cmd';
import pushCmd from './command/push.cmd';
import fetchCmd from './command/fetch.cmd';

interface RunnerOptions {
    url: string,
    input: NodeJS.ReadStream,
    output: NodeJS.WriteStream,
    verbosity: 0 | 1 | 2
}

export default function run(options: RunnerOptions) {
    const handlers : HelperCommand[] = [
        capabilitiesCmd,
        optionCmd,
        listCmd,
        pushCmd,
        fetchCmd,
    ];

    const io = readline.createInterface({
        input: options.input,
        output: options.output,
        crlfDelay: Infinity,
        prompt: '',
    });

    let helperOptions : HelperOptions = {
        verbosity: options.verbosity
    }

    io.on('line', (line: string) => {
        const handler = handlers.find(h => h.test(line));
        if (handler) {
            const output = handler.run(new CommandContext(line, helperOptions));
            output.forEach(out => {
                options.output.write(`${out}\n`);
            });
        } else if (line === '') {
            io.close();
        } else {
            throw new Error(`Fatal: Unsupported operation: ${line}`);
        }
    });

    io.on('close', () => {
        // cleanup
    })
}

run({
    url: 'foo',
    input: process.stdin,
    output: process.stdout,
    verbosity: 1
})
