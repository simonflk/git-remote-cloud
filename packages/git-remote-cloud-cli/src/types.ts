import { CloudDriver, GitRef } from 'git-remote-cloud-driver-base';
export * from 'git-remote-cloud-driver-base';

export interface HelperOptions {
    driver: CloudDriver,
    verbosity: 0 | 1 | 2,
    input: NodeJS.ReadStream,
    output: NodeJS.WriteStream,
}

export interface HelperCommand {
    test(line: string): boolean,
    run(ctx: CommandContext, line: string): void,
}

export interface CommandContext {
    driver: CloudDriver
    cache: ObjectCache
    logger(level: number, message: string) : void
    hasOption(opt: string) : boolean
    setOption(opt: string, val: any) : void
    readLine() : Promise<string>
    readBatch() : Promise<string[]>
    write(...lines: string[]) : void
    isConnected(): boolean
    stop(): void
}

export interface ObjectCache {
    refs: Map<string,GitRef>,
    pushed: Map<string,string>,
}
