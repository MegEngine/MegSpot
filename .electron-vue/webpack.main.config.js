'use strict';

process.env.BABEL_ENV = 'main';

const path = require('path');
const { dependencies } = require('../package.json');
const webpack = require('webpack');
const config = require('../config');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

let mainConfig = {
  entry: {
    main: path.join(__dirname, '../src/main/index.js'),
  },
  externals: [...Object.keys(dependencies || {})],
  module: {
    rules: [
      // {
      //   test: /\.(js)$/,
      //   enforce: 'pre',
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'eslint-loader',
      //     options: {
      //       formatter: require('eslint-friendly-formatter')
      //     }
      //   }
      // },
      // {
      //   test: /\.js$/,
      //   use: 'happypack/loader?id=MainHappyBabel',
      //   exclude: /node_modules/
      // },
      {
        test: /\.ts$/,
        use: [
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
          'ts-loader',
        ],
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production',
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron'),
  },
  plugins: [new webpack.NoEmitOnErrorsPlugin()],
  resolve: {
    alias: {
      '@config': resolve('config'),
    },
    extensions: ['.tsx', '.ts', '.js', '.json', '.node'],
  },
  target: 'electron-main',
};

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
      __lib: `"${path
        .join(__dirname, `../${config.DllFolder}`)
        .replace(/\\/g, '\\\\')}"`,
    })
  );
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    })
  );
}

module.exports = mainConfig;
