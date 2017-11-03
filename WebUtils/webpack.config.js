const path = require('path');

// expected environment variables:
//
//   env.BUILD_DIR: the Gradle build directory (i.e., '[labkey root]/build/modules/[module name]')
//
module.exports = function(env) {
    return {
        entry: path.resolve(__dirname, 'src', 'ts', 'legacy.ts'),

        output: {
            path: path.resolve(env.BUILD_DIR, 'explodedModule', 'web', 'webutils', 'lib'),
            filename: 'webutils.js',
            library: 'WebUtils',
            libraryTarget: 'umd',
            sourceMapFilename: 'webutils.js.map'
        },

        // Enable sourcemaps for debugging webpack's output.
        // TODO: switch to 'source-map' for production
        devtool: "eval-source-map",

        resolve: {
            alias: {
                classify: path.join(__dirname, "./external_resources/js/classify.js"),
                supersqlstore: path.join(__dirname, "./external_resources/js/supersqlstore.js")
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

        externals: {
            'c3': 'c3',
            'd3': 'd3',
            'fetch': 'fetch',
            'jquery': 'jQuery',
            'knockout': 'ko',
            'moment': 'moment',
            'qunit': 'QUnit',
            'Qunit': 'Qunit',
            'react': 'React',
            'React': 'React',

            'react-dom': 'ReactDOM',
            'react-dom/server': 'ReactDOMServer'
        }
    }
};