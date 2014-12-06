// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var config = {
	verbose: false,

	failForOrphans: false,
	failOnAdditions: false,

	build: process.env.BUILD_NUMBER || (process.env.USER + '_' + (+(new Date()))),

	comparison: {
		"hideShift": true
	}
};

module.exports = config;
