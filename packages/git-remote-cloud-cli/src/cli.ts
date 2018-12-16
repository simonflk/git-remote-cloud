import envPaths from 'env-paths';

import Config from './config';
import loadDriver from './load-driver';
import run from './helper';

const paths = envPaths('git-remote-cloud', { suffix: ''});
const alias = process.argv[2];
const url = process.argv[3];
const config = new Config(`${paths.config}.json`);

try {
    const { protocol, username, password, host, pathname } = new URL(process.argv[3]);

    if (protocol != 'cloud:') {
        throw new Error('URL must start with the "cloud://" scheme');
    }

    if (pathname.endsWith('/')) {
        throw new Error('URL path must not have trailing slash');
    }

    if (username && password) {
        throw new Error('URL must not specify both username & token');
    }

    if (!host) {
        const template = `${protocol}//${username ? `${username}@` : ''}${password ? `:${password}@` : ''}[storage-provider]/[path]`;
        throw new Error(`URL must specify a storage provider - ${template}`);
    }

    const token = password || config.getToken(host, username);

    const driver = loadDriver({
        type: host,
        token,
        pathname,
    });

    run({
        driver,
        input: process.stdin,
        output: process.stdout,
        verbosity: 1,
    });
} catch (e) {
    if (e.message) {
        console.error(`error: ${e.message}`);
        process.exit(1);
    }
}
