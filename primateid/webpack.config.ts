// noinspection TsLint: webpack is in the dev dependencies
import * as Webpack from 'webpack';

declare const module: any;
module.exports = function wp(env: { BUILD_DIR: string, PROJECT_DIR: string }) {
    const base = {
        entry: './src/ts/primateid.ts',
        externals: {
            console: 'console',
        },
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
                path: `${env.PROJECT_DIR}/resources/scripts/primateid`
            }
        },
        {   // create a configuration for the client side (in 'web')
            ...base,
            output: {
                ...base.output,
                libraryTarget: 'var',
                path: `${env.PROJECT_DIR}/resources/web/primateid`
            }
        },
    ];
};
