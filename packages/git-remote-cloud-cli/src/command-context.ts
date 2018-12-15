export interface HelperOptions {
    verbosity: number,
}

export interface HelperCommand {
    test(line: string): boolean,
    run(ctx: CommandContext): string[],
}

export default class CommandContext {
    constructor(
        public input: string,
        public options: HelperOptions,
    ) {
        this.input = input;
        this.options = options;
    }

    logger = (level: number, message: string = '') => {
        if (level <= this.options.verbosity) {
            console.error(message);
        }
    }
}
