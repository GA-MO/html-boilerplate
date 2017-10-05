import CONFIG from '../../package.json'
const VARS = CONFIG.vars

module.exports = {
  output: {
    filename: VARS.bundleJS
  },
  cache: true,
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
