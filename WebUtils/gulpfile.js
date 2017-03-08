const bower = require('gulp-bower');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const filter = require('gulp-filter');
const flatten = require("gulp-flatten");
const gulp = require("gulp");
const gulpWebpack = require('gulp-webpack');
const lkpm = require('lkpm');
const mainBowerFiles = require('gulp-main-bower-files');
const minify = require("gulp-minify");
const merge = require('gulp-merge');
const path = require("path");
const rename = require("gulp-rename");
const pump = require("pump");
const uglify = require('gulp-uglify');
const webpack = require('webpack');

var buildDir = path.join(__dirname, "build");
var compiledResourcesDir = path.join(buildDir, "compiledResources");

gulp.task('bower', function() {
    return bower();
});

var compileJSLibTask = "external-libraries";
gulp.task(compileJSLibTask, ['bower'], function() {
    var staticResources = gulp.src([path.join("resources", "**", "*"), path.join('!resources', 'web', '**', '*')]);

    var bowerFiles = gulp.src(path.join(__dirname, './bower.json'))
        .pipe(mainBowerFiles({
            overrides: {
                bootstrap: {
                    main: [
                        './dist/js/bootstrap.js',
                        './dist/css/bootstrap-theme.css',
                        './dist/css/bootstrap.css',
                        './dist/fonts/*.*'
                    ]
                },
                'eonasdan-bootstrap-datetimepicker': {
                    dependencies: {
                        "jquery":    ">=1.8.3",
                        "moment":    ">=2.10.5",
                        "bootstrap": ">3.3.7"
                    },
                    "main": [
                        "build/css/bootstrap-datetimepicker.css",
                        "build/js/bootstrap-datetimepicker.min.js"
                    ]
                }
            }
        }))
        .pipe(flatten());
    //bowerFiles.pipe(debug({title: "Bower Files: "}));

    var css = bowerFiles
        .pipe(filter("**/*.css"))
        .pipe(rename(function(file) {
            file.dirname = 'css'
        }));

    //css.pipe(debug({title: "CSS: "}));

    var js = bowerFiles.pipe(filter('**/*.js'));
    //js.pipe(debug({title: "JS: "}));

    //
    // When concatenating JS files, we add a ";" to ensure there is no odd behavior in case the individual files failed
    // to include a terminating semicolon.
    //
    var jsBundle = js
        .pipe(concat('externals.js', { newLine: "\n\n;\n// ==== CONCAT ==== \n;\n\n" }))
        .pipe(rename(function(file) { file.dirname = "lib"; }))
        .pipe(debug({title: "Bundle: "}))
        ;

    var minifiedJs = jsBundle
            .pipe(minify({
                ext:{
                    src:'-debug.js',
                    min:'-min.js'
                }
            }))
        .pipe(debug({title: "Min Bundle: "}))
        ;

    var webResources = merge(css, minifiedJs)
        .pipe(debug({title: "WEB: "}))
        .pipe(rename(function(file) {
            file.dirname = path.join("web", "webutils", file.dirname)
        }));

    return merge(staticResources, webResources)
        .pipe(gulp.dest(path.join(compiledResourcesDir)));
});

const webpackTaskName = 'webpack';
gulp.task(webpackTaskName, [compileJSLibTask], function() {
    gulp.src(path.resolve(__dirname, 'web', 'legacy.ts'))
        .pipe(gulpWebpack(require('./webpack.config.js'), webpack))
        .pipe(gulp.dest(path.resolve(__dirname, 'build', 'compiledResources', 'web', 'webutils', 'lib')))
});

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname
}, gulp);

var stageTask = taskExporter.tasks[lkpm.TASK_NAMES.STAGE_STATIC];
stageTask.dependencies.push(compileJSLibTask, 'bower');
stageTask.setResourceRoot(compiledResourcesDir);

taskExporter.exportTasks();