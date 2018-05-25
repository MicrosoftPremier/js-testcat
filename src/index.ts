import * as shell from 'shelljs';
import * as fs from 'fs';
import { testCategories } from './testCategories';

let initialized: boolean = false;

let includedCategories: string[] = [];
let excludedCategories: string[] = [];

// @ts-ignore: Undefined describe because no direct dependency on mocha or jasmine
let _describe: (d: string, c: (this: any) => void) => any = typeof describe !== 'undefined' ? describe : null;
// @ts-ignore: Undefined describe because no direct dependency on mocha or jasmine
let _xdescribe: (d: string, c: (this: any) => void) => any = typeof xdescribe !== 'undefined' ? xdescribe : null;
// @ts-ignore: Undefined describe because no direct dependency on mocha or jasmine
let _it: (d: string, c: (this: any) => void) => any = typeof it !== 'undefined' ? it : null;
// @ts-ignore: Undefined describe because no direct dependency on mocha or jasmine
let _xit: (d: string, c: (this: any) => void) => any = typeof xit !== 'undefined' ? xit : null;

function isEnabled(categories: string | string[]): boolean {
    let enabled: boolean;

    if (!includedCategories.length) {
        // If there are no includes, all tests are enabled unless excluded,...
        enabled = true;
    } else {
        // ...otherwise only included test are run
        enabled = false;
    }

    if (Array.isArray(categories)) {
        for (let enabledCat of includedCategories) {
            if (categories.indexOf(enabledCat) >= 0) {
                enabled = true;
                break;
            }
        }
        for (let disabledCat of excludedCategories) {
            if (categories.indexOf(disabledCat) >= 0) {
                enabled = false;
                break;
            }
        }
    } else {
        for (let enabledCat of includedCategories) {
            if (categories === enabledCat) {
                enabled = true;
                break;
            }
        }
        for (let disabledCat of excludedCategories) {
            if (categories === disabledCat) {
                enabled = false;
                break;
            }
        }
    }

    return enabled;
}

function removeEmptyEntries(array: string[]): string[] {
    for (let index = 0; index < array.length; ++index) {
        if (!array[index].length) {
            array.splice(index, 1);
            --index;
        }
    }
    return array;
}

function getCategoriesFromEnvString(envString: string): string[] {
    if (envString && envString.length) {
        let values = envString.split(',').map(v => v.trim());
        return removeEmptyEntries(values);
    }
    return [];
}

function readCategoriesFromEnvironment(): void {
    includedCategories = getCategoriesFromEnvString(process.env.JSTESTCAT_INCLUDE);
    excludedCategories = getCategoriesFromEnvString(process.env.JSTESTCAT_EXCLUDE);
    if (process.env.JSTESTCAT_FILE) {
        addTestcatFile(process.env.JSTESTCAT_FILE);
    }
}

function addCategoriesFromArray(target: string[], valuesToAdd: string[]): string[] {
    for (let v of valuesToAdd) {
        v = v.trim();
        if (v.length && target.indexOf(v) == -1) {
            target.push(v);
        }
    }
    return target;
}

function removeCategoriesFromArray(target: string[], valuesToRemove: string[]): string[] {
    for (let v of valuesToRemove) {
        v = v.trim();
        let index: number = -1;
        if (v.length && (index = target.indexOf(v)) >= 0) {
            target.splice(index, 1);
        }
    }
    return target;
}

function init(): void {
    if (!initialized) {
        initialized = true;
        readCategoriesFromEnvironment();
    }
}

/**
 * Resets js-testcat to its uninitialized state.
 * This forces js-testcat to re-initialize test categories from environment variables.
 */
export function reset(): void {
    initialized = false;
    includedCategories = [];
    excludedCategories = [];
}

/**
 * Adds test categories specified in a js-testcat file.
 * @param file Path to js-testcat file containing test categories to add.
 */
export function addTestcatFile(file: string): void {
    init();
    if (shell.test('-f', file)) {
        let fileContent = fs.readFileSync(file).toString();
        if (fileContent && fileContent.length) {
            let categories = <testCategories> JSON.parse(fileContent);

            includedCategories = addCategoriesFromArray(includedCategories, (categories.includes || []));
            excludedCategories = addCategoriesFromArray(excludedCategories, (categories.excludes || []));
        }
    } else {
        let error = new Error('Could not find js-testcat file ' + file);
        (<any>error)['showStack'] = false;
        throw error;
    }
}

/**
 * Adds one or more included test categories to js-testcat.
 * @param includes The category (string) or list of categories (string[]) to add.
 */
export function addIncludes(includes: string | string[]): void {
    init();
    if (!Array.isArray(includes)) {
       includedCategories =  addCategoriesFromArray(includedCategories, [includes]);
    } else {
        includedCategories = addCategoriesFromArray(includedCategories, includes);
    }
}

/**
 * Adds one or more excluded test categories to js-testcat.
 * @param excludes The category (string) or list of categories (string[]) to add.
 */
export function addExcludes(excludes: string | string[]): void {
    init();
    if (!Array.isArray(excludes)) {
       excludedCategories =  addCategoriesFromArray(excludedCategories, [excludes]);
    } else {
        excludedCategories = addCategoriesFromArray(excludedCategories, excludes);
    }
}

/**
 * Remove test categories specified in a js-testcat file.
 * @param file Path to js-testcat file containing test categories to remove.
 */
export function removeTestcatFile(file: string): void {
    init();
    if (shell.test('-f', file)) {
        let fileContent = fs.readFileSync(file).toString();
        if (fileContent && fileContent.length) {
            let categories = <testCategories> JSON.parse(fileContent);

            includedCategories = removeCategoriesFromArray(includedCategories, (categories.includes || []));
            excludedCategories = removeCategoriesFromArray(excludedCategories, (categories.excludes || []));
        }
    } else {
        let error = new Error('Could not find js-testcat file ' + file);
        (<any>error)['showStack'] = false;
        throw error;
    }
}

/**
 * Removes one or more included test categories to js-testcat.
 * @param includes The category (string) or list of categories (string[]) to remove.
 */
export function removeIncludes(includes: string | string[]): void {
    init();
    if (!Array.isArray(includes)) {
       includedCategories =  removeCategoriesFromArray(includedCategories, [includes]);
    } else {
        includedCategories = removeCategoriesFromArray(includedCategories, includes);
    }
}

/**
 * Removes all currently included test categories.
 */
export function removeAllIncludes(): void {
    init();
    includedCategories = [];
}

/**
 * Removes one or more excluded categories to js-testcat.
 * @param excludes The category (string) or list of categories (string[]) to remove.
 */
export function removeExcludes(excludes: string | string[]): void {
    init();
    if (!Array.isArray(excludes)) {
       excludedCategories =  removeCategoriesFromArray(excludedCategories, [excludes]);
    } else {
        excludedCategories = removeCategoriesFromArray(excludedCategories, excludes);
    }
}

/**
 * Removes all currently excluded test categories.
 */
export function removeAllExcludes(): void {
    init();
    excludedCategories = [];
}

/**
 * Gets all currently included test categories.
 * @returns The list (string[]) of included categories.
 */
export function getIncludes(): string[] {
    init();
    return includedCategories;
}

/**
 * Gets all currently excluded test categories.
 * @returns The list (string[]) of excluded categories.
 */
export function getExcludes(): string[] {
    init();
    return excludedCategories;
}

/**
 * Creates a test suite with test categories that allow dynamic test execution.
 * @param description Description of the test suite.
 * @param categories Either a single category (string) or a list of categories (string[]) associated with this test suite.
 * @param callback The callback containing the content of this test suite.
 */
export function cdescribe(description: string, categories: string | string[], callback: (this: any) => void): any {
    init();
    if (!_describe || !_xdescribe) {
        let error = new Error('Declaration of describe and/or xdescribe not present.');
        (<any>error)['showStack'] = false;
        throw error;
    }
    if (isEnabled(categories)) {
        return _describe(description, callback);
    }
    return _xdescribe(description, callback);
}

/**
 * Creates a test case with test categories that allow dynamic test execution.
 * @param description Description of the test case.
 * @param categories Either a single category (string) or a list of categories (string[]) associated with this test case.
 * @param callback The callback containing the content of this test case.
 */
export function cit(description: string, categories: string | string[], callback: (this: any, done?: any) => void): any {
    init();
    if (!_it || !_xit) {
        let error = new Error('Declaration of it and/or xit not present.');
        (<any>error)['showStack'] = false;
        throw error;
    }
    if (isEnabled(categories)) {
        return _it(description, callback);
    }
    return _xit(description, callback);
}