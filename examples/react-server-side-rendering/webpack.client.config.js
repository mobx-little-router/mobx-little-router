const webpack = require('webpack')

module.exports = {
  context: __dirname + '/src',
  entry: [
    './client'
  ],
  output: {
    publicPath: '/',
    path: __dirname + '/dist',
    filename: 'client.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
}
