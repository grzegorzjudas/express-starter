const env = process.env.NODE_ENV || 'development';

const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const exec = require('child_process').exec;
const CONFIG = require('./config.json')[env];

function printEnvironment (environment, colors) {
    console.log([
        colors ? '\x1b[34m' : '',
        '===================================',
        `Building server for: ${environment}`,
        '===================================',
        colors ? '\x1b[0m' : ''
    ].join('\n'));
}

function cleanWorkspace () {
    exec('rm -rf build/');
}

function switchEnvs (dev, prod) {
    if (process.env.NODE_ENV !== 'production') return dev;

    return prod;
}

cleanWorkspace();

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
        publicPath: '/'
    },
    target: 'node',
    resolve: {
        alias: {
            common: path.join(__dirname, '..', 'homie-common/src')
        },
        extensions: [ '.ts', '.js', '.json' ]
    },
    externals: switchEnvs({
        express: 'commonjs express'
    }, {}),
    devtool: switchEnvs('cheap-module-source-map'),
    mode: env,
    module: {
        rules: [
            {
                test: /\.(ts|js)$/,
                exclude: [ /node_modules/, /\.spec.ts$/ ],
                use: [
                    { loader: 'ts-loader' }
                ]
            }
        ]
    },
    plugins: switchEnvs([
        new webpack.DefinePlugin({ CONFIG: JSON.stringify(CONFIG) })
    ], [
        new CopyWebpackPlugin([ { from: './ecosystem.config.js' } ])
    ])
};
