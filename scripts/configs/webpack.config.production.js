import webpack from 'webpack'
import CONFIG from '../../package.json'
const VARS = CONFIG.vars

const plugins = [
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    },
    minimize: true,
    beautify: false,
    comments: false
  }),
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false
  })
]

module.exports = {
  devtool: 'cheap-module-source-map',
  output: {
    filename: VARS.bundleJS
  },

  plugins: plugins,

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: ['node_modules', 'app'],
    extensions: ['.js', '.json']
  }
}
