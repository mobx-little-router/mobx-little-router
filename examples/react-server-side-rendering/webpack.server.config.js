const webpack = require('webpack')

module.exports = {
  target: 'node',
  context: __dirname + '/src',
  entry: [
    './server'
  ],
  output: {
    libraryTarget: 'commonjs2',
    path: __dirname + '/dist',
    filename: 'server.js'
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
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
}
