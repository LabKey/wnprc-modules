// noinspection TsLint: webpack is in the dev dependencies
import * as Webpack from 'webpack';

const path = require('path');

// IntelliJ and TsLint get very angry when faced with ambiguity, so this
// interface constrains our configuration object to using a certain type
// of loader rule to load modules
interface Configuration extends Webpack.Configuration {
    module: {
        rules: Webpack.NewLoaderRule[];
    };
}

var breedingConfig = function wp(env: { BUILD_DIR: string }): Configuration {

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

var testConfig = function wp(env: { BUILD_DIR: string }): Configuration {

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

declare const module: any;
module.exports = [
    breedingConfig, testConfig
];

