// noinspection TsLint: webpack is in the dev dependencies
import * as Webpack from 'webpack';

const path = require('path');

let breedingConfig = function wp(env: { BUILD_DIR: string }){

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

let testConfig = function wp(env: { BUILD_DIR: string }) {

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

let feedingConfig = function wp(env: { BUILD_DIR: string }) {

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
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
};
var abstractConfig = function wp(env: { BUILD_DIR: string }) {

    return {
        mode: process.env.NODE_ENV,
        devtool: 'source-map',
        entry: './src/abstract/base/App.tsx',
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
            filename: 'abstract.js',
            library: 'Abstract',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
};

let researchUltrasoundsConfig = function wp(env: { BUILD_DIR: string }) {

    return {
        devtool: 'source-map',
        entry: './src/ts/research_ultrasounds.ts',
        externals: {
            jquery: 'jQuery',
            urijs: 'URI',
        },
        module: {
            rules: [
                {loader: 'ts-loader', test: /\.tsx?$/},
                {loader: 'source-map-loader', options: {enforce: 'pre'}, test: /\.js$/},
            ],
        },
        output: {
            filename: 'research_ultrasounds.js',
            library: 'ResearchUltrasounds',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
    };
};

declare const module: any;
module.exports = [
    breedingConfig, testConfig, feedingConfig, researchUltrasoundsConfig, abstractConfig
];
