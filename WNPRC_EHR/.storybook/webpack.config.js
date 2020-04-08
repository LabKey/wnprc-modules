// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
    // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    config.devtool = 'eval-source-map';

    config.module.rules.push({
        test: /\.(ts|tsx)$/,
        loaders: ['babel-loader', 'ts-loader']
    });

    config.module.rules.push({
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
    });

    config.resolve.extensions.push('.ts', '.tsx', ".scss");

    // Return the altered config
    return config;
};