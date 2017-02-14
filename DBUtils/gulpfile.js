const gulp = require("gulp");
const javac = require("gulp-javac");
var clean = require('gulp-clean');
var replace = require('gulp-replace');
var fs = require('fs');
var _ = require('lodash');
var rename = require("gulp-rename");
var path = require("path");
const zip = require('gulp-zip');


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

gulp.task("module-config", ['stage-static'], function() {
    var stream = gulp.src('module.template.xml');

    var package_json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    var lkpm_json    = JSON.parse(fs.readFileSync('lkpm.json',    'utf8'));

    var itemsToReplace = {
        ModuleClass: lkpm_json['moduleClass'],
        Name:        package_json['name'],
        Version:     "1.0" || package_json['version'],
        RequiredServerVersion: lkpm_json['server']['requiredVersion'],
        ModuleDependencies: lkpm_json['server']['moduleDependencies'].join(', '),
        Label:           lkpm_json['label'],
        Description:     package_json['description'],
        URL:             package_json["homepage"],
        Author:          package_json["author"],
        Maintainer:      package_json["author"],
        Organization:    "",
        OrganizationURL: "",
        License:         package_json["license"]["type"],
        LicenseURL:      package_json["license"]["url"] ,
        VcsRevision:     "",
        VcsURL:          package_json["repository"]["url"],
        BuildUser:       "",
        BuildTime:       "",
        BuildOS:         "",
        BuildPath:       "",
        BuildType:       "",
        SourcePath:      "/LabKey/sources/build/explodedModule",
        SupportedDatabases: "pgsql",
        ResourcePath:    "",
        BuildNumber:     "",
        EnlistmentId:    "",
        ConsolidateScripts: "",
        ManageVersion:   ""
    };

    _.each(itemsToReplace, function(value, key) {
        stream = stream.pipe(replace('@@' + key + '@@', itemsToReplace[key]));
    });

    stream.pipe(rename("module.xml"))
        .pipe(gulp.dest("build/explodedModule/config"));
});

gulp.task("stage-static", function() {
    return gulp.src('./resources/**/*')
        .pipe(gulp.dest('build/explodedModule'));
});


gulp.task('clean', function () {
    return gulp.src('build', {read: false})
        .pipe(clean());
});