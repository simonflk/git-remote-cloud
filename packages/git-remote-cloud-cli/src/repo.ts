import zlib from 'zlib';
import pMap from 'p-map';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';

import * as types from './types';

const inflate = promisify(zlib.inflate);
const deflate = promisify(zlib.deflate);

export async function execGit (args: string[] = [], options = {}) : Promise<execa.ExecaReturns>{
    return await execa('git', args, options);
}

export async function listObjects(ref: string, excludeRefs: string[]) {
    const { stdout } = await execGit([
        'rev-list',
        '--objects',
        ref,
        '--exlude',
        ...await buildExcludeList(excludeRefs),
    ]);
    return stdout.split(/\n/).map(line => line.split(/\s+/)[0]);
}

export async function encodeObject(ref: string): Promise<Buffer> {
    const [kind, size] = await Promise.all([
        getObjectKind(ref),
        getObjectSize(ref),
    ]);
    const contents = await getObjectContents(ref, kind);
    const data = Buffer.from(`${kind} ${size}\0${contents}`, 'utf8');
    return await deflate(data) as Buffer;
}

export function getObjectPath(sha: string): string {
    return path.join('objects', sha.substr(0, 2), sha.substr(2));
}

export function getRefPath(ref: string): string {
    return path.join('refs', ref);
}

export async function getRefValue(ref: string): Promise<string> {
    const { stdout } = await execGit(['rev-parse', ref]);
    return stdout;
}

export async function objectExists(sha: string): Promise<boolean> {
    try {
        await execGit(['cat-file', '-e', sha]);
        return true;
    } catch(e) {
        return false;
    }
}

export async function isAncestor(ancestor: string, ref: string): Promise<boolean> {
    try {
        await execGit(['merge-base', '--is-ancestor', ancestor, ref]);
        return true;
    } catch(e) {
        return false;
    }
}

export async function getObjectKind(ref: string): Promise<string> {
    const {stdout: kind} = await execGit(['cat-file', '-t', ref]);
    return kind
}

export async function getObjectSize(ref: string): Promise<string> {
    const {stdout: kind} = await execGit(['cat-file', '-s', ref]);
    return kind
}

export async function getObjectContents(ref: string, kind?: string): Promise<string> {
    const { stdout: contents } = await execGit([
        'cat-file',
        kind || '-p',
        ref
    ]);
    return contents;
}

async function buildExcludeList(excludeRefs: string[] = []): Promise<string[]> {
    const mapper = async (ref: string) => ({ ref, exists: await objectExists(ref) });
    const mapped = await pMap(excludeRefs, mapper, { concurrency: 5 });
    const exists = mapped.reduce(
        (state: string[], { exists, ref }) => exists ? [...state, `^${ref}`] : state,
        []
    );
    return exists;
}
