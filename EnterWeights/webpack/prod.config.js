require("@babel/polyfill");
var path = require("path");
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: process.env.NODE_ENV,

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
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
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
    new MiniCssExtractPlugin()
  ]
};
