"use strict";

const EVENT = process.env.npm_lifecycle_event || '';

var path = require('path');
var ROOT = path.resolve(__dirname, '..');
var root = path.join.bind(path, ROOT);



function hasProcessFlag(flag) {
	return process.argv.join('').indexOf(flag) > -1;
}



function hasNpmFlag(flag) {
	return EVENT.includes(flag);
}



function isWebpackDevServer() {
	return process.argv[1] && !!(/webpack-dev-server/.exec(process.argv[1]));
}



exports.hasProcessFlag = hasProcessFlag;
exports.hasNpmFlag = hasNpmFlag;
exports.isWebpackDevServer = isWebpackDevServer;
exports.root = root;
