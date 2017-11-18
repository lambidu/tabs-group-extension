"use strict";

const helpers = require('./helpers');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');



// Webpack Plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HashedModuleIdsPlugin = require('webpack/lib/HashedModuleIdsPlugin')
const OptimizeJsPlugin = require('optimize-js-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');



// Webpack Constants
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const METADATA = webpackMerge(commonConfig({ env: ENV }).metadata, {
	host: HOST,
	port: PORT,
	ENV: ENV,
	HMR: false
});



// Webpack configuration
module.exports = function (options) {
	return webpackMerge(commonConfig({ env: ENV }), {
		// Developer tool to enhance debugging.
		devtool: 'source-map',



		// Options affecting the output of the compilation.
		output: {
			// Absolute path to the output directory.
			path: helpers.root('dist'),

			// Specifies the name of each output file on disk.
			filename: '[name].[chunkhash].bundle.js',

			// The filename of the SourceMaps for the JavaScript files.
			sourceMapFilename: '[file].map',

			// The filename of non-entry chunks as relative path inside the output.path directory.
			chunkFilename: '[name].[chunkhash].chunk.js',
		},



		// Options affecting the normal modules.
		module: {
			rules: [
			]
		},



		// Add additional plugins to the compiler.
		plugins: [
			// Extracts imported CSS files into external stylesheet.
			new ExtractTextPlugin('[name].[contenthash].css'),

			new HashedModuleIdsPlugin(),

			// Webpack plugin to optimize a JavaScript file for faster initial load by wrapping eagerly-invoked functions.
			new OptimizeJsPlugin({
				sourceMap: false
			}),

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

			// Minimize all JavaScript output of chunks.
			new UglifyJsPlugin({
				beautify: false,

				output: {
					comments: false
				},

				mangle: {
					screw_ie8: true
				},

				compress: {
					screw_ie8: true,
					warnings: false,
					conditionals: true,
					unused: true,
					comparisons: true,
					sequences: true,
					dead_code: true,
					evaluate: true,
					if_return: true,
					join_vars: true,
					negate_iife: false
				},
			}),

			//// Replace resources that matches resourceRegExp with newResource
			//new NormalModuleReplacementPlugin(
			//	/zone\.js(\\|\/)dist(\\|\/)long-stack-trace-zone/,
			//	helpers.root('config/empty.js')
			//),

			// LoaderOptionsPlugin (experimental)
			new LoaderOptionsPlugin({
				minimize: true,
				debug: false,
				options: {
					htmlLoader: {
						minimize: true,
						removeAttributeQuotes: false,
						caseSensitive: true,
						customAttrSurround: [
							[/#/, /(?:)/],
							[/\*/, /(?:)/],
							[/\[?\(?/, /(?:)/]
						],
						customAttrAssign: [/\)?\]?=/]
					},
				}
			}),
		],



		// Include polyfills or mocks for various node stuff
		node: {
			global: true,
			crypto: 'empty',
			process: false,
			module: false,
			clearImmediate: false,
			setImmediate: false
		}
	});
}
