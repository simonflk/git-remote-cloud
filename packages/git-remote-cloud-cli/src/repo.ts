import zlib from 'zlib';
import pMap from 'p-map';
import path from 'path';
import { promisify } from 'util';
import SimpleGit from 'simple-git/promise';

import * as types from './types';

const inflate = promisify(zlib.inflate);
const deflate = promisify(zlib.deflate);

export default class Repository implements types.GitRepository {

    private git: SimpleGit.SimpleGit;

    constructor() {
        this.git = SimpleGit();
    }

    async listObjects(ref: string, excludeRefs: string[]) {
        const objects = await this.git.raw([
            'rev-list',
            '--objects',
            ref,
            '--exlude',
            ...await this.buildExcludeList(excludeRefs),
        ]);
        return objects.split(/\n/).map(line => line.split(/\s+/)[0]);
    }

    async encodeObject(ref: string): Promise<Buffer> {
        const [kind, size] = await Promise.all([
            this.getObjectKind(ref),
            this.git.catFile(['-s', ref])
        ]);
        const contents = await this.getObjectContents(ref, kind);
        const data = Buffer.from(`${kind} ${size}\0${contents}`, 'utf8');
        return await deflate(data) as Buffer;
    }

    getObjectPath(sha: string): string {
        return path.join('objects', sha.substr(0, 2), sha.substr(2));
    }

    getRefPath(ref: string): string {
        return path.join('refs', ref);
    }

    async getRefValue(ref: string): Promise<string> {
        return await this.git.revparse([ref]);
    }

    private async getObjectKind(ref: string): Promise<string> {
        return await this.git.catFile(['-t', ref]);
    }

    private async getObjectContents(ref: string, kind?: string): Promise<string> {
        return await this.git.catFile([
            kind || '-p',
            ref
        ]);
    }

    async objectExists(sha: string): Promise<boolean> {
        try {
            await this.git.catFile(['-e', sha]);
            return true;
        } catch(e) {
            return false;
        }
    }

    async isAncestor(ancestor: string, ref: string): Promise<boolean> {
        try {
            await this.git.raw(['merge-base', '--is-ancestor', ancestor, ref]);
            return true;
        } catch(e) {
            return false;
        }
    }

    private async buildExcludeList(excludeRefs: string[] = []): Promise<string[]> {
        const mapper = async (ref: string) => ({ ref, exists: await this.objectExists(ref) });
        const mapped = await pMap(excludeRefs, mapper, { concurrency: 5 });
        const exists = mapped.reduce(
            (state: string[], { exists, ref }) => exists ? [...state, `^${ref}`] : state,
            []
        );
        return exists;
    }
}
