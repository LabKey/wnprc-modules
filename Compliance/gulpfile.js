const gulp = require("gulp");
const lkpm = require('lkpm');
const path = require('path');

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname,
    javaSrcRoots: [path.join(__dirname, 'src', 'java'), path.join(__dirname, 'gen-src', 'java-jooq')],
    tsRoots: [path.join(__dirname, 'src', 'ts')]
}, gulp);

taskExporter.enableWebpack({
    entry: (function() {
        var page_names = [
            'edit-protocol',
            'protocol-list',
            'edit-person',
            'person-list'
        ];

        var config = {};
        page_names.forEach(function(pageName) {
            config['pages/' + pageName] = path.join(__dirname, 'src', 'ts', 'pages', pageName + '.tsx');
        })
    })(),

    output: {
        path: path.resolve(taskExporter.getCompiledResourceDir(), 'web', 'wnprc_compliance', 'js')
    }
});

taskExporter.exportTasks();