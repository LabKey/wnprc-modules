/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
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
