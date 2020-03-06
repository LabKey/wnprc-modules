require("@babel/polyfill");
var webpack = require("webpack");
var path = require("path");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  context: path.resolve(__dirname, ".."),

  devtool: "source-map",

  entry: {
    app: [
      "@babel/polyfill",
      "./src/client/theme/style.js",
      "./src/client/app.tsx"
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loaders: ["babel-loader", "ts-loader"]
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: [
            {
              loader: "css-loader",
              options: {
                sourceMap: true
              }
            }
          ],
          fallback: "style-loader"
        })
      },
      {
        test: /style.js/,
        loaders: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true
            }
          }
        ]
      }
    ]
  },

  output: {
    path: path.resolve(__dirname, "../resources/web/EnterWeights/app/"),
    publicPath: "./", // allows context path to resolve in both js/css
    filename: "[name].js"
  },

  resolve: {
    extensions: [".jsx", ".js", ".tsx", ".ts"]
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"development"'
    }),
    //new BundleAnalyzerPlugin(),
    new ExtractTextPlugin({
      allChunks: true,
      filename: "[name].css"
    })
  ]
};
