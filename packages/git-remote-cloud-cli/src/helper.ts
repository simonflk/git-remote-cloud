import CommandContext from './command-context';
import capabilitiesCmd from './command/capabilities.cmd';
import optionCmd from './command/option.cmd';
import listCmd from './command/list.cmd';
import pushCmd from './command/push.cmd';
import fetchCmd from './command/fetch.cmd';

import { HelperCommand, HelperOptions } from './types';

export default async function run(options: HelperOptions) {
    const handlers : HelperCommand[] = [
        capabilitiesCmd,
        optionCmd,
        listCmd,
        pushCmd,
        fetchCmd,
    ];

    const context = new CommandContext(options);

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
