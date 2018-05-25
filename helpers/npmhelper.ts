import * as fs from 'fs';
import * as semver from 'semver';
import * as shell from 'shelljs';

/**
 * Helper class containing methods related to npm feeds and package.json.
 */
export class NpmHelper {
    private getPackageVersionFromFeed(packageName: string, explicitVersion?: string): string {
        var npmCommand = 'npm view ' + packageName;
        if (explicitVersion && explicitVersion.length) {
            npmCommand += '@' + explicitVersion;
        }
        npmCommand += ' version';

        return shell.exec(npmCommand, { silent:true }).stdout.toString();
    }

    /**
     * Reads information from a package.json file.
     * @param packageJson Path to the package.json to read.
     */
    public getPackageInfo(packageJson: string): NpmPackageInfo {
        var packageFile = JSON.parse(fs.readFileSync(packageJson).toString());

        return {
            name: packageFile.name,
            description: packageFile.description,
            version: packageFile.version,
            author: packageFile.author,
            license: packageFile.license
        };
    }

    /**
     * Checks if the package with information from package.json already exists in the feed.
     * @param packageJson Path to the package.json of the package.
     */
    public packageExists(packageJson: string): boolean {
        let info = this.getPackageInfo(packageJson);
        let feedVersion = this.getPackageVersionFromFeed(info.name, info.version);

        return (feedVersion != null && feedVersion.length != 0);
    }

    /**
     * Checks if the package with information from package.json can be published to the feed. The package can be published
     * if no package of the name exists or if its version is higher than the latest version.
     * @param packageJson Path to the package.json of the package.
     */
    public isNewPackage(packageJson: string): boolean {
        let info = this.getPackageInfo(packageJson);
        let feedVersion = this.getPackageVersionFromFeed(info.name);

        return !feedVersion || semver.gt(info.version, feedVersion);
    }
}

export interface NpmPackageInfo {
    name: string,
    description: string,
    version: string,
    author: string,
    license: string
}
