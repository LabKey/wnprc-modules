// noinspection TsLint
import { Configuration as WebpackConfig, optimize as Optimize } from 'webpack';

module.exports = function wp(env: any): WebpackConfig {
    return {
        devtool:    'source-map',
        entry:      './src/ts/breeding.ts',
        externals: {
            jquery:           'jQuery',
        },
        module: {
            rules: [
                { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
                { test: /\.js$/,   loader: 'source-map-loader', enforce: 'pre' },
            ],
        },
        output: {
            filename:       'breeding.js',
            library:        'Breeding',
            libraryExport:  'default',
            libraryTarget:  'umd',
            path:           `${env.BUILD_DIR}/explodedModule/web/breeding`,
        },
        plugins: [
            // new Optimize.UglifyJsPlugin()
        ],
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json' ],
        },
    };
};