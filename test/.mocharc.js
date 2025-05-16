'use strict'

module.exports = {
	require: "node_modules/require/bin/require-command.js",
    ignore: ["server/**/*.js", "client/**/*.js", "data", "node_modules", "TestResults"],
	"watch-files": ["client/**/*.js", "server/**/*.js", "test/**/*.js"],
	"watch-ignore": ["client/thirdparty", "node_modules"],
	exit: true, 
	bail: false,
	slow: 5000,
	recursive: true,
	file: []
	spec: "test/mocha/**/*.test.js"
}