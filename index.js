// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var Kobold = require('./lib/kobold');

/**
 * @class Runner
 */

/**
 * Configures Kobold and runs the tests
 *
 * @method koboldRunner
 * @param {object} config
 * @return {Promise}
 */
var koboldRunner = function (config) {
	return (new Kobold(config)).run();
};

/**
 * Kobold class
 *
 * @static
 * @property Kobold
 * @type {Kobold}
 */
koboldRunner.Kobold = Kobold;

/**
 * Version of module
 *
 * @static
 * @property version
 * @type {string|version|exports.version}
 */
koboldRunner.version = require('./package.json').version;

module.exports = koboldRunner;
