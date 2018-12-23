export interface CloudDriverOptions {
    token: string,
    root: string
}

export interface GitRef {
    sha: string,
    name: string
}

export interface CloudDriver {
    list(path: string, forPush: boolean): Promise<AsyncIterable<GitRef>>
    fetch(path: string): Promise<Blob>
    put(path: string, data: Blob): Promise<undefined | void>
    delete(path: string): Promise<undefined | void>
}

export interface CloudDriverConstructor {
    new(options: CloudDriverOptions): CloudDriver
}
