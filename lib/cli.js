var path = require('path');
var fs = require('fs');

/**
 * Filters arguments given and sets them to parameters
 *
 * @method filterArguments
 * @param {string[]} args
 * @param {object} params
 * @param {string[]} [inject]
 * @return {string[]}
 * @private
 */
function filterArguments(args, params, inject) {

	var newArgs = ['node', '_mocha'].concat(inject || []),
		param, i, len,
		type;

	for (i = 2, len = args.length; i < len; i++) {

		if ((i < args.length - 1) && (args[i].length > 2) && (args[i].substr(0, 2) === '--')) {

			// Get parameter without '--'
			param = args[i].substr(2);

			// Is parameter used?
			if (params.hasOwnProperty(param)) {

				// Remember what the type was
				type = typeof params[param];

				// Overwrite value with next value in arguments
				if (type === 'boolean') {
					params[param] = true;

				} else {
					params[param] = args[i + 1];
					i++;

					// Convert back to boolean if needed
					if (type === 'number') {
						params[param] = parseFloat(params[param]);
					}
				}

			} else {
				newArgs.push(args[i]);
			}
		} else {
			newArgs.push(args[i]);
		}
	}

	// Set test-path with last argument if none given
	if (!params['test-path']) {
		params['test-path'] = args.pop();
	}

	newArgs.push(__dirname + '/../resource/run.js');

	return newArgs;
}

/**
 * Prepares the environment for kobold
 *
 * @method prepareEnvironment
 * @param {string[]} argv
 * @return {string[]}
 * @private
 */
function prepareEnvironment (argv) {

	var params, args;

	// Define default values
	params = {
		'approved-folder': 'approved',
		'build-folder': 'build',
		'highlight-folder': 'highlight',
		'fail-orphans': false,
		'fail-additions': false,
		'test-path': null
	};

	// Filter arguments
	args = filterArguments(argv, params, [
		'--slow', '5000',
		'--no-timeouts'
	]);

	if (!fs.existsSync(params['test-path'])) {
		throw new Error('Cannot find path to ' + params['test-path']);
	} else {
		params['test-path'] = path.resolve(params['test-path']);
	}

	// Set global variable for test-runner
	global.koboldOptions = {
		"verbose": false,

		"failForOrphans": params['fail-orphans'],
		"failOnAdditions": params['fail-additions'],

		"build": params['build'],

		"blinkDiff": {},

		"storage": {
			"type": 'File',

			"options": {
				"path": params['test-path'],
				"approvedFolderName": params['approved-folder'],
				"buildFolderName": params['build-folder'],
				"highlightFolderName": params['highlight-folder']
			}
		}
	};

	return args;
}

module.exports = {
	filterArguments: filterArguments,
	prepareEnvironment: prepareEnvironment
};
