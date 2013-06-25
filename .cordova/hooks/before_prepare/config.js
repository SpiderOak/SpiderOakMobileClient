#!/usr/bin/env node
(function(require, console) {
  var projectName = 'SpiderOak',
    fs = require('fs'),
    path = require('path'),
    res = path.join('.', 'www', 'res', 'config'),
    androidDest = path.join('.', 'platforms', 'android'),
    iOSDest = path
      .join('.', 'platforms', 'ios', projectName);

  function copyFile(from, to) {
    var readStream = fs.createReadStream(from);
    readStream.pipe(fs.createWriteStream(to));
  }

  var androidConfigFile = "AndroidManifest.xml";
  var iosConfigFile = "SpiderOak-Info.plist";

  if (fs.existsSync(res)) {
    // Android
    if (fs.existsSync(androidDest)) {
      console.log("[hooks] copying android AndroidManifest.xml...");
      copyFile(
        path.join(res, androidConfigFile),
        path.join(androidDest, androidConfigFile)
      );
    }
    if (fs.existsSync(iOSDest)) {
      console.log("[hooks] copying ios SpiderOak-Info.plist...");
      // iOS
      copyFile(
        path.join(res, iosConfigFile),
        path.join(iOSDest, iosConfigFile)
      );
    }
  }

})(require, console);
