const fs = require("fs");
const gulp = require("gulp");
const lkpm = require('lkpm');
const path = require('path');

var taskExporter = new lkpm.TaskExporter({
    moduleBase: __dirname,
    javaSrcRoots: [path.join(__dirname, 'src', 'java')],
    tsRoots: [path.join(__dirname, 'src', 'ts')]
}, gulp);

taskExporter.enableWebpack({
    entry: (function() {
        var pages_dir = path.join(__dirname, 'src', 'ts', 'pages');
        var config = {};

        fs.readdirSync(pages_dir).forEach(function(filename) {
            var basename = filename.replace(/.tsx$/, '');

            config['pages/' + basename] = path.join(__dirname, 'src', 'ts', 'pages', filename);
        });

        return config;
    })(),

    output: {
        path: path.resolve(taskExporter.getCompiledResourceDir(), 'web', 'wnprc_ehr', 'js')
    }
});

taskExporter.exportTasks();