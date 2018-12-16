import fs from 'fs';
import JSON5 from 'json5';
import dotProp from 'dot-prop';

export default class Config {
    constructor(public file: string) {

    }

    private parse() {
        if (!fs.existsSync(this.file)) {
            throw new Error(`Error loading config - ${this.file} not found`);
        }

        try {
            const source = fs.readFileSync(this.file, { encoding: 'utf-8'});
            return JSON5.parse(source);
        } catch (e) {
            throw new Error(`Error reading config file '${this.file}' - ${e.message}`);
        }
    }

    getToken(type: string, username: string): string {
        const conf = this.parse();
        const token = dotProp.get(conf, `${type}.${username || 'default'}`)
        return token;
    }
}
