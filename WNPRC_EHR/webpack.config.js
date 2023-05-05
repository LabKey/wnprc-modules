const path = require('path');

let breedingConfig = function wp(env) {

    return {
        devtool: 'source-map',
        entry: './src/client/breeding.ts',
        externals: {
            jquery: 'jQuery',
            urijs: 'URI',
        },
        mode: process.env.NODE_ENV,
        module: {
            rules: [
                { loader: 'ts-loader', test: /\.tsx?$/ },
                { loader: 'source-map-loader', options: { enforce: 'pre' }, test: /\.js$/ },
            ],
        },
        output: {
            filename: 'breeding.js',
            library: 'Breeding',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
    };
};


let feedingConfig = function wp(env) {

    return {
        mode: process.env.NODE_ENV,
        devtool: 'source-map',
        entry: './src/client/feeding/base/App.tsx',
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
            filename: 'feeding.js',
            library: 'Feeding',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
};
var abstractConfig = function wp(env) {

    return {
        mode: process.env.NODE_ENV,
        devtool: 'source-map',
        entry: './src/client/abstract/base/App.tsx',
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
            filename: 'abstract.js',
            library: 'Abstract',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
};

let researchUltrasoundsConfig = function wp(env) {

    return {
        devtool: 'source-map',
        entry: './src/client/research_ultrasounds.ts',
        externals: {
            jquery: 'jQuery',
            urijs: 'URI',
        },
        mode: process.env.NODE_ENV,
        module: {
            rules: [
                {loader: 'ts-loader', test: /\.tsx?$/},
                {loader: 'source-map-loader', options: {enforce: 'pre'}, test: /\.js$/},
            ],
        },
        output: {
            filename: 'research_ultrasounds.js',
            library: 'ResearchUltrasounds',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
    };
};

var weightConfig = function wp(env) {

    return {
        mode: process.env.NODE_ENV,
        devtool: 'source-map',
        entry: './src/client/weight/app.tsx',
        externals: {
            jquery: 'jQuery',
            urijs: 'URI',
            LABKEY: 'LABKEY'
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
            filename: 'weight.js',
            library: 'Weight',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
};

let waterMonitoringConfig = function wp(env) {

    return {
        devtool: 'source-map',
        entry: './src/client/watermonitoring/waterMonitoringSystem.ts',
        externals: {
            jquery: 'jQuery',
            urijs: 'URI',
            LABKEY: 'LABKEY'
        },
        mode: process.env.NODE_ENV,
        module: {
            rules: [
                {
                    loader: 'ts-loader',
                    test: /\.tsx?$/},
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader']
                },
            ],
        },
        output: {
            filename: 'waterMonitoringSystem.js',
            library: 'waterMonitoringSystem',
            libraryExport: 'default',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'resources/web/wnprc_ehr/gen')
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
        },
    };
};

module.exports = [
    breedingConfig, feedingConfig, researchUltrasoundsConfig, abstractConfig, weightConfig, waterMonitoringConfig
];
