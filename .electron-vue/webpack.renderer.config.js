'use strict';

process.env.BABEL_ENV = 'renderer';

const path = require('path');
const { dependencies } = require('../package.json');
const webpack = require('webpack');
const config = require('../config');
const IsWeb = process.env.ENV_TARGET === 'web';

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}
/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = IsWeb ? [] : ['vue', 'element-ui'];

let rendererConfig = {
  devtool: '#cheap-module-eval-source-map',
  entry: {
    renderer: resolve('src/renderer/main.js'),
  },
  externals: [
    ...Object.keys(dependencies || {}).filter(
      (d) => !whiteListedModules.includes(d)
    ),
  ],
  module: {
    rules: [
      // {
      //   test: /\.(js|vue)$/,
      //   enforce: 'pre',
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'eslint-loader',
      //     options: {
      //       formatter: require('eslint-friendly-formatter')
      //     }
      //   }
      // },
      {
        test: /analyze\.js$/,
        loader: 'string-replace-loader',
        options: {
          search: /\$API_KEY/i,
          replace: process.env.API_KEY
        }
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false,
            },
          },
          'sass-loader?indentedSyntax',
        ],
      },
      {
        test: /\.less$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false,
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: 'vue-html-loader',
      },
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
        options: {
          target: 'es2015'
        }
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            cacheDirectory: 'node_modules/.cache/vue-loader',
            cacheIdentifier: '7270960a',
          },
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [resolve('src/renderer/icons')],
        options: {
          symbolId: 'icon-[name]',
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        exclude: [resolve('src/renderer/icons')],
        use: {
          loader: 'url-loader',
          query: {
            esModule: false,
            limit: 10000,
            name: 'imgs/[name]--[folder].[ext]',
          },
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          esModule: false,
          limit: 10000,
          name: 'media/[name]--[folder].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            esModule: false,
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]',
          },
        },
      },
    ],
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production',
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new webpack.DefinePlugin({
      'process.env':
        process.env.NODE_ENV === 'production'
          ? config.build.env
          : config.dev.env,
      'process.env.IS_WEB': IsWeb,
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve('src/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
      },
      templateParameters(compilation, assets, options) {
        return {
          compilation: compilation,
          webpack: compilation.getStats().toJson(),
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: options,
          },
          process,
        };
      },
      nodeModules: false,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  output: {
    filename: '[name].js',
    libraryTarget: IsWeb ? 'var' : 'commonjs2',
    path: IsWeb
      ? path.join(__dirname, '../dist/web')
      : path.join(__dirname, '../dist/electron'),
  },
  resolve: {
    alias: {
      '@': resolve('src/renderer'),
      vue$: 'vue/dist/vue.esm.js',
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node'],
  },
  target: 'electron-renderer',
};

/**
 * Adjust rendererConfig for development settings
 */
if (process.env.NODE_ENV !== 'production' && !IsWeb) {
  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      __lib: `"${path
        .join(__dirname, `../${config.DllFolder}`)
        .replace(/\\/g, '\\\\')}"`,
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
    })
  );
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  rendererConfig.devtool = '';

  rendererConfig.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, '../static'),
          to: path.join(__dirname, '../dist/electron/static'),
          globOptions: {
            ignore: ['.*'],
          },
        },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    })
  );
  rendererConfig.optimization = {
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        extractComments: false,
        cache: true,
        sourceMap: false,
        terserOptions: {
          warnings: false,
          compress: {
            hoist_funs: false,
            hoist_props: false,
            hoist_vars: false,
            inline: false,
            loops: false,
            dead_code: true,
            booleans: true,
            if_return: true,
            warnings: false,
            drop_console: false,
            drop_debugger: true,
          },
        },
      }),
    ],
  };
  if (IsWeb) {
    rendererConfig.optimization.splitChunks = {
      chunks: 'async',
      cacheGroups: {
        vendor: {
          // 将第三方模块提取出来
          minSize: 30000,
          minChunks: 1,
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          priority: 1,
        },
        commons: {
          test: /[\\/]src[\\/]common[\\/]/,
          name: 'commons',
          minSize: 30000,
          minChunks: 3,
          chunks: 'initial',
          priority: -1,
          reuseExistingChunk: true, // 这个配置允许我们使用已经存在的代码块
        },
      },
    };
    rendererConfig.optimization.runtimeChunk = { name: 'runtime' };
  }
}

module.exports = rendererConfig;
