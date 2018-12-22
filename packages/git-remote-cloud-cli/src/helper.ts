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
        output: options.output,
    };

    const context = new CommandContext(helperOptions);

    try {
        while (context.isConnected()) {
            const line = await context.readLine();
            const handler = handlers.find(h => h.test(line));
            if (handler) {
                await handler.run(context, line);
                context.write('');
            } else if (line === '') {
                break;
            } else {
                throw new Error(`Fatal: Unsupported operation: ${line}`);
            }
        }
    } finally {
        context.stop();
    }

}
