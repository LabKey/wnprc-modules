const gulp = require("gulp");
const javac = require("gulp-javac");
var clean = require('gulp-clean');
var replace = require('gulp-replace');
var fs = require('fs');
var _ = require('lodash');
var rename = require("gulp-rename");
var path = require("path");
const zip = require('gulp-zip');

const lkpm = require('lkpm');


gulp.task("deploy", ["zip"]);

gulp.task("zip", ["build"], function() {
    gulp.src("build/explodedModule/**/*")
        .pipe(zip('dbutils.module'))
        .pipe(gulp.dest("build/deploy"));
});

gulp.task("build", ["compile-java", "module-config"]);

gulp.task("compile-java", ['stage-static'], function() {
    return gulp.src(['./src/**/*.java', './api-src/**/*.java'])
        .pipe(javac('dbutils.jar')
            .addLibraries('./lkpm/base/labkey-lib/*.jar')
            .addLibraries('./lkpm/base/tomcat-lib/*.jar')
            .addLibraries('./lkpm/base/explodedModules/*/lib/*.jar'))
        .pipe(gulp.dest('build/explodedModule/lib'));
});

gulp.task("module-config", ['stage-static'], function(cb) {
    lkpm.compileModuleFile(__dirname).then(function(outStream) {
        outStream.pipe(gulp.dest("build/explodedModule/config"));
        cb();
    });
});

gulp.task("stage-static", function() {
    return gulp.src('./resources/**/*')
        .pipe(gulp.dest('build/explodedModule'));
});


gulp.task('clean', function () {
    return gulp.src('build', {read: false})
        .pipe(clean());
});