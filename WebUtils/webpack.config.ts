//
//   env.BUILD_DIR: the Gradle build directory (i.e., '[labkey root]/build/modules/[module name]')
//
import { Configuration as WebpackConfig, optimize as Optimize } from 'webpack'

module.exports = function(env: any): WebpackConfig {
    return {
        entry: {
          legacy: './src/ts/legacy.ts',
        },

        output: {
            path: `${env.BUILD_DIR}/explodedModule/web/webutils/lib`,
            filename: '[name].js',
            library: 'WebUtils',
            libraryTarget: 'umd',
            sourceMapFilename: '[name].js.map'
        },

        // Enable sourcemaps for debugging webpack's output.
        // TODO: switch to 'source-map' for production
        devtool: "source-map",

        resolve: {
            alias: {
                classify: "../../external_resources/js/classify.js",
                supersqlstore: "../../external_resources/js/supersqlstore.js"
            },

            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".ts", ".tsx", ".js"],

            // Include Bower to find certain modules.
            modules: ["node_modules"],
            descriptionFiles: ["package.json"]
        },

        module: {
            rules: [
                // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
                {test: /\.tsx?$/, loader: "ts-loader"},

                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                {test: /\.js$/, loader: "source-map-loader", enforce: "pre"},

                {test: /\.scss$/, loader: 'style!css!sass'}
            ]
        },

        plugins: [

            new Optimize.CommonsChunkPlugin({
                filename: 'externals.js',
                name:     'externals',
                minChunks: m => typeof m.context == 'string' && (m.context.indexOf('node_modules') != -1 || m.context.indexOf('external_resources') != -1)
            }),
            new Optimize.UglifyJsPlugin({sourceMap: true})
        ]
    }
};