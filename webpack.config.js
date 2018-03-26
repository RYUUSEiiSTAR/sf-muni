const path = require('path');
const webpack = require('webpack');
const extractTextPlugin = require('extract-text-webpack-plugin');
const extractScss = new extractTextPlugin({
    filename: './styles.css'
});

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'src');

module.exports = {
    entry: APP_DIR + '/index.jsx',
    output: {
        devtoolLineToLine: true,
        sourceMapFilename: "bundle.js.map",
        pathinfo: true,
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                include: APP_DIR,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react']
                    }
                }
            },
            {
                test: /\.scss$/,
                include: APP_DIR,
                use: extractScss.extract({
                    use: [{
                        loader: 'css-loader'
                    }, {
                        loader: 'sass-loader'
                    }],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.(html|json|svg)$/,
                include: APP_DIR,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                        context: './src'
                    }
                }]
            }
        ]
    },
    plugins: [
        extractScss
    ]
};