//
//   env.BUILD_DIR: the Gradle build directory (i.e., '[labkey root]/build/modules/[module name]')
//
import { Configuration as WebpackConfig } from 'webpack'
import * as path from "path"

module.exports = function(env: any): WebpackConfig {
    return {
        entry: {
            'manage-templates':  './src/ts/pages/manage-templates.tsx',
            'necropsy-schedule': './src/ts/pages/necropsy-schedule.tsx',
            'PathCaseList':      './src/ts/pages/PathCaseList.tsx'
        },

        output: {
            path: `${env.BUILD_DIR}/explodedModule/web/wnprc_ehr/`,
            filename: '[name].js',
            sourceMapFilename: '[name].js.map'
        },

        devtool: "source-map",

        resolve: {
            alias: {
                'WebUtils/GeneratedFromJava$' : path.resolve(__dirname, "../WebUtils/build/generated-ts/GeneratedFromJava.ts"),
                'WebUtils': path.resolve(__dirname, "../WebUtils/src/ts/WebUtils"),
                'GeneratedFromJava' : path.resolve(__dirname, "./build/generated-ts/GeneratedFromJava.ts")
            },
            extensions: [".ts", ".tsx", ".js"],
        },

        module: {
            rules: [
                {test: /\.tsx?$/, loader: "ts-loader"},
                {test: /\.js$/,   loader: "source-map-loader", enforce: "pre"},
                {test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery'},
                {test: require.resolve('moment'), loader: 'expose-loader?moment'}
            ]
        },
    }
};