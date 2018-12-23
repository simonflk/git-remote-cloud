import { CloudDriver, CloudDriverConstructor } from "./types";

export default function loadDriver(
    {type, token, pathname}: {
        type: string,
        token: string,
        pathname: string
    }
) : CloudDriver {
    const driverModule = `git-remote-cloud-driver-${type}`;
    let Driver : CloudDriverConstructor;
    try {
        const module = require(driverModule);
        Driver = module.default || module;
    } catch (e) {
        throw new Error(`Unable to load cloud storage provider driver ${type} - ${e.message}`);
    }

    return new Driver({ token, root: pathname });
}
