const { src, dest } = require('gulp');
var gulpBump = require('gulp-bump');
var fs = require('fs');
var shell = require('shelljs');

const distPath = 'dist';
const tscOutDir = 'js';

function layout(layoutFile) {
    let layout = JSON.parse(fs.readFileSync(layoutFile).toString());
    for (let part of layout.parts) {
        if (!shell.test('-e', part.destination)) {
            shell.mkdir('-p', part.destination);
        }
        if (part.folders && part.folders.length) {
            console.log('Copying folders ' + part.folders + '...')
            shell.cp('-rf', part.folders, part.destination);
        }
        if (part.files && part.files.length) {
            console.log('Copying files ' + part.files + '...')
            shell.cp(part.files, part.destination);
        }
    }
}

function clean(cb) {
    shell.rm('-rf', distPath);
    shell.rm('-rf', tscOutDir);
    cb();
}
exports.clean = clean;

function dist(cb) {
    layout('distLayout.json');
    cb();
}
exports.dist = dist;

function bump() {
    return src('./package.json')
        .pipe(gulpBump({key: 'version'}))
        .pipe(dest('./'));
}
exports.bump = bump;

function bumpMinor() {
    return src('./package.json')
        .pipe(gulpBump({key: 'version', type: 'minor'}))
        .pipe(dest('./'));
}
exports.bumpMinor = bumpMinor;

function bumpMajor() {
    return src('./package.json')
        .pipe(gulpBump({key: 'version', type: 'major'}))
        .pipe(dest('./'));
}
exports.bumpMajor = bumpMajor;

exports.default = this.dist;