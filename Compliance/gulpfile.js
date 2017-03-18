const gulp = require("gulp");
const lkpm = require('lkpm');
const path = require('path');

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname
}, gulp);

taskExporter.exportTasks();