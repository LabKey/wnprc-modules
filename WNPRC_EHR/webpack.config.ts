// noinspection TsLint: webpack is in the dev dependencies
import * as Webpack from 'webpack';

const path = require('path');

var breedingConfig = function wp(env: { BUILD_DIR: string }){

    return {
        devtool: 'source-map',
        entry: './src/ts/breeding.ts',
        externals: {
            jquery: 'jQuery',
            urijs: 'URI',
        },
        module: {
            rules: [
                { loader: 'ts-loader', test: /\.tsx?$/ },
                { loader: 'source-map-loader', options: { enforce: 'pre' }, test: /\.js$/ },
            ],
        },
        output: {
            filename: 'breeding.js',
            library: 'Breeding',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
    };
};

var testConfig = function wp(env: { BUILD_DIR: string }) {

    return {
        devtool: 'source-map',
        entry: './src/ts/test.tsx',
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
                    test: /\.css$/,
                    loaders: ['style-loader', 'css-loader', 'sass-loader']
                }
            ],
        },
        output: {
            filename: 'test.js',
            library: 'Test',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
    };
};
var feedingConfig = function wp(env: { BUILD_DIR: string }) {

    return {
        mode: process.env.NODE_ENV,
        devtool: 'source-map',
        entry: './src/feeding/base/App.tsx',
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
            filename: 'feeding.js',
            library: 'Feeding',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
};

var weightConfig = function wp(env: { BUILD_DIR: string }) {

    return {
        mode: process.env.NODE_ENV,
        devtool: 'source-map',
        entry: './src/weight/app.tsx',
        externals: {
            jquery: 'jQuery',
            urijs: 'URI',
            LABKEY: 'LABKEY'
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
            filename: 'weight.js',
            library: 'Weight',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
};

declare const module: any;
module.exports = [
    breedingConfig, testConfig, feedingConfig, weightConfig
];

