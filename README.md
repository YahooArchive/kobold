Kobold
======

Visual regression testing framework, comparing screenshots from multiple builds.

[![Build Status](https://img.shields.io/travis/yahoo/kobold.svg)](http://travis-ci.org/yahoo/kobold)
[![Coveralls Coverage](https://img.shields.io/coveralls/yahoo/kobold.svg)](https://coveralls.io/r/yahoo/kobold)
[![Code Climate Grade](https://img.shields.io/codeclimate/github/yahoo/kobold.svg)](https://codeclimate.com/github/yahoo/kobold)

[![NPM version](https://badge.fury.io/js/kobold.svg)](https://www.npmjs.com/package/kobold)
[![NPM License](https://img.shields.io/npm/l/kobold.svg)](https://www.npmjs.com/package/kobold)

[![NPM](https://nodei.co/npm/kobold.png?downloads=true&stars=true)](https://www.npmjs.com/package/kobold)
[![NPM](https://nodei.co/npm-dl/kobold.png?months=3&height=2)](https://www.npmjs.com/package/kobold)

[![Coverage Report](https://img.shields.io/badge/Coverage_Report-Available-blue.svg)](http://yahoo.github.io/kobold/coverage/lcov-report/)
[![API Documentation](https://img.shields.io/badge/API_Documentation-Available-blue.svg)](http://yahoo.github.io/kobold/docs/)

[![Gitter Support](https://img.shields.io/badge/Support-Gitter_IM-yellow.svg)](https://gitter.im/preceptorjs/support)

**Table of Contents**
* [Installation](#installation)
* [Getting Started](#getting-started)
* [Command-Line](#command-line)
* [Examples](#examples)
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

Install this module globally with the following command:
```shell
npm install -g kobold
```
This will make sure that you don't have to enter the whole path when running Kobold.


Add the module to your ```package.json``` dependencies:
```shell
npm install --save kobold
```
Add the module to your ```package.json``` dev-dependencies:
```shell
npm install --save-dev kobold
```

##Getting Started

Kobold can be executed by running ```kobold``` script in the ```bin``` directory of the package. When you installed the module globally, then you can us only ```kobold``` to run it.

Only one parameter is required to run the tests:

```shell
kobold test/ui/regression
```

With this parameter, Kobold starts running tests on the ```test/ui/regression``` directory. It analyzes what screens were already approved, what screens are available in the current build, and what screens it has to compare. Then, it creates the test-code and executes the image-comparison, creating the test results in the ```highlight``` directory.

Instead of implicitly using the last argument for the test-path, you can also be more specific and supply the ```--test-path``` parameter:
```shell
kobold --test-path test/ui/regression
```

By default, Kobold will look for four directories:

* ```approved``` - All approved screens should be available in this folder. These are the "golden standard" images that will be used to compare them to build screens.
* ```build``` - Screens that were just taken are saved in this folder. This is most likely done by some Selenium tests, taking screenshots and saving them in this directory. These images will be compared to the images in the ```approved``` folder, creating comparison result images in ```highlight```.
* ```highlight``` - Image comparison results of the latest test-run are saved in this folder. These images will highlight the differences between the ```approved```-image and the ```build```-image.
* ```config``` - Custom configuration files (.js or .json) for image specific comparison options. Sometimes, it is helpful to tune the comparison of a specific image. These options overwrite globally set comparison options. They are also optional. See the Blink-Diff Project WebSite for more information on these options.

The folder names for ```approved```, ```build```, ```highlight```, and ```config``` can be changed by supplying the parameters ```--approved-folder```, ```--build-folder```, ```--highlight-folder```, and ```--config-folder``` respectively:
 
```shell
kobold --approved-folder "golden" --highlight-folder "differences" /test/ui/regression
```
This test-run will look for ```golden``` and ```differences``` for the ```approved``` and ```highlight``` folder respectively instead of using the default folder names. In this specific case, ```build``` was not changed.

Sometimes, you want the tests to fail when previously approved screens are missing from the ```build``` directory. This can be the case when for example the tests that created these screenshots didn't fully run. Use the ```--fail-orphans``` flag to make these tests fail:
```shell
kobold --fail-orphans test/ui/regression
```

The ```--fail-additions``` flag will fail tests for screens that are new, screens that were never approved before.
```shell
kobold --fail-orphans --fail-additions test/ui/regression
```

Kobold also supports all Mocha parameters which can be interspersed with the Kobold parameters:
```shell
kobold --slow 3000 --fail-orphans --fail-additions --reporter dot --test-path test/ui/regression
```

##Command-Line
Since Kobold is built on top of Mocha, it supports all of its parameters in addition to the following:
* ```approved-folder``` - Name of the approved folder (default: 'approved')
* ```build-folder``` - Name of the build folder (default: 'build')
* ```highlight-folder``` - Name of the highlight folder (default: 'highlight')
* ```config-folder``` - Name of the config folder (default: 'config')
* ```fail-orphans``` - Flag that determines that tests should fail when screens that were previously approved, being in the ```approve``` folder, are not found in the ```build``` folder.
* ```fail-additions``` - Flag that determines that tests should fail when unapproved screens are found in the ```build``` folder, meaning screens that are missing from the ```approve``` folder.
* ```test-path``` - Path to directory with all test related folders as mentioned above (required). Uses implicitly the last parameter element when none is given.
* ```config``` - Path to a config file (.js or .json) that is used to overwrite comparison options. (default: none) See the Blink-Diff Project WebSite for more information on these options.

##Configuration
The global configuration file that can be selected by supplying ```--config``` to the command-line describes default-values for the comparison. 

Here is an example of the file (```config.js``` - can also be a JSON file):
```javascript
module.exports = {
	"delta": 35 // Changing the distance of pixel-comparison
};
```

This file then can be called as follows:
```shell
kobold --config config.js test/ui/regression
```

Configuration files for specific screens on the other hand describe only the comparison options for that screen. 
Here is an example for a screen that is named "YDN_Missing"; the path is ```config/YDN_Missing.json``` (could also be a ```.js```):
```javascript
{
	"outputBackgroundOpacity": 0.3,
	"outputBackgroundGreen": 100
}
```
This example will make the background for the comparison image look greener, and lightens-up the whole comparison by reducing the opacity of the background-mask.

##Examples
Kobold creates a regular test report as if the tests were manually written, and it also creates the following images, comparing the approved (left) with the build screenshot (right), pointing out the differences (middle).
* Changed color [![Screen1](https://raw.githubusercontent.com/yahoo/kobold/master/images/YDN_Color.png)](https://raw.githubusercontent.com/yahoo/kobold/master/examples/highlight/YDN_Color.png)
* Missing items [![Screen2](https://raw.githubusercontent.com/yahoo/kobold/master/images/YDN_Missing.png)](https://raw.githubusercontent.com/yahoo/kobold/master/examples/highlight/YDN_Missing.png)
* Messed-up sorting [![Screen3](https://raw.githubusercontent.com/yahoo/kobold/master/images/YDN_Sort.png)](https://raw.githubusercontent.com/yahoo/kobold/master/examples/highlight/YDN_Sort.png)
* Image swap [![Screen4](https://raw.githubusercontent.com/yahoo/kobold/master/images/YDN_Swap.png)](https://raw.githubusercontent.com/yahoo/kobold/master/examples/highlight/YDN_Swap.png)
* Text formatting [![Screen4](https://raw.githubusercontent.com/yahoo/kobold/master/images/YDN_Upper.png)](https://raw.githubusercontent.com/yahoo/kobold/master/examples/highlight/YDN_Upper.png)

These examples can be found in the ```examples``` folder. The above results were produced by running the following command in the project root with a globally installed Kobold:

```shell
kobold test/ui/regression
```

##API-Documentation

Generate the API-documentation with following command:
```shell
npm run docs
```
This will generate the source-code documentation in the ```docs``` folder of the module root.

##Tests

Run the tests with the following command:
```shell
npm run test
```
The code-coverage will be written to the ```coverage``` folder in the module root.

##Project Name
A Kobold is a gnome that can make itself invisible and is often the source of nuisances - so, pretty much like visual regressions.

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
