/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
require("@babel/polyfill");
var path = require("path");

module.exports  = [function wp() {

    return {
        mode: process.env.NODE_ENV,
        devtool: 'source-map',
        entry: './src/client/app.tsx',
        externals: {
            jquery: 'jQuery',
            urijs: 'URI',
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader"
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader']
                }
            ],
        },
        output: {
            filename: 'app.js',
            library: 'AnimalRequests',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/AnimalRequests/gen/')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
}];
