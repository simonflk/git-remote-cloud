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

    let helperOptions : HelperOptions = {
        verbosity: options.verbosity,
        input: options.input,
    };


    const context = new CommandContext(helperOptions)
    while (context.isConnected()) {
        let lines = [ await context.readLine() ];

        const handler = handlers.find(h => h.test(lines[0]));
        if (handler) {
            if (handler.batch) {
                lines = lines.concat(await context.readBatch());
            }

            const output = handler.run(context, lines);
            output.forEach(out => {
                options.output.write(`${out}\n`);
            });
            options.output.write('\n');
        } else if (lines[0] === '') {
            break;
        } else {
            throw new Error(`Fatal: Unsupported operation: ${lines[0]}`);
        }

    }

    context.stop();
}
