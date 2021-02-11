const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: './src/ts/breeding.ts',
    mode: 'production',
    externals: {
        jquery: 'jQuery',
        urijs: 'URI'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loaders: [{
                    loader: 'ts-loader',
                    options: {
                        // this flag and the test regex will make sure that test files do not get bundled
                        // see: https://github.com/TypeStrong/ts-loader/issues/267
                        onlyCompileBundledFiles: true
                    }
                }],
                exclude: /node_modules/
            },
            { loader: 'source-map-loader', options: { enforce: 'pre' }, test: /\.js$/ }
        ]
    },
    output: {
        filename: 'breeding.js',
        library: 'Breeding',
        libraryExport: 'default',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    }
};