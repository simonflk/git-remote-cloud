import fs from 'fs';
import path from 'path';
import { CloudDriver, CloudDriverOptions } from 'git-remote-cloud-driver-base';

export default class FileSystemDriver implements CloudDriver {
    constructor(options: CloudDriverOptions) {
        this.token = options.token;
        this.root = options.root;
    }

    private token: string;
    private root: string;

    async list(path: string, forPush: boolean) {
        const iteratable = {
            [Symbol.asyncIterator]: async function* () {
                yield "todo"
            }
        }
        return iteratable;
    }

    async fetch(path: string) { return new Blob() }

    async put(path: string) { }

    async delete(path: string) { }
}
