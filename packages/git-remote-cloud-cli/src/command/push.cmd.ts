import pMap from 'p-map';
import * as types from '../types';
import { createContext } from 'vm';

const commandFormat = /^push (?<force>\+?)(?<source>[^:]*):(?<destination>.*)/;
interface commandParams {
    force: string,
    source: string,
    destination: string,
    [key: string]: string
}

// push Command
export default {
    test: line => line.startsWith('push'),
    run: async (ctx, line) => {
        const lines = [line].concat(await ctx.readBatch());
        let async = lines.map(async (line) => {
            const match = line.match(commandFormat)
            if (!match) {
                throw new Error(`unrecognised command '${line}'`);
            }
            const { force, source, destination } = match.groups as commandParams;

            try {
                if (source === '') {
                    await ctx.driver.delete(destination);
                    ctx.cache.refs.delete(destination);
                    ctx.cache.pushed.delete(destination);
                } else {
                    const objects = await getObjectsToPush(ctx, source);
                    // TODO: Log progress
                    await pMap(objects, pushObject(ctx), { concurrency: 5 });
                    await writeRef(ctx, source, destination, Boolean(force));
                }
                ctx.write(`ok ${destination}`);
            } catch (error) {
                ctx.write(`error ${destination} ${error.message || 'fetch first'}`);
            }
        });
        await Promise.all(async);
        ctx.write();
    }
} as types.HelperCommand;

async function getObjectsToPush(ctx: types.CommandContext, source: string): Promise<string[]> {
    let present = new Set([...ctx.cache.pushed.values()]);
    for (const gitRef of ctx.cache.refs.values()) {
        present.add(gitRef.sha);
    }
    return await ctx.repo.listObjects(source, [...present]);
}

function pushObject(ctx: types.CommandContext) {
    return async (sha: string) => {
        const data = await ctx.repo.encodeObject(sha);
        const path = ctx.repo.getObjectPath(sha);
        await ctx.driver.write(path, data);
    };
}

async function writeRef(ctx: types.CommandContext, source: string, destination: string, force: boolean) {
    const newSha = await ctx.repo.getRefValue(source);
    const path = ctx.repo.getRefPath(destination);
    const gitRef = ctx.cache.refs.get(destination);
    const refContents = Buffer.from(`${newSha}\n`, 'utf8');

    if (gitRef) {
        const exists = await ctx.repo.objectExists(gitRef.sha);
        if (!exists) {
            throw new Error('fetch first');
        }
        const isFastForward = await ctx.repo.isAncestor(gitRef.sha, newSha)
        if (!isFastForward && !force) {
            throw new Error('non-fast forward');
        }
        await ctx.driver.update(path, refContents, gitRef.version);
    } else {
        await ctx.driver.write(path, refContents);
    }

    ctx.cache.pushed.set(destination, newSha);
}
