import readline from 'readline';
import { ReadlineAsyncIterator } from 'async-iterators-kit';

import * as types from './types';

export default class CommandContext implements types.CommandContext {
    constructor(
        options: types.HelperOptions,
    ) {
        this.rl = readline.createInterface({
            input: options.input,
            crlfDelay: Infinity,
            prompt: '',
        });
        this.driver = options.driver;
        this.output = options.output;
        this.iterator = new ReadlineAsyncIterator(this.rl);
        this.options = {
            verbosity: options.verbosity
        };
        this.done = false;
    }

    private options: { verbosity: 0 | 1 | 2 };
    private output: NodeJS.WriteStream;
    private done: boolean;
    private iterator: ReadlineAsyncIterator;
    private rl: readline.Interface;

    public driver: types.CloudDriver;

    logger = (level: number, message: string = '') => {
        if (level <= this.options.verbosity) {
            console.error(message);
        }
    }

    hasOption(opt: string) : boolean {
        return opt in this.options;
    }

    setOption(opt: string, val: any) {
        (this.options as any)[opt] = val;
    }

    async readLine() : Promise<string> {
        const { value, done } = await this.iterator.next();
        this.done = done;
        return value;
    }

    async readBatch() : Promise<string[]> {
        let lines = [];
        while(true) {
            const line = await this.readLine();
            if (line === '') {
                break;
            } else {
                lines.push(line);
            }
        }
        return lines;
    }

    write(...lines: string[]) : void {
        if (lines.length === 0) {
            this.output.write('');
        }
        lines.forEach(out => {
            this.output.write(`${out}\n`);
        });
    }

    isConnected(): boolean {
        return !this.done;
    }

    stop(): void {
        this.rl.close();
    }
}
