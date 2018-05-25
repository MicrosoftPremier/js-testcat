var gulp = require('gulp');
var bump = require('gulp-bump');
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

gulp.task('clean', function(cb) {
    shell.rm('-rf', distPath);
    shell.rm('-rf', tscOutDir);
    cb();
});

gulp.task('dist', function(cb) {
    layout('distLayout.json');
    cb();
});

gulp.task('bump', function() {
    return gulp.src('./package.json')
        .pipe(bump({key: 'version'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bumpMinor', function() {
    return gulp.src('./package.json')
        .pipe(bump({key: 'version', type: 'minor'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bumpMajor', function() {
    return gulp.src('./package.json')
        .pipe(bump({key: 'version', type: 'major'}))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['build']);