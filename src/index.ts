import * as fs from 'fs';
import { testCategories } from './testCategories';
import { R_OK } from 'constants';

let initialized: boolean = false;

let includedCategories: string[] = [];
let excludedCategories: string[] = [];

// @ts-ignore: Undefined describe because no direct dependency on mocha or jasmine
const _describe: (d: string, c: (this: any) => void) => any = typeof describe !== 'undefined' ? describe : null;
// @ts-ignore: Undefined describe because no direct dependency on mocha or jasmine
const _xdescribe: (d: string, c: (this: any) => void) => any = typeof xdescribe !== 'undefined' ? xdescribe : null;
// @ts-ignore: Undefined describe because no direct dependency on mocha or jasmine
const _it: (d: string, c: (this: any) => void) => any = typeof it !== 'undefined' ? it : null;
// @ts-ignore: Undefined describe because no direct dependency on mocha or jasmine
const _xit: (d: string, c: (this: any) => void) => any = typeof xit !== 'undefined' ? xit : null;

function isEnabled(categories: string | string[]): boolean {
    categories = Array.isArray(categories) ? categories : [categories];
    // Build the list of effective test categories by
    //    1. including all categories that are present in the configured includes (or all, if there are no configured includes)
    //    2. removing all categories that are present in the configured excludes
    let finalCagetories = (categories.filter(c => !includedCategories.length || includedCategories.indexOf(c) >= 0))
                            .filter(c => !excludedCategories.length || excludedCategories.indexOf(c) == -1);

    return finalCagetories.length > 0;
}

function getCategoriesFromEnvString(envString: string): string[] {
    if (envString && envString.length) {
        return envString
                .split(',')
                .map(v => v.trim())
                .filter(v => v.length);
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
    return target.concat(valuesToAdd
                            .map(v => v.trim())
                            .filter(v => v.length && target.indexOf(v) == -1));
}

function removeCategoriesFromArray(target: string[], valuesToRemove: string[]): string[] {
    return target.filter(v => valuesToRemove.indexOf(v) == -1);
}

function init(): void {
    if (!initialized) {
        initialized = true;
        readCategoriesFromEnvironment();
    }
}

function isAccessible(file: string): boolean {
    if (!fs.existsSync(file)) {
        return false;
    }
    try {
        fs.accessSync(file, R_OK);
    } catch (err) {
        return false;
    }
    return true;
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
    if (isAccessible(file)) {
        let fileContent = fs.readFileSync(file).toString();
        if (fileContent && fileContent.length) {
            let categories = <testCategories> JSON.parse(fileContent);

            includedCategories = addCategoriesFromArray(includedCategories, (categories.includes || []));
            excludedCategories = addCategoriesFromArray(excludedCategories, (categories.excludes || []));
        }
    } else {
        let error = new Error('Could not find or access js-testcat file ' + file);
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
    includes = Array.isArray(includes) ? includes : [includes];
    includedCategories = addCategoriesFromArray(includedCategories, includes);
}

/**
 * Adds one or more excluded test categories to js-testcat.
 * @param excludes The category (string) or list of categories (string[]) to add.
 */
export function addExcludes(excludes: string | string[]): void {
    init();
    excludes = Array.isArray(excludes) ? excludes : [excludes];
    excludedCategories = addCategoriesFromArray(excludedCategories, excludes);
}

/**
 * Remove test categories specified in a js-testcat file.
 * @param file Path to js-testcat file containing test categories to remove.
 */
export function removeTestcatFile(file: string): void {
    init();
    if (isAccessible(file)) {
        let fileContent = fs.readFileSync(file).toString();
        if (fileContent && fileContent.length) {
            let categories = <testCategories> JSON.parse(fileContent);

            includedCategories = removeCategoriesFromArray(includedCategories, (categories.includes || []));
            excludedCategories = removeCategoriesFromArray(excludedCategories, (categories.excludes || []));
        }
    } else {
        let error = new Error('Could not find or access js-testcat file ' + file);
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