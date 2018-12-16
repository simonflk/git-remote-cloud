export default function loadDriver(
    {type, token, pathname}: {
        type: string,
        token: string,
        pathname: string
    }
) {
    const driverModule = `git-remote-cloud-driver-${type}`;
    let Driver;
    try {
        const module = require(driverModule);
        Driver = module.default || module;
    } catch (e) {
        throw new Error(`Unable to load cloud storage provider driver ${type} - ${e.message}`);
    }
    return new Driver({ token, pathname });
}
