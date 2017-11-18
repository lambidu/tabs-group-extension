'use strict';

const webpack = require('webpack');
const helpers = require('./helpers');

// Webpack Plugins
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');



// Webpack Constants
const HMR = helpers.hasProcessFlag('hot');
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const METADATA = {
	title: 'Angular2 Webpack Starter by @gdi2290 from @AngularClass',
	baseUrl: '/',
	isDevServer: helpers.isWebpackDevServer(),
	HMR: HMR
};



// Webpack configuration
module.exports = function (options) {
	var isProd = options.env === 'production';



	return {
		//// The base directory
		//context: helpers.root('src'),

		// The entry point for the bundle
		entry: {
			'polyfills': './src/polyfills.ts',
			'vendor': './src/vendor.ts',
			'main': './src/main.ts'
		},

		// Options affecting the resolving of modules.
		resolve: {
			// An array of extensions that should be used to resolve modules.
			extensions: ['.ts', '.js', '.json'],

			// An array of directory names to be resolved to the current directory
			modules: [
				helpers.root('src'),
				helpers.root('node_modules')
			]
		},



		// Options affecting the normal modules.
		module: {
			rules: [{
				test: /\.ts$/,
				use: [{
					loader: 'awesome-typescript-loader',
					options: {
						configFileName: 'tsconfig.json',
						useCache: !isProd
					}
				}, {
					loader: 'angular2-template-loader',
					options: {
					}
				}]
			}, {
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'sass-loader']
				})
			}, {
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			}, {
				test: /\.html$/,
				use: ['raw-loader'],
				exclude: [helpers.root('src/index.html')]
			}, {
				test: /\.json$/,
				use: ['json-loader']
			}, {
				test: /\.(jpe?g|png|gif|bmp|svg)$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[name].[hash].[ext]',
						publicPath: '/',
						outputPath: helpers.root('dist/assets/images/'),
					}
				}],
			}, {
				test: /\.(eot|woff2?|ttf)([\?]?.*)$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[name].[hash].[ext]',
						publicPath: '/',
						outputPath: helpers.root('dist/assets/fonts/'),
					}
				}],
			}]

		},



		// Add additional plugins to the compiler.
		plugins: [
			// Enable scope hoisting
			new webpack.optimize.ModuleConcatenationPlugin(),

			// Workaround for angular/angular#11580
			new webpack.ContextReplacementPlugin(
				/angular(\\|\/)core(\\|\/)@angular/,
				helpers.root('./src'),
				{}
			),

			// Do type checking in a separate process, so webpack don't need to wait.
			new CheckerPlugin(),

			// Shares common code between the pages
			new CommonsChunkPlugin({
				name: 'polyfills',
				chunks: ['polyfills']
			}),

			// Save styles to file
			new ExtractTextPlugin({
				filename: 'bundle.css'
			}),

			// Copy files and directories in webpack.
			new CopyWebpackPlugin([
				{ from: 'src/assets', to: 'assets' },
				{ from: 'src/manifest.json' }
			]),

			// Enhances html-webpack-plugin functionality
			new ScriptExtHtmlWebpackPlugin({
				sync: /polyfill|vendor/,
				defaultAttribute: 'async',
				preload: [/polyfill|vendor|main/],
				prefetch: [/chunk/]
			}),

			// Simplifies creation of HTML files to serve your webpack bundles.
			new HtmlWebpackPlugin({
				template: 'src/index.html',
				title: METADATA.title,
				chunksSortMode: 'dependency',
				metadata: METADATA,
				inject: 'body'
			}),

			// Plugin LoaderOptionsPlugin (experimental)
			new LoaderOptionsPlugin({}),

			// Webpack's manifest.js in index.html
			new InlineManifestWebpackPlugin()
		],



		// Import external dependencies
		externals: {
			browser: 'webextension-polyfill'
		},



		// Include polyfills or mocks for various node stuff
		node: {
			global: true,
			crypto: 'empty',
			process: true,
			module: false,
			clearImmediate: false,
			setImmediate: false
		}
	};
};
