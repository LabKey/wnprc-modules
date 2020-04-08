// noinspection TsLint: webpack is in the dev dependencies
import * as Webpack from 'webpack';

// IntelliJ and TsLint get very angry when faced with ambiguity, so this
// interface constrains our configuration object to using a certain type
// of loader rule to load modules
interface Configuration extends Webpack.Configuration
{
    module: {
        rules: Webpack.NewLoaderRule[];
    };
}

declare const module: any;
module.exports = function wp(env: { BUILD_DIR: string, PROJECT_DIR: string }): Configuration[] {
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
        plugins: [
            new Webpack.optimize.UglifyJsPlugin()
        ],
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
