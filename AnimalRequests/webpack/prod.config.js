require("@babel/polyfill");
var webpack = require("webpack");
var path = require("path");

var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, '..'),

    devtool: 'source-map',

    entry: {
        'app': [
            '@babel/polyfill',
            './src/client/theme/style.js',
            './src/client/app.tsx'
        ]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loaders: ['babel-loader', 'ts-loader']
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: [{
                        loader: 'css-loader',
                        options: {
                            sourceMap: false
                        }
                    }],
                    fallback: 'style-loader'
                })
            },
            {
                test: /style.js/,
                loaders: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: false
                    }
                }]
            }
        ]
    },

    output: {
        path: path.resolve(__dirname, '../resources/web/animalrequests/app/'),
        //path: path.resolve(__dirname, '../../WNPRC_EHR/resources/web/wnprc_ehr/reactjs/animalrequests/'),
        publicPath: './', // allows context path to resolve in both js/css
        filename: "[name].js"
    },

    resolve: {
        extensions: [ '.jsx', '.js', '.tsx', '.ts' ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new ExtractTextPlugin({
            allChunks: true,
            filename: '[name].css'
        })
    ]
};
