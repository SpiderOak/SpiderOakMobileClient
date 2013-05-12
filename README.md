# Overview

[![Build Status](https://travis-ci.org/SpiderOak/SpiderOakMobileClient.png)](https://travis-ci.org/SpiderOak/SpiderOakMobileClient)

[SpiderOak](http://spideroak.com) is working on reimplementing its client applications for mobile devices as a central, platform-independent HTML5 / Javascript / CSS core with native extensions to fill in the functionality gaps. This is intended to replace the current, platform-specific native applications. We see many potential benefits to the html5 approach, among them being implementation in a widely used, comprehensible (if we're careful) medium that can be very useful to others.

There are many ways that access to our code can be useful. It can serve as guidance to people as examples for using our APIs. It can serve as a basis for implementing idiosyncratic functionality that they need. It can provide the opportunity to contribute to and help grow this useful tool, itself. These and other reasons are why we make the code openly available, and the development process reasonably transparent.

Hence the code is officially available as open source, under the Apache license, and we are conducting our development using a SpiderOak public repository situated at github.

It's worth mentioning that this mobile client is extremely important to SpiderOak as a business. We are opening the source in order to make the development effort more immediately useful, in ways described above, as well as to leverage various collaboration opportunities that such openness affords. We will continue to devote significant internal development resources to this effort, as it requires.

## Requirements

- Cordova CLI - [https://github.com/apache/cordova-cli/](https://github.com/apache/cordova-cli/)
	- Cordova / PhoneGap command line interface
- Grunt - [http://gruntjs.com/](http://gruntjs.com/)
	- Build tool for minimising, running and tests
- Node and npm - [http://nodejs.org/](http://nodejs.org/)
	- Node package manager for Grunt Add-ons
- PhantomJS - [http://phantomjs.org/](http://phantomjs.org/)
	- Headless webkit for running tests
- FileViewerPlugin - [https://github.com/SpiderOak/FileViewerPlugin](https://github.com/SpiderOak/FileViewerPlugin)
	- Cordova plugin for viewing files on Android via Intents

## Getting started

- clone the project
- cd into the project folder
- `npm install` to install node_modules and js/css components (`npm install` will also run `bower install`).
- `cordova platform add ios` and/or `cordova platform add android`

### Adding the plugin(s)
- create a SpiderOakMobileClient project subdirectory named `plugins`
	- `mkdir plugins`
- include FileViewerPlugin:
	- clone the [FileViewerPlugin](https://github.com/SpiderOak/FileViewerPlugin) somewhere
	- add the FileViewerPlugin to the project: `cordova plugin add /path/to/FileViewerPlugin`

## First test

To make sure everything is set up from the above, run your first tests

Run `grunt test` - This will lint the source (`grunt lint`), concat the source into a single js file (`grunt concat`) and finally run the headless Mocha tests (`grunt shell:mochaspec`).

## Workflow

JavaScript files are in `src`. They are kept out of the www tree so that they can be linted without trying to lint the concatenated and minified versions. However, the index.html should have a script tag only for the JavaScript files in either `www/components` (managed by Bower) or `www/js`.

Building and testing the project is normally done via the Grunt tasks below.

## Grunt tasks

`grunt lint`

- runs JSHint on the src files `src/**/*.js``

`grunt concat`

- concatenates the src files in `src/models/*.js`, `src/collections/*.js`, `src/views/*.js` and `src/app.js` (in that order) into `www/js/<package-name-from-package.json>.js`
- concatenates the src files in `tests/models/*.js`, `tests/collections/*.js`, `tests/views/*.js` and `src/index.js` into `www/tests/<package-name-from-package.json>-tests.js`

`grunt min`

- minifies `www/js/<package-name-from-package.json>.js` into `www/js/<package-name-from-package.json>.min.js` (so should only be called after calling `grunt concat` above)

`grunt compass:dev`

- compiles the SASS files via Compass and 

`grunt shell:mochaspec`

- runs Mocha tests in `www/tests/<package-name-from-package.json>-tests.js` based on the template `www/tests/index.html` and outputs via the Mocha "spec" reporter.

`grunt shell:mochadot`

- runs Mocha tests in `www/tests/<package-name-from-package.json>-tests.js` based on the template `www/tests/index.html` and outputs via the more minimalist Mocha "dot" reporter.

`grunt watch`

- starts watching the same files as `grunt concat:dist` as well as the files from `grunt concat:tests` and when changes are detected runs `lint concat compass:dev shell:mochadot`

#### Custom tasks

`grunt` (default tasks)

- runs `lint concat min shell:mochadot`

`grunt test`

- runs `lint concat shell:mochaspec`

`grunt debug_ios`

- runs `lint concat shell:debug_ios` to debug iOS platform on the simulator

`grunt debug_android`

- runs `lint concat shell:debug_android` to debug Android platform on the emulator (or a plugged in device)

See the [Running, Testing, and Debugging section](https://github.com/SpiderOak/SpiderOakMobileClient/wiki/Home#wiki-Running_Testing_and_Debugging) of the wiki home page for more info.
