const path = require('path');

var dropdownConfig = function wp(env) {

    return {
        mode: process.env.NODE_ENV,
        devtool: 'source-map',
        entry: './src/client/AccountsForm/app.tsx',
        externals: {
            jquery: 'jQuery',
            urijs: 'URI',
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader"
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader']
                }
            ],
        },
        output: {
            filename: 'dropdown.js',
            library: 'DropdownSelect',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_virology/gen'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
};
module.exports = [
    dropdownConfig
];
