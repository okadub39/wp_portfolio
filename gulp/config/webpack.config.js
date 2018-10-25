const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

const ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'local';

const config = require('./index').getConfig(ENV);
const utils = require('./utils');

const webpackConfig = {
  entry  : utils.createEntry(config.jsEntryPoints, config.srcPath),
  output : {
    publicPath: config.publicPath,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    new ExtractTextPlugin({
      filename: 'css/[name].css'
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
    })
  ],
  module: {
    noParse: [/[\/\\]node_modules[\/\\]localforage[\/\\]dist[\/\\]localforage\.js$/, /node_modules\/localforage\/dist\/localforage.js/],
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ExtractTextPlugin.extract({
              use: ['css-loader'],
              fallback: 'vue-style-loader'
            }),
            sass: ExtractTextPlugin.extract({
              use: ['css-loader', 'sass-loader'],
              fallback: 'vue-style-loader'
            }),
            scss: ExtractTextPlugin.extract({
              use: ['css-loader', 'sass-loader'],
              fallback: 'vue-style-loader'
            })
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/' + config.vueImgDir + '/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {'modules': false}]
              ]
            }
          }
        ],
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': './src/js'
    }
  }
};


if (ENV !== 'production') {
  webpackConfig.devtool = 'inline-source-map';
}

if (ENV === 'local') {
  webpackConfig.watch = true;
}

if (ENV === 'production') {
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings : false,
        dead_code: true
      }
    })
  );
}

const entryPoints = config.jsEntryPoints;

if (config.divisionVendor) {
  let points = [].concat(entryPoints);

  for (let i = 0; i < entryPoints.length; i++) {
    const entryName = entryPoints[i];
    const chunkName = 'vendor.' + entryName;
    webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        name: chunkName,
        chunks: [entryName],
        minChunks: function (module, count) {
          return utils.isNodeModules(module, count)
        }
      })
    );
    points.push(chunkName);
  }

  webpackConfig.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor.common',
      chunks: points,
      minChunks: function (module, count) {
        return count >= 2 && utils.isNodeModules(module, count)
      }
    })
  );
} else {
  webpackConfig.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: entryPoints,
      minChunks: function (module, count) {
        return utils.isNodeModules(module, count)
      }
    })
  );
}

module.exports = webpackConfig;
