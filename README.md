Kobold
======

Visual regression testing framework, comparing screenshots from multiple builds.


[![Build Status](https://secure.travis-ci.org/yahoo/kobold.png)](http://travis-ci.org/yahoo/kobold)
[![npm version](https://badge.fury.io/js/kobold.svg)](http://badge.fury.io/js/kobold)

[![NPM](https://nodei.co/npm/kobold.png?downloads=true)](https://nodei.co/npm/kobold/)


[API-Documentation](http://yahoo.github.io/kobold/docs/)

[Coverage Report](http://yahoo.github.io/kobold/coverage/lcov-report/)


**Table of Contents**
* [Installation](#installation)
* [Usage](#usage)
* [API-Documentation](#api-documentation)
* [Tests](#tests)
* [Project Naming](#project-name)
* [Third-party libraries](#third-party-libraries)
* [License](#license)


##Installation

Install this module with the following command:
```shell
npm install kobold
```

Add the module to your ```package.json``` dependencies:
```shell
npm install --save kobold
```
Add the module to your ```package.json``` dev-dependencies:
```shell
npm install --save-dev kobold
```

##Usage

Kobold can be run by executing the bin-script that is located in the ```bin``` directory. The only required parameter
is the path to the folder holding all screens (images/screenshots) that should be tested.

```shell
./node_modules/.bin/kobold ./test/ui/regression
```

Instead of implicitly using the last argument as the ```test-path```, you can also be more specific and use the ```--test-path``` parameter:
```shell
./node_modules/.bin/kobold --test-path ./test/ui/regression
```

By default, Kobold will look for three directories:

* ```approved``` - Folder with all previously approved screens. These are the "golden standard" images that will be used to compare them to.
* ```build``` - Folder with most recent screens taken from an application. This is most likely done by some Selenium tests. These images will be compared to the images in the ```approved``` folder.
* ```highlight``` - Folder holding the results of the latest test-run. Here, the images will highlight the differences between the ```approved```-image and the ```build```-image.

The folder names for ```approved```, ```build```, and ```highlight``` can be changed by supplying the parameters ```--approved-folder```, ```--build-folder```, and ```--highlight-folder``` respectively:
 
```shell
./node_modules/.bin/kobold --approved-folder "golden" --highlight-folder "differences" ./test/ui/regression
```
This test-run will look for ```golden``` and ```differences``` for the ```approved``` and ```highlight``` folder respectively instead of the default folder names. In this cases ```build``` was not changed.

In some cases, the tests should fail when previously approved screens are not anymore available in the recent build. Use the ```--fail-orphans``` flag to make these tests fail:
```shell
./node_modules/.bin/kobold --fail-orphans ./test/ui/regression
```

The ```--fail-additions``` flag will fail tests for screens that are new.
```shell
./node_modules/.bin/kobold --fail-orphans --fail-additions ./test/ui/regression
```

Kobold is built on top of Mocha and therefore can also accept all of its parameters.
```shell
./node_modules/.bin/kobold --slow 3000 --fail-orphans --fail-additions --reporter dot --test-path ./test/ui/regression
```

##API-Documentation

Generate the documentation with following command:
```shell
npm run docs
```
The documentation will be generated in the ```docs``` folder of the module root.

##Tests

Run the tests with the following command:
```shell
npm run test
```
The code-coverage will be written to the ```coverage``` folder in the module root.

##Project Name
A Kobold is a gnome that can make itself invisible and is often the source of nuisances, pretty much like visual regressions.

##Third-party libraries

The following third-party libraries are used by this module:

###Dependencies
* blink-diff: https://github.com/yahoo/blink-diff
* preceptor-core: https://github.com/yahoo/preceptor-core
* kobold-core: https://github.com/yahoo/kobold-core
* log4js: https://github.com/nomiddlename/log4js-node
* promise: https://github.com/then/promise
* mocha: https://github.com/visionmedia/mocha

###Dev-Dependencies
* chai: http://chaijs.com
* istanbul: https://github.com/gotwarlost/istanbul
* yuidocjs: https://github.com/yui/yuidoc

##License

The MIT License

Copyright 2014 Yahoo Inc.
