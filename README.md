# JavaScript Test Categories
Add test categories to mocha (BDD style) and jasmine tests.

![Build Badge](https://almtcger.visualstudio.com/_apis/public/build/definitions/2ff986e4-4f8b-4ae1-8b86-d111d5fc7294/119/badge)
[![npm](https://img.shields.io/npm/v/js-testcat.svg?style=flat&maxAge=3600)](https://www.npmjs.com/package/js-testcat)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat&maxAge=3600)](https://opensource.org/licenses/MIT)

## Get started

### Install the library
Install the library to your project (usually as a dev dependency).

```
npm install js-testcat --save-dev
```

### Use the library
To use the library simply import or require it, then use cdescribe or cit instead of describe or it:

#### TypeScript sample
```typescript
import { cdescribe, cit } from 'js-testcat';

// A regular mocha/jasmine test suite/spec
describe('Some Spec', () => {
    
    // A suite/spec with a single test category
    cdescribe('Spec with test category', 'MyCategory', () => {
        
        it('Test case', () => {
            // .. test code
        });

    });

    // A test case with multiple test categories.
    cit('Test case with test categories', ['SomeCategory', 'SomeOtherCategory'], () => {

    });

});
```
You can find more samples in the [js-testcat-samples](https://github.com/MicrosoftPremier/js-testcat-samples) repo.

The cdescribe specs/suites and cit test cases are executed depending on the test categories you pass to the test run:

- **Neither includes nor excludes**  
  Js-testcat will execute all test suites/specs and test cases as if you had used describe and it instead of cdescribe and cit.
- **Includes only**  
  When you provide only test category includes to the test run, js-testcat only executes test cases and suites/specs that are associated with at least one of the included categories.
- **Excludes only**  
  When passing only test category excludes to the test run, js-testcat executes all suites/specs and test cases that are not associated with any of the excluded categories.
- **Includes and excludes**  
  If you pass both included and excluded test categories to the test run, js-testcat only executes test suites/specs and test cases that are associated with at least one of the included, but not associated with any of the excluded categories.

**Note:** Test category comparison is done case-sensitive!

## APIs
Js-testcat uses the following APIs to let you define and configure test categories:

#### cdescribe(description, categories, callback)
Use the _cdescribe_ function instead of mocha's or jasmine's _describe_ function to create a test suite/spec that is associated with one or more test categories. In addition to the regular _description_ and _callback_ parameters, js-testcat adds the parameter _categories_ that takes either a single category (string) or a list of categories (string[]) and associates the suite/spec with the given test categories.

#### cit(description, categories, callback)
Use the _cit_ function instead of mocha's or jasmine's _it_ function to create a test case that is associated with one or more test categories. In addition to the regular _description_ and _callback_ parameters, js-testcat adds the parameter _categories_ that takes either a single category (string) or a list of categories (string[]) and associates the suite/spec with the given test categories.

#### addTestcatFile(file) / removeTestcatFile(file)
The _addTestcatFile_ and _removeTestcatFile_ functions provide a way of adding or removing test category includes and excludes from a js-testcat file (see below) directly in your test code. Both methods throw an error if the file does not exist.

#### addIncludes(includes) / removeIncludes(includes) / removeAllIncludes()
The _addIncludes_, _removeIncludes_, and _removeAllIncludes_ functions provide a way of adding or removing test category includes directly in your test code. Similar to the _categories_ parameter of the _cdescribe_ and _cit_ functions, you may either pass a single include (string) or a list of includes (string[]);

#### getIncludes() / getExcludes()
If you want to access the currently included or excluded test categories, you can use the _getIncludes_ and _getExcludes_ functions both of which return a string[].

#### addExcludes(excludes) / removeExcludes(excludes) / removeAllExcludes()
The _addExcludes_, _removeExcludes_, and _removeAllExcludes_ functions provide a way of adding or removing test category excludes directly in your test code. Similar to the _categories_ parameter of the _cdescribe_ and _cit_ functions, you may either pass a single exclude (string) or a list of excludes (string[]);

#### reset()
Resets js-testcat to its uninitialized state. This forces js-testcat to re-initialize test categories from environment variables.

## Environment variables
Since neither mocha nor jasmine provide an easy way of passing arbitrary parameters to the test execution, js-testcat uses the following environment variables to configure included and excluded test categories. 

#### JSTESTCAT_INCLUDE / JSTESTCAT_EXCLUDE
Set _JSTESTCAT_INCLUDE_ to a comma-separated list of category names to include them in the test execution and set _JSTESTCAT_EXCLUDE_ to a comma-separated list of category names to exclude them from the test execution.

#### JSTESTCAT_FILE
Set _JSTESTCAT_FILE_ to the path to a js-testcat file that contains the test categories you want to include and exclude.

## Js-testcat file format
The easiest way to quickly switch between different sets of test categories is to use js-testcat files. A js-testcat file is a simple JSON file containing included and excluded test categories. The below sample file configures js-testcat to run all unit and integration tests but not UI tests. 

#### Js-testcat file sample
```json
{
    "includes": [
        "Unit",
        "Integration"
    ],
    "excludes": [
        "UI"
    ]
}
```

## Building and testing js-testcat
Make sure to have gulp (`npm install -g gulp`) and typescript (`npm install -g typescript`) globally installed, then clone the repo and run `npm install`.

Once all packages have been restored, run `npm test` to build and test js-testcat or simply run `tsc` to just transpile the code to JavaScript. With the included _launch.json_ you can also easily debug the tests using Visual Studio Code.