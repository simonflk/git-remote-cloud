import { resolve as resolvePath } from 'path';
import { promisify } from 'util';
import walk from 'rfc-walk';
import _ from 'highland';

import { CloudDriver, CloudDriverOptions, GitRef } from 'git-remote-cloud-driver-base';

const readFileAsync = promisify(require('fs').readFile);
const unlinkAsync = promisify(require('fs').unlink);

export default class FileSystemDriver implements CloudDriver {
    constructor(options: CloudDriverOptions) {
        this.root = options.root;
    }

    private root: string;

    async list(path: string, forPush: boolean) {
        let complete = false;
        let refs: GitRef[] = [];

        const fileStream: Highland.Stream<string> = _(
            (push, next) => {
                walk({
                    root: resolvePath(this.root, path),
                    includeFolders: false,
                    onPath: async (filePath) => {
                        push(null, filePath);
                        next();
                    }
                }).then(() => {push(null, _.nil)});
            }
        );

        const refStream: Highland.Stream<GitRef> = fileStream.map(
            async (filePath: string) => ({
                sha: (await readFileAsync(filePath, {encoding: 'utf8'})).trim(),
                name: filePath
            })
        ).flatten();

        refStream
            .observe()
            .done(() => { complete = true });

        const getNextRef = (): Promise<GitRef|Highland.Nil> => new Promise(
            (resolve, reject) => refStream.pull((err, ref) => {
                if (err) reject(err);
                resolve(ref);
            })
        );

        const iteratable = {
            [Symbol.asyncIterator]: async function* () : AsyncIterator<GitRef> {
                while (true) {
                    const next = await getNextRef();
                    if (next === _.nil) {
                        break;
                    } else {
                        yield next as GitRef;
                    }
                }
            }
        }

        return iteratable;
    }

    async fetch(path: string) {
        const filePath = resolvePath(this.root, path);
        return await readFileAsync(filePath, {encoding: 'utf8'});
    }

    async write(path: string, data: Buffer) { }

    async update(path: string, data: Buffer, version?: string) { }

    async delete(path: string) {
        return await unlinkAsync(resolvePath(this.root, path));
    }
}
