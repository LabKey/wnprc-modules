/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
const entryPoints = require('../src/client/entryPoints');
const constants = require('./constants');

module.exports = {
    context: constants.context,
    mode: 'development',
    devtool: 'eval',
    entry: constants.processEntries(entryPoints),
    output: {
        path: constants.outputPath,
        publicPath: './', // allows context path to resolve in both js/css
        filename: '[name].[contenthash].js'
    },
    module: {
        rules: constants.loaders.TYPESCRIPT.concat(constants.loaders.STYLE, constants.loaders.FILES),
    },
    resolve: {
        alias: constants.aliases.LABKEY_PACKAGES,
        extensions: constants.extensions.TYPESCRIPT
    },
    plugins: constants.processPlugins(entryPoints),
};
