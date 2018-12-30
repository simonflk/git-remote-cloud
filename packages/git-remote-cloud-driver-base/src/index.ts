export interface CloudDriverOptions {
    token: string,
    root: string
}

export interface GitRef {
    sha: string,
    name: string,
    version?: string,
}

export interface CloudDriver {
    list(path: string, forPush: boolean): Promise<AsyncIterable<GitRef>>
    fetch(path: string): Promise<Buffer>
    write(path: string, data: Buffer|string): Promise<undefined | void>
    update(path: string, data: Buffer|string, version?: string): Promise<undefined | void>
    delete(path: string): Promise<undefined | void>
}

export interface CloudDriverConstructor {
    new(options: CloudDriverOptions): CloudDriver
}
