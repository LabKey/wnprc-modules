const gulp = require("gulp");
const lkpm = require('lkpm');
const path = require('path');

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname,
    javaSrcRoots: [path.join(__dirname, 'src', 'java')],
    tsRoots: [path.join(__dirname, 'src', 'ts')]
}, gulp);

taskExporter.enableWebpack({
    entry: {
        'pages/path-case-list': path.join(__dirname, 'src', 'ts', 'pages', 'PathCaseList.ts')
    },

    output: {
        path: path.resolve(taskExporter.getCompiledResourceDir(), 'web', 'wnprc_ehr', 'js')
    }
});

taskExporter.exportTasks();