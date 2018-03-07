// Copyright 2014, Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var utils = require('preceptor-core').utils;
var Base = require('preceptor-core').Base;
var koboldCore = require('kobold-core');

var BlinkDiff = require('blink-diff');

var Promise = require('promise');
var log4js = require('log4js');

var defaultOptions = require('./defaultOptions');

/**
 * @class Kobold
 *
 * @property {Logger} _logger
 * @property {boolean} _verbose
 * @property {boolean} _highlightOnSuccess
 * @property {string} _build
 * @property {boolean} _failForOrphans
 * @property {boolean} _failOnAdditions
 * @property {object} _comparison
 * @property {StorageAdapter} _source
 * @property {StorageAdapter} _destination
 */
var Kobold = Base.extend(

	/**
	 * Initializes the kobold test-runner
	 *
	 * @constructor
	 * @param {object} [options]
	 * @param {boolean} [options.verbose=false]
	 * @param {boolean} [options.highlightOnSuccess=false] Create highlighting for successful tests?
	 * @param {string} [options.build] Build identifier
	 * @param {boolean} [options.failForOrphans=false] Fail test when screen is missing
	 * @param {boolean} [options.failOnAdditions=false] Fail test when new screen was added
	 * @param {object} [options.comparison] Image-diff options
	 * @param {object} [options.source=options.storage] Source storage adapter configuration
	 * @param {object} [options.destination=options.storage] Destination storage adapter configuration
	 * @param {object} [options.storage] General storage adapter configuration
	 */
	function (options) {
		this.__super();

		this._logger = log4js.getLogger();

		options = utils.deepExtend({}, [defaultOptions, options || {}]);

		this._verbose = options.verbose || false;
		if (!this._verbose) {
			this._logger.level = 'info';
		}

		this._highlightOnSuccess = options.highlightOnSuccess || false;

		this._build = options.build;

		this._failForOrphans = options.failForOrphans || false;
		this._failOnAdditions = options.failOnAdditions || false;

		this._comparison = utils.deepExtend({}, [options.comparison || {}, options.blinkDiff || {}]);

		this._source = koboldCore.buildStorageAdapter(this._build, options.source || options.storage);
		this._destination = koboldCore.buildStorageAdapter(this._build, options.destination || options.storage);
	},

	{
		/**
		 * Gets the source
		 *
		 * @method getSource
		 * @return {StorageAdapter}
		 */
		getSource: function () {
			return this._source;
		},

		/**
		 * Gets the destination
		 *
		 * @method getDestination
		 * @return {StorageAdapter}
		 */
		getDestination: function () {
			return this._destination;
		},


		/**
		 * Determines the state of screens
		 *
		 * @method _determineScreensState
		 * @param {string[]} screens
		 * @return {{orphans:  <string[]>, additions:  <string[]>, comparisons:  <string[]> }}
		 * @private
		 */
		_determineScreensState: function (screens) {

			var buildScreens = screens[0],
				approvedScreens = screens[1],

				buildIndex,
				buildLength,
				approvedIndex,
				approvedLength,

				found, result;

			this._logger.debug("Found screens", screens);

			result = {
				orphans: [],
				additions: [],
				comparisons: []
			};

			// Find orphans and comparisons
			this._logger.debug("Find orphans and compare");
			for (approvedIndex = 0, approvedLength = approvedScreens.length; approvedIndex < approvedLength; approvedIndex++) {
				found = false;

				for (buildIndex = 0, buildLength = buildScreens.length; buildIndex < buildLength; buildIndex++) {
					if (approvedScreens[approvedIndex] === buildScreens[buildIndex]) {
						found = true;
						break;
					}
				}

				if (found) {
					result.comparisons.push(approvedScreens[approvedIndex]);
				} else {
					result.orphans.push(approvedScreens[approvedIndex]);
				}
			}

			// Find additions
			this._logger.debug("Find additions");
			for (buildIndex = 0, buildLength = buildScreens.length; buildIndex < buildLength; buildIndex++) {
				found = false;

				for (approvedIndex = 0, approvedLength = approvedScreens.length; approvedIndex < approvedLength; approvedIndex++) {
					if (approvedScreens[approvedIndex] === buildScreens[buildIndex]) {
						found = true;
						break;
					}
				}

				if (!found) {
					result.additions.push(buildScreens[buildIndex]);
				}
			}

			this._logger.debug("Found tests", result);
			return result;
		},

		/**
		 * Determines all the tests
		 *
		 * @method _determineTests
		 * @return {Promise} With { orphans: <string[]>, additions: <string[]>, comparisons: <string[]> }
		 * @private
		 */
		_determineTests: function () {

			this._logger.debug("Determine tests");

			return Promise.all([
				this.getSource().getBuildScreenNames(),
				this.getDestination().getCurrentApprovedScreenNames()
			]).then(function (screens) {
				return this._determineScreensState(screens);
			}.bind(this), function (err) {
				this._logger.error("Error determining tests", err.stack);
			}.bind(this));
		},

		/**
		 * Converts the filename to a user-friendly test-name
		 *
		 * @method _getTestName
		 * @param {string} filename
		 * @return {string}
		 * @private
		 */
		_getTestName: function (filename) {
			return filename.replace(/-/g, ' ').replace(/_/g, ' - ').replace(/\s/g, ' ');
		},


		/**
		 * Runs all orphan tests
		 *
		 * @method _runOrphanTests
		 * @param {string[]} orphans
		 * @private
		 */
		_runOrphanTests: function (orphans) {
			var i, len;

			this._logger.debug("Run orphans tests", orphans);
			for (i = 0, len = orphans.length; i < len; i++) {
				this._runOrphanTest(orphans[i]);
			}
		},

		/**
		 * Runs an orphan test
		 *
		 * @method _runOrphanTest
		 * @param {string} orphanName
		 * @private
		 */
		_runOrphanTest: function (orphanName) {

			this._logger.debug("Run orphans test", orphanName);
			this._describe(this._getTestName(orphanName), function () {

				if (this._failForOrphans) {
					this._it('is orphaned', function () {
						throw new Error("Approved screen is orphaned: " + orphanName);
					});
				} else {
					this._it('is orphaned');
				}

			}.bind(this));
		},


		/**
		 * Runs all additions tests
		 *
		 * @method _runAdditionsTests
		 * @param {string[]} additions
		 * @private
		 */
		_runAdditionsTests: function (additions) {
			var i, len;

			this._logger.debug("Run additions tests", additions);
			for (i = 0, len = additions.length; i < len; i++) {
				this._runAdditionsTest(additions[i]);
			}
		},

		/**
		 * Runs an addition test
		 *
		 * @method _runAdditionsTest
		 * @param {string} additionName
		 * @private
		 */
		_runAdditionsTest: function (additionName) {

			this._logger.debug("Run addition test", additionName);
			this._describe(this._getTestName(additionName), function () {

				if (this._failOnAdditions) {
					this._it('is an addition', function () {
						throw new Error("Screen is new: " + additionName);
					});
				} else {
					// Define as pending
					this._it('is an addition');
				}

			}.bind(this));
		},


		/**
		 * Runs all comparison tests
		 *
		 * @method _runComparisonTests
		 * @param {string[]} comparisons
		 * @private
		 */
		_runComparisonTests: function (comparisons) {

			var i, len;

			this._logger.debug("Run comparison tests", comparisons);
			for (i = 0, len = comparisons.length; i < len; i++) {
				this._runComparisonTest(comparisons[i]);
			}
		},

		/**
		 * Runs a comparison test
		 *
		 * @method _runComparisonTest
		 * @param {string} comparisonName
		 * @private
		 */
		_runComparisonTest: function (comparisonName) {

			this._logger.debug("Run comparison tests", comparisonName);
			this._describe(this._getTestName(comparisonName), function () {

				this._it('should load the approved screen', function (done) {
					this.getSource().getCurrentApprovedScreen(comparisonName).then(function (screen) {
						this.approvedScreen = screen;
						done();
					}.bind(this), function (err) {
						done(err);
					});
				}.bind(this));

				this._it('should load the build screen', function (done) {
					this.getDestination().getBuildScreen(comparisonName).then(function (screen) {
						this.buildScreen = screen;
						done();
					}.bind(this), function (err) {
						done(err);
					});
				}.bind(this));

				this._it('should load the configuration of screen', function (done) {
					this.getSource().getScreenConfig(comparisonName).then(function (config) {
						this.screenConfig = config || {};
						done();
					}.bind(this), function (err) {
						this.screenConfig = {};
						done();
					}.bind(this));
				}.bind(this));

				this._it('should be similar', function (done) {

					var options = this._comparison,
						blinkDiff;

					options = utils.deepExtend({}, [options, this.screenConfig || {}]);

                    if (!this.approvedScreen) {
                        throw new Error('Approved screen is not loaded.');
                    }
                    if (!this.buildScreen) {
                        throw new Error('Build screen is not loaded.');
                    }

					options.imageA = this.approvedScreen;
					options.imageB = this.buildScreen;

					blinkDiff = new BlinkDiff(options);
					blinkDiff.run(function (err, result) {
						if (err) {
							done(err);
						} else {

							try {
								this._processTestResults(comparisonName, blinkDiff, result.code).then(function () {
									done();
								}, function (err) {
									done(err);
								});
							} catch (err) {
								done(err);
							}
						}
					}.bind(this));
				}.bind(this));
			}.bind(this));
		},


		/**
		 * Run tests
		 *
		 * @method run
		 * @return {Promise}
		 */
		run: function () {

			var result = Promise.resolve();

			this._it('initialize tests', function () {

				this._logger.debug("Run tests");
				result = this._determineTests().then(function (tests) {

					this._describe('Kobold', function () {

						this._runOrphanTests(tests.orphans);
						this._runAdditionsTests(tests.additions);
						this._runComparisonTests(tests.comparisons);

					}.bind(this));
				}.bind(this));
			}.bind(this));

			return result;
		},


		/**
		 * Archiving test-results
		 *
		 * @method _archiveTest
		 * @param {boolean} passed
		 * @param {string} testName
		 * @param {PNGImage} approvedImage
		 * @param {PNGImage} buildImage
		 * @param {PNGImage} highlightImage
		 * @private
		 */
		_archiveTest: function (passed, testName, approvedImage, buildImage, highlightImage) {

			var archiveList = [];

			this._logger.debug("Archive test", testName);
			if (approvedImage) {
				archiveList.push(this.getDestination().archiveApprovedScreen(testName, approvedImage));
			}
			if (buildImage) {
				archiveList.push(this.getDestination().archiveBuildScreen(testName, buildImage));
			}
			if (highlightImage && (!passed || (passed && this._highlightOnSuccess))) {
				archiveList.push(this.getDestination().archiveHighlightScreen(testName, highlightImage));
			}

			return Promise.all(archiveList);
		},

		/**
		 * Processes the comparison test results
		 *
		 * @method _processTestResults
		 * @param {string} comparisonName
		 * @param {BlinkDiff} blinkDiff
		 * @param {int} resultCode
		 * @private
		 */
		_processTestResults: function (comparisonName, blinkDiff, resultCode) {

			var approvedScreen = blinkDiff._imageA,
				buildScreen = blinkDiff._imageB,
				highlightScreen = blinkDiff._imageOutput,
				promise,
				passed;

			this._logger.debug("Process result", comparisonName, resultCode);

			passed = blinkDiff.hasPassed(resultCode);
			promise = this._archiveTest(passed, comparisonName, approvedScreen, buildScreen, highlightScreen);

			if (!passed) {
				promise = promise.then(function () {
					throw new Error("Screens are different for " + comparisonName);
				});
			}

			return promise;
		},


		/**
		 * Add 'describe' section to test-suite
		 *
		 * @method _describe
		 * @param {string} title
		 * @param {function} [fn]
		 * @return {object}
		 * @private
		 */
		_describe: function (title, fn) {
			return describe(title, fn);
		},

		/**
		 * Add 'it' section to the test-suite
		 *
		 * @method _it
		 * @param {string} title
		 * @param {function} [fn]
		 * @return {object}
		 * @private
		 */
		_it: function (title, fn) {
			return it(title, fn);
		},

		/**
		 * Add 'before' section to the test-suite
		 *
		 * @method _before
		 * @param {function} [fn]
		 * @return {object}
		 * @private
		 */
		_before: function (fn) {
			return before(fn);
		},

		/**
		 * Add 'beforeEach' section to the test-suite
		 *
		 * @method _beforeEach
		 * @param {function} [fn]
		 * @return {object}
		 * @private
		 */
		_beforeEach: function (fn) {
			return beforeEach(fn);
		},

		/**
		 * Add 'after' section to the test-suite
		 *
		 * @method _after
		 * @param {function} [fn]
		 * @return {object}
		 * @private
		 */
		_after: function (fn) {
			return after(fn);
		},

		/**
		 * Add 'afterEach' section to the test-suite
		 *
		 * @method _afterEach
		 * @param {function} [fn]
		 * @return {object}
		 * @private
		 */
		_afterEach: function (fn) {
			return afterEach(fn);
		}
	}
);

module.exports = Kobold;
