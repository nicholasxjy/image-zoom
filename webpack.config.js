const HtmlWebpackPlugin = require('html-webpack-plugin')
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: './src/zoom.js',
  output: {
    library: 'NZoom',
    libraryTarget: 'umd',
    libraryExport: 'default',
    filename: isProd ? 'NZoom.min.js' : 'NZoom.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg)(\?.+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 10000 }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  devServer: {
    host: '0.0.0.0',
    port: 9000,
    hot: true,
    historyApiFallback: true
  }
}
