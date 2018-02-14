//webpack.config.js
var webpack = require("webpack");

module.exports = {
  context: __dirname + '/src',
  entry: {
    'main': './cdms/js/async.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|libs)/,
        loader: 'babel', // 'babel-loader' is also a valid name to reference
        query: {
          presets: ['es2015']
        }
      },
      {
        test:/\.pug$/,
        exclude: ['/node_modules/'],
        loader: 'pug-html-loader',
        query: {
          data: {name:'test'},
          pretty: true
        }
      },
    ]
  },
  output: {
    filename: '../cdms/js/[name].bundle.js'
  },
  devtool: '#inline-source-map'
};
