const child_process = require("child_process");
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const filter = require('gulp-filter');
const flatten = require("gulp-flatten");
const gulp = require("gulp");
const gulpWebpack = require('gulp-webpack');
const less = require('gulp-less');
const lkpm = require('lkpm');
const mainBowerFiles = require('gulp-main-bower-files');
const minify = require("gulp-minify");
const merge = require('gulp-merge');
const path = require("path");
const rename = require("gulp-rename");
const pump = require("pump");
const uglify = require('gulp-uglify');
const webpack = require('webpack');
const _ = require("underscore");

var buildDir = path.join(__dirname, "build");
var compiledResourcesDir = path.join(buildDir, "compiledResources");

gulp.task('bower-install', function(done) {
    const bower = path.join(__dirname, 'node_modules', '.bin', 'bower');

    child_process.execSync(bower + " install", {
        stdio: [0,1,2]
    });

    done();
});

var bowerOverrides = {
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
        },
        'knockout': {
            main: "dist/knockout.debug.js"
        },
        'react': {
            main: [
                "react.js",
                "react-dom.js",
                "react-dom-server.js"
            ]
        }
    }
};

var outputDirectory = path.join(__dirname, 'build', 'compiledResources', 'web', 'webutils');

var getBowerFiles = function() {
    return gulp.src(path.join(__dirname, './bower.json'))
        .pipe(mainBowerFiles(bowerOverrides))
        .pipe(flatten());
};

gulp.task('css', function() {
    const bootstrapFilter = filter(['**', '!**/bootstrap*.css', '**/bootstrap-datetimepicker.css'], {restore: true, passthrough: false});
    const bootstrapInABoxFilter = filter(['**', '!**/bootstrap-in-a-box.css'], {restore: true, passthrough: false});

    var lessFiles = gulp.src(path.join(__dirname, 'src', 'less', '*.less'))
        .pipe(less())
        .pipe(flatten())
        .pipe(bootstrapInABoxFilter);

    var bundle = merge(getBowerFiles(), lessFiles)
            .pipe(filter("**/*.css"))
            .pipe(bootstrapFilter)
            .pipe(debug({title: 'non-bootstrap: '}))
            .pipe(concat('webutils.css', { newLine: "\n\n/* ==== CONCAT ==== */\n\n" }))
        ;

    var bootstrap = bootstrapFilter.restore
        .pipe(concat('bootstrap-bundle.css', { newLine: "\n\n/* ==== CONCAT ==== */\n\n" }))
        ;

    return merge(bundle, bootstrap, bootstrapInABoxFilter.restore)
        .pipe(flatten())
        .pipe(rename(function(file) {
            file.dirname = 'css'
        }))
        .pipe(debug({title: 'css: '}))
        .pipe(gulp.dest(outputDirectory));
});

gulp.task('fonts', function() {
    return getBowerFiles()
        .pipe(filter("**/*.{eot,svg,ttf,woff,woff2}"))
        .pipe(rename(function(file) {
            file.dirname = 'fonts'
        }))
        .pipe(gulp.dest(outputDirectory));
});

gulp.task('js', function() {
    var js = getBowerFiles().pipe(filter('**/*.js'));

    //
    // When concatenating JS files, we add a ";" to ensure there is no odd behavior in case the individual files failed
    // to include a terminating semicolon.
    //
    var jsBundle = js
        .pipe(concat('externals.js', { newLine: "\n\n;\n// ==== CONCAT ==== \n;\n\n" }))
        .pipe(rename(function(file) { file.dirname = "lib"; }))
        ;

    return jsBundle
            .pipe(minify({
                ext:{
                    src:'-debug.js',
                    min:'-min.js'
                }
            }))
        .pipe(gulp.dest(outputDirectory));
});

gulp.task('vendor-lib', gulp.series('bower-install', gulp.parallel(
    'js',
    'fonts',
    'css'
)));

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname,
    resourcePreprocessorTask: 'vendor-lib',
    javaSrcRoots: [path.join(__dirname, 'src', 'java')],
    tsRoots: [path.join(__dirname, 'src', 'ts')]
}, gulp);

taskExporter.enableWebpack({
    entry: {
        "lib/legacy": path.join(__dirname, 'src', 'ts', 'legacy.ts')
    },

    output: {
        path: path.resolve(taskExporter.getCompiledResourceDir(), 'web', 'webutils', 'lib'),
        // Export the module as the WebUtils variable
        library: "WebUtils",
        libraryTarget: "umd"
    },

    resolve: {
        alias: {
            classify: path.join(__dirname, "./external_resources/js/classify.js"),
            supersqlstore: path.join(__dirname, "./external_resources/js/supersqlstore.js")
        }
    }
});

taskExporter.exportTasks();