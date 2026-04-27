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

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const constants = require('./constants');
const path = require('path');
// relative to the <lk_module>/node_modules/@labkey/build/webpack dir
const entryPoints = require('../src/client/entryPoints.js');
const host = require("./host");


const devServer = {
    client: {
        overlay: true,
    },
    host: host.ip,
    port: constants.watchPort,
    hot: true,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    static: {
        watch: {
            // Ignore any packages folders, if we don't ignore packages then we will incorrectly trigger builds in
            // package folders (e.g. changing a file in the SM Workflow package would incorrectly trigger a build in SM)
            ignored: process.env.LINK ? undefined : ['**/packages']
        },
    },
};

const devServerURL = 'http://' + devServer.host + ':' + devServer.port;

let entries = {};
for (let i = 0; i < entryPoints.apps.length; i++) {
    const entryPoint = entryPoints.apps[i];

    entries[entryPoint.name] = [
        entryPoint.path + '/dev.tsx'
    ];
}

module.exports = {
    context: constants.context,
    mode: 'development',
    devServer: devServer,
    entry: entries,
    output: {
        path: constants.outputPath,
        publicPath: devServerURL + '/',
        filename: "[name].js"
    },
    resolve: {
        alias: {
            ...constants.aliases.LABKEY_PACKAGES_DEV,
            // This assures there is only one copy of react used while doing start-link
            react: path.resolve('./node_modules/react'),
            'react-router-dom': path.resolve('./node_modules/react-router-dom'),
        },
        extensions: constants.extensions.TYPESCRIPT.concat('.scss')
    },
    module: {
        rules: constants.loaders.TYPESCRIPT_WATCH.concat(constants.loaders.STYLE_DEV).concat(constants.loaders.FILES)
    },
    optimization: {
        // do not emit compiled assets that include errors
        emitOnErrors: false,
    },
    plugins: [
        new ReactRefreshWebpackPlugin(),
        // This Plugin type checks our TS code, @babel/preset-typescript does not type check, it only transforms
        new ForkTsCheckerWebpackPlugin(constants.TS_CHECKER_DEV_CONFIG)
    ],
};
