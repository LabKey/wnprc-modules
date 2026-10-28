/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */
const fs = require('fs');
const path = require('path');
const { rspack } = require('@rspack/core');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { TsCheckerRspackPlugin } = require('ts-checker-rspack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const host = require("./host.js");

const cwd = path.resolve('./').split(path.sep);
const lkModule = cwd[cwd.length - 1];
const isProductionBuild = process.env.NODE_ENV === 'production';

// Default to the @labkey packages in the node_moules directory.
// If LINK is set we configure the paths of @labkey modules to point to the source files (see below), which enables
// hot module reload to work across packages.
// NOTE: the LABKEY_UI_COMPONENTS_HOME and LABKEY_UI_PREMIUM_HOME environment variable must be set for this to work.
let labkeyUIComponentsPath = path.resolve('./node_modules/@labkey/components');
let labkeyUIPremiumPath = path.resolve('./node_modules/@labkey/premium');
let labkeyUIEhrPath = path.resolve('./node_modules/@labkey/ehr');
const labkeyBuildTSConfigPath = path.resolve('./node_modules/@labkey/build/configs/tsconfig.json');
const customTSConfigPath = path.resolve('./tsconfig.json');
const tsconfigPath = fs.existsSync(customTSConfigPath) ? customTSConfigPath : labkeyBuildTSConfigPath;

if (process.env.LINK) {
    if (process.env.LABKEY_UI_COMPONENTS_HOME !== undefined) {
        labkeyUIComponentsPath = process.env.LABKEY_UI_COMPONENTS_HOME + '/packages/components/src';
        console.log('Using @labkey/components path:', labkeyUIComponentsPath);
    }
    else {
        console.log('Environment variable LABKEY_UI_COMPONENTS_HOME not defined. Not linking to @labkey/components.');
    }

    if (process.env.LABKEY_UI_PREMIUM_HOME !== undefined) {
        labkeyUIPremiumPath = process.env.LABKEY_UI_PREMIUM_HOME + '/src';
        console.log('Using @labkey/premium path:', labkeyUIPremiumPath);
    }
    else {
        console.log('Environment variable LABKEY_UI_PREMIUM_HOME not defined. Not linking to @labkey/premium.');
    }

    if (process.env.LABKEY_UI_EHR_HOME !== undefined) {
        labkeyUIEhrPath = process.env.LABKEY_UI_EHR_HOME + '/src';
        console.log('Using @labkey/ehr path:', labkeyUIEhrPath);
    }
    else {
        console.log('Environment variable LABKEY_UI_EHR_HOME not defined. Not linking to @labkey/ehr.');
    }
}

const watchPort = process.env.WATCH_PORT || 3001;

// These minification options are a re-declaration of the default minification options
// for the HtmlWebpackPlugin with the addition of `caseSensitive` because LabKey's
// view templates can contain case-sensitive elements (e.g. `<permissionClasses>`).
// For more information see https://github.com/jantimon/html-webpack-plugin#minification.
const minifyTemplateOptions = {
    caseSensitive: true,
    collapseWhitespace: isProductionBuild,
    keepClosingSlash: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true
}

const SASS_PLUGINS = [
    {
        loader: 'css-loader',
        options: {
            importLoaders: 1
        }
    },
    {
        loader: 'resolve-url-loader',
        options: {
            silent: !isProductionBuild
        }
    },
    {
        loader: 'sass-loader',
        options: {
            implementation: require('sass'),
            sassOptions: {
                silenceDeprecations: ['import'],
                quietDeps: !isProductionBuild
            },
            // "sourceMap" must be set to true when resolve-url-loader is used downstream
            sourceMap: true
        }
    }
];

// We previously used babel-loader with a hand-ordered set of plugins so that the TypeScript transform ran before the
// class-properties transform, which is what made @babel/plugin-transform-typescript's `allowDeclareFields` behave
// correctly with Immutable. Rspack uses SWC (builtin:swc-loader) instead, which is where the major speed gain comes
// from. SWC reproduces the relevant behavior:
//   - TypeScript + TSX parsing handles both .ts/.tsx and .jsx (TS syntax is a superset).
//   - `transform.useDefineForClassFields: false` makes SWC assign class fields directly (the loose / "set" semantics
//     Babel produced) rather than emitting Object.defineProperty. Combined with SWC always ELIDING `declare` fields,
//     this matches Babel's allowDeclareFields behavior: declared-only fields produce no output and therefore do not
//     clobber Immutable Record defaults.
//   - `transform.react.runtime: 'classic'` matches our @babel/plugin-transform-react-jsx (classic React.createElement)
//     setup. In dev, `development` and `refresh` enable the React Fast Refresh transform (replacing
//     react-refresh/babel + @pmmmwh/react-refresh-webpack-plugin).
//   - `env.targets` carries over the browser targets we passed to @babel/preset-env (drives object-rest-spread,
//     async/await, etc. down-leveling). Note: do NOT also set jsc.target — SWC errors if both are present.
// NOTE: SWC's classic JSX transform does not replicate @babel/plugin-transform-react-display-name (auto-assigning
// component displayName). We set displayName explicitly in source (see CLAUDE.md React conventions), so this is a
// no-op in practice, but it is a behavioral difference from the old Babel pipeline.
const SWC_TARGETS = 'last 2 versions, not dead, not IE 11, > 5%';

const makeSwcConfig = (isDev) => ({
    loader: 'builtin:swc-loader',
    options: {
        jsc: {
            parser: {
                syntax: 'typescript',
                tsx: true,
            },
            transform: {
                react: {
                    runtime: 'classic',
                    development: isDev,
                    refresh: isDev,
                },
                // Match Babel's loose class-fields behavior so `declare` fields are elided rather than emitted as
                // `field = undefined`, which would clobber Immutable Record defaults.
                useDefineForClassFields: false,
            },
        },
        env: {
            targets: SWC_TARGETS,
        },
    },
});

const SWC_CONFIG = makeSwcConfig(false);
const SWC_DEV_CONFIG = makeSwcConfig(true);

const TS_CHECKER_CONFIG = {
    typescript: {
        configFile: tsconfigPath,
        configOverwrite: {
            include: ['src/client/**/*'],
            // excluding spec files shaves time off the build
            exclude: [
                'node_modules',
                '**/__mocks__/**/*',
                '**/*.*spec.*',
                '**/*.*test.*',
                'src/test',
                'resources','packages'
            ],
        },
        context: '.',
        diagnosticOptions: {
            semantic: true,
            syntactic: true,
        },
    }
};

const TS_CHECKER_DEV_CONFIG = {
    ...TS_CHECKER_CONFIG,
    typescript: {
        ...TS_CHECKER_CONFIG.typescript,
        configOverwrite: {
            ...TS_CHECKER_CONFIG.typescript.configOverwrite,
            compilerOptions: {
                paths: {
                    '@labkey/components': [labkeyUIComponentsPath],
                    '@labkey/premium': [labkeyUIPremiumPath],
                    '@labkey/premium/assay': [labkeyUIPremiumPath + '/assay'],
                    '@labkey/premium/eln': [labkeyUIPremiumPath + '/eln'],
                    '@labkey/premium/entities': [labkeyUIPremiumPath + '/entities'],
                    '@labkey/premium/workflow': [labkeyUIPremiumPath + '/workflow'],
                    '@labkey/premium/storage': [labkeyUIPremiumPath + '/storage'],
                    '@labkey/premium/search': [labkeyUIPremiumPath + '/search]'],
                    '@labkey/ehr': [labkeyUIEhrPath],
                    '@labkey/ehr/participanthistory': [labkeyUIEhrPath + '/participanthistory']
                }
            }
        },
    }
};

const labkeyPackagesDev = process.env.LINK
        ? {
            // Note that for modules that don't have these packages, the aliases are just ignored and don't
            // seem to cause any problems.
            '@labkey/api': path.resolve('./node_modules/@labkey/api'),
            '@labkey/components': labkeyUIComponentsPath,
            '@labkey/premium': labkeyUIPremiumPath,
            '@labkey/premium/assay': labkeyUIPremiumPath + '/assay',
            '@labkey/premium/eln': labkeyUIPremiumPath + '/eln',
            '@labkey/premium/entities': labkeyUIPremiumPath + '/entities',
            '@labkey/premium/workflow': labkeyUIPremiumPath + '/workflow',
            '@labkey/premium/storage': labkeyUIPremiumPath + '/storage',
            '@labkey/premium/search': labkeyUIPremiumPath + '/search',
            '@labkey/ehr': labkeyUIEhrPath,
            '@labkey/ehr/participanthistory': labkeyUIEhrPath + '/participanthistory',
        }
        : {};

// There is a bug in react-router 7.x that causes a warning about import.meta.hot being undefined, which does not affect
//  us but does cause a warning to be emitted and triggers the error overlay in our hot reload builds.
const ignoreWarnings = [
    { module: /react-router/, message: /import\.meta/ },
];

module.exports = {
    ignoreWarnings,
    lkModule,
    labkeyUIComponentsPath,
    labkeyUIPremiumPath,
    labkeyUIEhrPath,
    tsconfigPath,
    watchPort,
    TS_CHECKER_CONFIG,
    TS_CHECKER_DEV_CONFIG,
    context: path.resolve(lkModule, '..'),
    extensions: {
        TYPESCRIPT: [ '.jsx', '.js', '.tsx', '.ts' ]
    },
    loaders: {
        FILES: [
            {
                test: /\.(woff|woff2)$/,
                type: 'asset',
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset',
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/resource',
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset',
            },
            {
                test: /\.png(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset',
            }
        ],
        SOURCE_MAP: [
            {
                // Matches against package source files (e.g. premium.js, components.js, etc.)
                test: /\.js$/,
                enforce: 'pre',
                use: [{
                    loader: 'source-map-loader',
                    options: {
                        // Match only against source maps provided by @labkey packages
                        filterSourceMappingUrl: (url, resourcePath) => /\/@labkey\//.test(resourcePath),
                    }
                }],
            }
        ],
        STYLE: [
            {
                test: /\.css$/,
                // `type: 'javascript/auto'` opts these rules out of Rspack's native CSS handling so that
                // CssExtractRspackPlugin (the mini-css-extract-plugin replacement) processes them instead.
                type: 'javascript/auto',
                use: [rspack.CssExtractRspackPlugin.loader, 'css-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                type: 'javascript/auto',
                use: [rspack.CssExtractRspackPlugin.loader].concat(SASS_PLUGINS),
            },
        ],
        STYLE_DEV: [
            {
                test: /\.css$/,
                type: 'javascript/auto',
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                type: 'javascript/auto',
                use: ['style-loader'].concat(SASS_PLUGINS),
            },
        ],
        TYPESCRIPT: [
            {
                test: /\.(jsx|ts|tsx)(?!.*\.(spec|test)\.(jsx?|tsx?))$/,
                use: [SWC_CONFIG]
            }
        ],
        TYPESCRIPT_WATCH: [
            {
                test: /\.(jsx|ts|tsx)(?!.*\.(spec|test)\.(jsx?|tsx?))$/,
                use: [SWC_DEV_CONFIG]
            }
        ]
    },
    aliases: {
        LABKEY_PACKAGES: {
            '@labkey/components-scss': labkeyUIComponentsPath + '/dist/assets/scss/theme',
            '@labkey/components-app-scss': labkeyUIComponentsPath + '/dist/assets/scss/theme/app',
            '@labkey/premium-scss': labkeyUIPremiumPath + '/dist/assets/scss/theme',
            '@labkey/ehr-scss': labkeyUIEhrPath + '/dist/assets/scss/theme',
        },
        LABKEY_PACKAGES_DEV: {
            ...labkeyPackagesDev,
            // need to set the path based on the LINK var
            '@labkey/components-scss': labkeyUIComponentsPath + (process.env.LINK ? '/theme' : '/dist/assets/scss/theme'),
            '@labkey/components-app-scss': labkeyUIComponentsPath + (process.env.LINK ? '/theme/app' : '/dist/assets/scss/theme/app'),
            '@labkey/premium-scss': labkeyUIPremiumPath + (process.env.LINK ? '/theme' : '/dist/assets/scss/theme'),
            '@labkey/ehr-scss': labkeyUIEhrPath + (process.env.LINK ? '/theme' : '/dist/assets/scss/theme'),
        },
    },
    outputPath: path.resolve('./resources/web/gen'),
    processEntries: function(entryPoints) {
        return entryPoints.apps.reduce((entries, app) => {
            entries[app.name] = app.path + '/app.tsx';
            return entries;
        }, {});
    },
    processPlugins: function(entryPoints) {
        let allPlugins = entryPoints.apps.reduce((plugins, app) => {
            // Generate dependencies via lib.xml rather than view.xml
            if (app.generateLib === true) {
                plugins = plugins.concat([
                    new HtmlWebpackPlugin({
                        inject: false,
                        module: lkModule,
                        name: app.name,
                        title: app.title,
                        dependencies: app.dependencies,
                        viewTemplate: app.template,
                        filename: '../../web/gen/' + app.name + '.lib.xml',
                        template: 'node_modules/@labkey/build/configs/lib.template.xml',
                        minify: minifyTemplateOptions
                    }),
                ]);
            } else {
                plugins = plugins.concat([
                    new HtmlWebpackPlugin({
                        inject: false,
                        module: lkModule,
                        name: app.name,
                        title: app.title,
                        dependencies: app.dependencies,
                        permission: app.permission, // deprecated
                        permissionClasses: app.permissionClasses,
                        requiresLogin: app.requiresLogin,
                        requiresNoPermission: app.requiresNoPermission,
                        viewTemplate: app.template,
                        filename: '../../views/gen/' + app.name + '.view.xml',
                        template: 'node_modules/@labkey/build/configs/app.view.template.xml',
                        minify: minifyTemplateOptions
                    }),
                    new HtmlWebpackPlugin({
                        inject: false,
                        host: host.ip,
                        filename: '../../views/gen/' + app.name + '.html',
                        template: './ios-webpack/app.template.html',
                        minify: minifyTemplateOptions
                    }),
                    new HtmlWebpackPlugin({
                        inject: false,
                        mode: 'dev',
                        module: lkModule,
                        name: app.name,
                        title: app.title,
                        dependencies: app.dependencies,
                        permission: app.permission, // deprecated
                        permissionClasses: app.permissionClasses,
                        requiresLogin: app.requiresLogin,
                        requiresNoPermission: app.requiresNoPermission,
                        viewTemplate: app.template,
                        filename: '../../views/gen/' + app.name + 'Dev.view.xml',
                        template: 'node_modules/@labkey/build/configs/app.view.template.xml',
                        minify: minifyTemplateOptions
                    }),
                    new HtmlWebpackPlugin({
                        inject: false,
                        mode: 'dev',
                        host: host.ip,
                        port: watchPort,
                        name: app.name,
                        nonce: '<%=scriptNonce%>',
                        filename: '../../views/gen/' + app.name + 'Dev.html',
                        template: './ios-webpack/app.template.html',
                        minify: minifyTemplateOptions
                    })
                ]);
            }
            return plugins;
        }, []);

        allPlugins.push(new rspack.CssExtractRspackPlugin({
            filename: '[name].[contenthash].css',
        }));

        allPlugins.push(new TsCheckerRspackPlugin(TS_CHECKER_CONFIG));

        if (process.env.ANALYZE) {
            allPlugins.push(new BundleAnalyzerPlugin());
        }

        return allPlugins;
    }
};
