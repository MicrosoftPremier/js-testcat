import rewiremock from 'rewiremock';
import * as sinon from 'sinon';
import { should, expect } from 'chai';
should();

// Test data
let testcatFileToAdd = {
    includes: [ 'Cat1', 'Cat2', 'Cat3', 'Cat4' ],
    excludes: [ 'ExCat1', 'ExCat2', 'ExCat3' ]
};

let testcatFileToRemove = {
    includes: [ 'Cat4' ],
    excludes: [ 'ExCat2' ]
};

// Mocking stuff
let readFileSyncMock = sinon.stub();
let testMock = sinon.stub();
rewiremock('fs').with({
    readFileSync: readFileSyncMock
});
rewiremock('shelljs').with({
    test: testMock
});
rewiremock.enable();

import * as jstestcat from '../src/index';

describe('js-testcat', () => {

    beforeEach(() => {
        process.env.JSTESTCAT_INCLUDE = '';
        process.env.JSTESTCAT_EXCLUDE = '';
        process.env.JSTESTCAT_FILE = '';
    });

    afterEach(() => {
        jstestcat.reset();
        readFileSyncMock.reset();
        testMock.reset();
    });
    
    describe('includes', () => {

        it('can be added via code', () => {
            let categoryToAdd = 'Cat1';
            jstestcat.addIncludes(categoryToAdd);

            jstestcat.getIncludes().should.be.an('Array')
                .with.lengthOf(1, 'Wrong number of includes after adding one')
                .that.has.members([categoryToAdd], 'Includes did not contain the expected values');
        });

        it('can be bulk added via code', () => {
            let categoriesToAdd = ['Cat1', 'Cat2', 'Cat3'];
            jstestcat.addIncludes(categoriesToAdd);
            
            jstestcat.getIncludes().should.be.an('Array')
                .with.lengthOf(categoriesToAdd.length, 'Wrong number of includes after adding multiple')
                .that.has.members(categoriesToAdd, 'Includes did not contain the expected values');
        });

        it('can be removed via code', () => {
            jstestcat.addIncludes(['Cat1', 'Cat2', 'Cat3']);
            jstestcat.removeIncludes('Cat2');

            let remainingCategories = ['Cat1', 'Cat3'];
            jstestcat.getIncludes().should.be.an('Array')
                .with.lengthOf(remainingCategories.length, 'Wrong number of includes after adding multiple')
                .that.has.members(remainingCategories, 'Includes did not contain the expected values');
        });

        it('can be bulk removed via code', () => {
            jstestcat.addIncludes(['Cat1', 'Cat2', 'Cat3']);
            jstestcat.removeIncludes(['Cat2', 'Cat1']);

            jstestcat.getIncludes().should.be.an('Array')
                .with.lengthOf(1, 'Wrong number of includes after adding multiple')
                .that.has.members(['Cat3'], 'Includes did not contain the expected values');
        });

        it('cab be cleared via code', () => {
            jstestcat.addIncludes(['Cat1', 'Cat2', 'Cat3']);
            jstestcat.removeAllIncludes();

            jstestcat.getIncludes().should.be.an('Array').that.is.empty;
        });

        it('should be read from environment variable JSTESTCAT_INCLUDE', () => {
            process.env.JSTESTCAT_INCLUDE = 'Cat1, Cat2';

            let includes = ['Cat1', 'Cat2'];
            jstestcat.getIncludes().should.be.an('Array')
                .with.lengthOf(includes.length, 'Wrong number of includes after adding multiple')
                .that.has.members(includes, 'Includes did not contain the expected values');
        });

        it('can be added through js-testcat file via code', () => {
            testMock.returns(true);
            readFileSyncMock.returns(JSON.stringify(testcatFileToAdd));
            let filename = 'testcat.json';

            jstestcat.addTestcatFile(filename);

            jstestcat.getIncludes().should.be.an('Array')
                .with.lengthOf(testcatFileToAdd.includes.length, 'Number of includes does not match js-testcat files')
                .that.has.members(testcatFileToAdd.includes, 'Includes do not match js-testcat file');
            readFileSyncMock.calledOnceWithExactly(filename);
        });

        it('can be removed through js-testcat file via code', () => {
            testMock.returns(true);
            readFileSyncMock.returns(JSON.stringify(testcatFileToRemove));
            let filename = 'testcat.json';

            jstestcat.addIncludes([ 'Cat1', 'Cat2', 'Cat3', 'Cat4' ]);
            jstestcat.removeTestcatFile(filename);

            let remainingCategories = [ 'Cat1', 'Cat2', 'Cat3' ];
            jstestcat.getIncludes().should.be.an('Array')
                .with.lengthOf(remainingCategories.length, 'Number of includes does not match js-testcat files')
                .that.has.members(remainingCategories, 'Includes do not match js-testcat file');
            readFileSyncMock.calledOnceWithExactly(filename);
        });

        it('can be added through js-testcat file from environment variable JSTESTCAT_FILE', () => {
            testMock.returns(true);
            readFileSyncMock.returns(JSON.stringify(testcatFileToAdd));
            let filename = 'testcat.json';
            process.env.JSTESTCAT_FILE = filename;

            jstestcat.getIncludes().should.be.an('Array')
                .with.lengthOf(testcatFileToAdd.includes.length, 'Number of includes does not match js-testcat files')
                .that.has.members(testcatFileToAdd.includes, 'Includes do not match js-testcat file');
            readFileSyncMock.calledOnceWithExactly(filename);
        });

    });

    describe('excludes', () => {

        it('can be added via code', () => {
            let categoryToAdd = 'Cat1';
            jstestcat.addExcludes(categoryToAdd);

            jstestcat.getExcludes().should.be.an('Array')
                .with.lengthOf(1, 'Wrong number of excludes after adding one')
                .that.has.members([categoryToAdd], 'Excludes did not contain the expected values');
        });

        it('can be bulk added via code', () => {
            let categoriesToAdd = ['Cat1', 'Cat2', 'Cat3'];
            jstestcat.addExcludes(categoriesToAdd);
            
            jstestcat.getExcludes().should.be.an('Array')
                .with.lengthOf(categoriesToAdd.length, 'Wrong number of excludes after adding multiple')
                .that.has.members(categoriesToAdd, 'Excludes did not contain the expected values');
        });

        it('can be removed via code', () => {
            jstestcat.addExcludes(['Cat1', 'Cat2', 'Cat3']);
            jstestcat.removeExcludes('Cat2');

            let remainingCategories = ['Cat1', 'Cat3'];
            jstestcat.getExcludes().should.be.an('Array')
                .with.lengthOf(remainingCategories.length, 'Wrong number of excludes after adding multiple')
                .that.has.members(remainingCategories, 'Excludes did not contain the expected values');
        });

        it('can be bulk removed via code', () => {
            jstestcat.addExcludes(['Cat1', 'Cat2', 'Cat3']);
            jstestcat.removeExcludes(['Cat2', 'Cat1']);

            jstestcat.getExcludes().should.be.an('Array')
                .with.lengthOf(1, 'Wrong number of excludes after adding multiple')
                .that.has.members(['Cat3'], 'Excludes did not contain the expected values');
        });

        it('cab be cleared via code', () => {
            jstestcat.addExcludes(['Cat1', 'Cat2', 'Cat3']);
            jstestcat.removeAllExcludes();

            jstestcat.getExcludes().should.be.an('Array').that.is.empty;
        });

        it('should be read from environment variable JSTESTCAT_EXCLUDE', () => {
            process.env.JSTESTCAT_EXCLUDE = 'Cat1, Cat2';

            let excludes = ['Cat1', 'Cat2'];
            jstestcat.getExcludes().should.be.an('Array')
                .with.lengthOf(excludes.length, 'Wrong number of excludes after adding multiple')
                .that.has.members(excludes, 'Excludes did not contain the expected values');
        });

        it('can be added through js-testcat file via code', () => {
            testMock.returns(true);
            readFileSyncMock.returns(JSON.stringify(testcatFileToAdd));
            let filename = 'testcat.json';

            jstestcat.addTestcatFile(filename);

            jstestcat.getExcludes().should.be.an('Array')
                .with.lengthOf(testcatFileToAdd.excludes.length, 'Number of excludes does not match js-testcat files')
                .that.has.members(testcatFileToAdd.excludes, 'Excludes do not match js-testcat file');
            readFileSyncMock.calledOnceWithExactly(filename);
        });

        it('can be removed through js-testcat file via code', () => {
            testMock.returns(true);
            readFileSyncMock.returns(JSON.stringify(testcatFileToRemove));
            let filename = 'testcat.json';

            jstestcat.addExcludes([ 'ExCat1', 'ExCat2', 'ExCat3' ]);
            jstestcat.removeTestcatFile(filename);

            let remainingCategories = [ 'ExCat1', 'ExCat3' ];
            jstestcat.getExcludes().should.be.an('Array')
                .with.lengthOf(remainingCategories.length, 'Number of excludes does not match js-testcat files')
                .that.has.members(remainingCategories, 'Excludes do not match js-testcat file');
            readFileSyncMock.calledOnceWithExactly(filename);
        });

        it('can be added through js-testcat file from environment variable JSTESTCAT_FILE', () => {
            testMock.returns(true);
            readFileSyncMock.returns(JSON.stringify(testcatFileToAdd));
            let filename = 'testcat.json';
            process.env.JSTESTCAT_FILE = filename;

            jstestcat.getExcludes().should.be.an('Array')
                .with.lengthOf(testcatFileToAdd.excludes.length, 'Number of excludes does not match js-testcat files')
                .that.has.members(testcatFileToAdd.excludes, 'Excludes do not match js-testcat file');
            readFileSyncMock.calledOnceWithExactly(filename);
        });
        
    });

    describe('js-testcat file', () => {

        it('should throw when trying to add a non-existing js-testcat file', () => {
            testMock.returns(false);

            expect(() => jstestcat.addTestcatFile('IDoNotExist')).to.throw('Could not find js-testcat file IDoNotExist');
        });

        it('should throw when trying to remove a non-existing js-testcat file', () => {
            testMock.returns(false);

            expect(() => jstestcat.removeTestcatFile('IDoNotExist')).to.throw('Could not find js-testcat file IDoNotExist');
        });

        it('should not throw when trying to add an empty js-testcat file', () => {
            testMock.returns(true);
            readFileSyncMock.returns('');

            expect(() => jstestcat.addTestcatFile('IAmEmpty')).not.to.throw;
            jstestcat.getIncludes().should.be.an('Array').that.is.empty;
            jstestcat.getExcludes().should.be.an('Array').that.is.empty;
        });

        it('should not throw when trying to add an empty js-testcat file', () => {
            testMock.returns(true);
            readFileSyncMock.returns('');

            expect(() => jstestcat.removeTestcatFile('IAmEmpty')).not.to.throw;
            jstestcat.getIncludes().should.be.an('Array').that.is.empty;
            jstestcat.getExcludes().should.be.an('Array').that.is.empty;
        });

    })

    it('should be uninitialized after calling reset()', () => {
        jstestcat.addIncludes(['Cat1', 'Cat2'])
        jstestcat.addExcludes('ExCat1');

        jstestcat.reset();
        jstestcat.getIncludes().should.be.an('Array').that.is.empty;
        jstestcat.getExcludes().should.be.an('Array').that.is.empty;
    })

});

rewiremock.disable();