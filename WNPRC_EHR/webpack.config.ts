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

declare const module: any;
module.exports = [
    function wp(env: { BUILD_DIR: string }): Configuration {

        return {
            devtool: 'source-map',
            entry: './src/ts/breeding.ts',
            externals: {
                jquery: 'jQuery',
                urijs: 'URI',
            },
            module: {
                rules: [
                    { loader: 'awesome-typescript-loader', test: /\.tsx?$/ },
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
    },
    function wp(env: { BUILD_DIR: string }): Configuration {

        return {
            devtool: 'source-map',
            entry: './src/ts/research_ultrasounds.ts',
            externals: {
                jquery: 'jQuery',
                urijs: 'URI',
            },
            module: {
                rules: [
                    { loader: 'awesome-typescript-loader', test: /\.tsx?$/ },
                    { loader: 'source-map-loader', options: { enforce: 'pre' }, test: /\.js$/ },
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
    }
];