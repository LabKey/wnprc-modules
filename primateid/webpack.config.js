/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
const path = require('path');
module.exports = function wp(env) {
    const base = {
        entry: './src/client/primateid.ts',
        target: ['web', 'es5'],
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
            library: {
                name: 'PrimateID',
            },
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
                library: {
                    name: 'PrimateID',
                    type: 'commonjs',
                },
                path: path.resolve(__dirname, `resources/scripts/primateid/gen`)
            }
        },
        {   // create a configuration for the client side (in 'web')
            ...base,
            output: {
                ...base.output,
                library: {
                    name: 'PrimateID',
                    type: 'var',
                },
                path: path.resolve(__dirname, `resources/web/primateid/gen`)
            }
        },
    ];
};
