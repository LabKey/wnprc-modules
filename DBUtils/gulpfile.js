const gulp = require("gulp");
const javac = require("gulp-javac");
var clean = require('gulp-clean');


gulp.task("build", ['stage-static'], function() {
    return gulp.src(['./src/**/*.java', './api-src/**/*.java'])
        .pipe(javac('dbutils.jar')
            .addLibraries('./lkpm/base/labkey-lib/*.jar')
            .addLibraries('./lkpm/base/tomcat-lib/*.jar')
            .addLibraries('./lkpm/base/explodedModules/*/lib/*.jar'))
        .pipe(gulp.dest('build/explodedModule/lib'));
});

gulp.task("stage-static", function() {
    return gulp.src('./resources/**/*')
        .pipe(gulp.dest('build/explodedModule'));
});


gulp.task('clean', function () {
    return gulp.src('build', {read: false})
        .pipe(clean());
});