"use strict";

const helpers = require('./helpers');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');



// Webpack Plugins
const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');



// Webpack Constants
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const HMR = helpers.hasProcessFlag('hot');
const METADATA = webpackMerge(commonConfig({ env: ENV }).metadata, {
	host: HOST,
	port: PORT,
	ENV: ENV,
	HMR: HMR
});



// Webpack configuration
module.exports = function (options) {
	return webpackMerge(commonConfig({ env: ENV }), {
		// Developer tool to enhance debugging.
		devtool: 'cheap-module-source-map',



		// Webpack Development Server configuration
		devServer: {
			port: METADATA.port,
			host: METADATA.host,
			historyApiFallback: true,

			clientLogLevel: 'error',

			watchOptions: {
				ignored: /node_modules/
			},

			setup: function (app) {
			}
		},



		// Options affecting the output of the compilation.
		output: {
			// Absolute path to the output directory.
			//path: helpers.root('dist'),
			path: helpers.root('dist'),

			// URL to the output directory resolved relative to the HTML page
			publicPath: '/',

			// Specifies the name of each output file on disk.
			filename: '[name].js',

			// The filename of the SourceMaps for the JavaScript files.
			sourceMapFilename: '[file].map',

			// The filename of non-entry chunks as relative path inside the output.path directory.
			chunkFilename: '[id].chunk.js',

			library: 'ac_[name]',
			libraryTarget: 'var',
		},



		// Options affecting the normal modules.
		module: {
			rules: [
			]
		},



		// Add additional plugins to the compiler.
		plugins: [
			// Define custom variables.
			new DefinePlugin({
				'ENV': JSON.stringify(METADATA.ENV),
				'HMR': METADATA.HMR,
				'process.env': {
					'ENV': JSON.stringify(METADATA.ENV),
					'NODE_ENV': JSON.stringify(METADATA.ENV),
					'HMR': METADATA.HMR,
				}
			}),

			// LoaderOptionsPlugin (experimental)
			new LoaderOptionsPlugin({
				debug: true,
				options: {

				}
			}),
		],



		// Include polyfills or mocks for various node stuff
		node: {
			global: true,
			crypto: 'empty',
			process: true,
			module: false,
			clearImmediate: false,
			setImmediate: false
		}
	});
}
