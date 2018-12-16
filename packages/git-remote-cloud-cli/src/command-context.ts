import readline from 'readline';
import { ReadlineAsyncIterator } from 'async-iterators-kit';
export interface HelperOptions {
    verbosity: number,
    input: NodeJS.ReadStream,
}

export interface HelperCommand {
    test(line: string): boolean,
    run(ctx: CommandContext, lines: string[]): string[],
    batch?: boolean,
}

export default class CommandContext {
    constructor(
        public options: HelperOptions,
    ) {
        this.rl = readline.createInterface({
            input: options.input,
            crlfDelay: Infinity,
            prompt: '',
        });
        this.iterator = new ReadlineAsyncIterator(this.rl);
        this.options = options;
        this.done = false;
    }

    private done: boolean;
    private iterator: ReadlineAsyncIterator;
    private rl: readline.Interface;

    logger = (level: number, message: string = '') => {
        if (level <= this.options.verbosity) {
            console.error(message);
        }
    }

    async readLine() : Promise<string> {
        const { value, done } = await this.iterator.next();
        this.done = done;
        return value;
    }

    async readBatch() : Promise<string[]> {
        let lines = [];
        let done = false;
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

    isConnected(): boolean {
        return !this.done;
    }

    stop(): void {
        this.rl.close();
    }
}
