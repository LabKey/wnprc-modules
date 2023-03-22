require("babel-polyfill");
const path = require("path");
const webpack = require("webpack");

module.exports = {
    context: path.resolve(__dirname, '..'),

    devtool: 'eval',

    entry: {
        'app': [
            'babel-polyfill',
            'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
            './src/client/app.tsx'
        ]
    },

    output: {
        path: path.resolve(__dirname, '../resources/web/AnimalRequests/gen/'),
        publicPath: 'http://localhost:3000/',
        filename: '[name].js'
    },

    externals: {
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
    },

    module: {
        rules: [{
            test: /\.tsx?$/,
            loaders: ['babel-loader', 'ts-loader']
        }]
    },

    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],

    resolve: {
        extensions: [ '.jsx', '.js', '.tsx', '.ts' ]
    }
};
