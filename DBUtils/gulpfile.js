const gulp = require("gulp");
const lkpm = require('lkpm');

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname
});

taskExporter.exportTasks(gulp);