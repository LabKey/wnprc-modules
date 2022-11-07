const path = require('path');
module.exports = function wp(env) {
    const base = {
        entry: './src/client/primateid.ts',
        externals: {
            console: 'console',
        },
        mode: process.env.NODE_ENV,
        module: {
            rules: [
                {loader: 'ts-loader', test: /\.tsx?$/},
            ],
        },
        output: {
            filename: 'primateid.webpack.js',
            library: 'PrimateID',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
    };
    return [
        {   // create a configuration for the server side (in 'scripts')
            ...base,
            output: {
                ...base.output,
                libraryTarget: 'commonjs',
                path: path.resolve(__dirname, `resources/scripts/primateid/gen`)
            }
        },
        {   // create a configuration for the client side (in 'web')
            ...base,
            output: {
                ...base.output,
                libraryTarget: 'var',
                path: path.resolve(__dirname, `resources/web/primateid/gen`)
            }
        },
    ];
};
