const gulp = require("gulp");
const lkpm = require('lkpm');
const path = require('path');

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname,
    javaSrcRoots: [path.join(__dirname, 'src', 'java')]
}, gulp);

taskExporter.exportTasks();