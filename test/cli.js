var expect = require('chai').expect;
var cli = require('../lib/cli');

describe('CLI', function () {

	describe('filterArguments', function () {

		it('should create default arguments', function () {
			var args = cli.filterArguments(['node', 'kobold'], {});

			expect(args).to.be.length(3);
			expect(args[0]).to.be.equal('node');
			expect(args[1]).to.be.equal('_mocha');
		});

		it('should inject arguments', function () {
			var args = cli.filterArguments(['node', 'kobold'], {}, ['test1', 'test2']);

			expect(args).to.be.length(5);
			expect(args[0]).to.be.equal('node');
			expect(args[1]).to.be.equal('_mocha');
			expect(args[2]).to.be.equal('test1');
			expect(args[3]).to.be.equal('test2');
		});

		it('should filter application parameters', function () {
			var params = {
					"unused": '3',
					"test-param": '50'
				},
				args = cli.filterArguments(['node', 'kobold', 'test1', '--test-param', '55', '--test2', 'test3'], params);

			expect(args).to.be.length(6);
			expect(args[0]).to.be.equal('node');
			expect(args[1]).to.be.equal('_mocha');
			expect(args[2]).to.be.equal('test1');
			expect(args[3]).to.be.equal('--test2');
			expect(args[4]).to.be.equal('test3');

			expect(params['unused']).to.be.equal('3');
			expect(params['test-param']).to.be.equal('55');
		});

		it('should convert to boolean', function () {
			var params = {
					'test': false
				};

			cli.filterArguments(['node', 'kobold', '--test', 'dfs'], params);

			expect(params['test']).to.be.true;
		});

		it('should convert to number', function () {
			var params = {
					'test': 20
				};

			cli.filterArguments(['node', 'kobold', '--test', '3'], params);

			expect(params['test']).to.be.equal(3);
		});

		it('should use last param for test-path', function () {
			var params = {
				'test': 'none-given'
			};

			cli.filterArguments(['node', 'kobold', '--test', '3', 'path-to-somewhere'], params);

			expect(params['test-path']).to.be.equal('path-to-somewhere');
		});

		it('should use supplied test-path', function () {
			var params = {
				'test-path': 'path-to-somewhere'
			};

			cli.filterArguments(['node', 'kobold', '--test', '3', 'not-this-one'], params);

			expect(params['test-path']).to.be.equal('path-to-somewhere');
		});
	});

	describe('prepareEnvironment', function () {

		it('should prepare with path-call', function () {
			cli.prepareEnvironment(['node', 'kobold', __dirname + '/../examples']);

			expect(global.koboldOptions).to.exist;
		});

		//TODO: Add some more tests here; specifically, check if parameters were set
	});
});
