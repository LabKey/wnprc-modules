/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
const path = require("path");
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, '..'),

    entry: {
        'app': [
            './src/client/theme/style.js'
        ]
    },

    output: {
        path: path.resolve(__dirname, '../resources/web/AnimalRequests/gen/'),
        publicPath: '/',
        filename: 'style.js' // do not override app.js
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: [{
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    }],
                    fallback: 'style-loader'
                })
            },
            {
                test: /style.js/,
                loaders: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }]
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin({
            allChunks: true,
            filename: '[name].css'
        })
    ]
};
