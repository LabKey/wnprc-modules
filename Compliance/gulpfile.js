const gulp = require("gulp");
const lkpm = require('lkpm');
const path = require('path');

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname,
    javaSrcRoots: [path.join(__dirname, 'src', 'java'), path.join(__dirname, 'gen-src', 'java-jooq')],
    tsRoots: [path.join(__dirname, 'src', 'ts')]
}, gulp);

taskExporter.enableWebpack({
    entry: {
        'pages/new-protocol': path.join(__dirname, 'src', 'ts', 'pages', 'new-protocol.tsx'),
        'pages/protocol-list': path.join(__dirname, 'src', 'ts', 'pages', 'protocol-list.tsx')
    },

    output: {
        path: path.resolve(taskExporter.getCompiledResourceDir(), 'web', 'wnprc_compliance', 'js')
    }
});

taskExporter.exportTasks();