const gulp = require("gulp");
const lkpm = require('lkpm');
const path = require("path");

var buildDir = path.join(__dirname, "build");
var compiledResourcesDir = path.join(buildDir, "compiledResources");

var compileJSLibTask = "javascript-libraries";
gulp.task(compileJSLibTask, function() {
    return gulp.src(path.join("resources", "**", "*"))
        .pipe(gulp.dest(path.join(compiledResourcesDir)));
});

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname
}, gulp);

var stageTask = taskExporter.tasks[lkpm.TASK_NAMES.STAGE_STATIC];
stageTask.dependencies.push(compileJSLibTask);
stageTask.setResourceRoot(compiledResourcesDir);

taskExporter.exportTasks();