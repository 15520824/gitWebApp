const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rootDir = path.join(__dirname, '.');
const webpackEnv = process.env.NODE_ENV || 'development';

module.exports = {
  mode: webpackEnv,
  entry: {
    app: path.join(rootDir, '/index.web.js'),
  },
  output: {
    path: path.resolve(rootDir, '../dist'),
    filename: 'app.bundle.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: { presets: [['@babel/preset-env', { modules: false }]] }
        },
        {
            test: /\.(tpl|txt|xml|rels|svg|json)$/i,
            use: 'raw-loader',
        },
        {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
        }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './index.html'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  optimization:{
    minimize: false  
  },
  resolve: {
      modules:[
          'D:\\gitWebApp\\gold_carddone\\gitWebApp\\node_modules'
          // path.join(__dirname, '../node_modules')
      ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.tsx',
      '.ts',
      '.web.jsx',
      '.web.js',
      '.jsx',
      '.js',
    ], // read files in fillowing order
    alias: Object.assign({
      'react-native$': 'react-native-web',
    }),
  },
};
