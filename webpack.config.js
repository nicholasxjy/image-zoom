const webpack = require('webpack')
const { resolve } = require('path')

module.exports = {
  entry: './src/zoom.js',
  output: {
    libraryTarget: 'umd',
    library: 'ImageZoom',
    filename: 'zoom.min.js',
    path: resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      }
    ]
  }
}
