import { Configuration as WebpackConfig, optimize as Optimize } from 'webpack';

module.exports = function(env: any): WebpackConfig {
    return {
        devtool:    'source-map',
        entry:      './src/ts/index.tsx',
        externals: {
            'react':            'React',
            'react-dom':        'ReactDOM',
            'react-data-grid':  'ReactDataGrid'
        },
        module: {
            rules: [
                { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
                { test: /\.js$/,   loader: 'source-map-loader', enforce: 'pre' }
            ]
        },
        output: {
            filename:   'breeding.js',
            path:       `${env.BUILD_DIR}/explodedModule/web/breeding`
        },
        plugins: [
            //new Optimize.UglifyJsPlugin()
        ],
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json' ]
        }
    };
};