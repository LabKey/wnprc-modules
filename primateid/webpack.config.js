const path = require('path');

const base = {
    entry: './src/ts/primateid.ts',
    mode: 'production',
    externals: {
        console: 'console'
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
            }
        ]
    },
    output: {
        filename: 'primateid.webpack.js',
        library: 'PrimateID'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    }
};

module.exports = [
    {   // create a configuration for the server side (in 'scripts')
        ...base,
        output: {
            ...base.output,
            libraryTarget: 'commonjs',
            path: path.resolve(__dirname, 'resources/scripts/primateid')
        }
    },
    {   // create a configuration for the client side (in 'web')
        ...base,
        output: {
            ...base.output,
            libraryTarget: 'var',
            path: path.resolve(__dirname, 'resources/web/primateid')
        }
    }
];
