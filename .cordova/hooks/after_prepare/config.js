#!/usr/bin/env node
(function(require, console) {
  var
    fs = require('fs'),
    path = require('path'),
    projectRootDir = path.resolve(__dirname, '..', '..', '..'),
    projectConfigFilePath = path.join(projectRootDir,
                                      'custom', 'brand', 'project_config.json'),
    projectName = require(projectConfigFilePath).projectName,
    res = path.join(projectRootDir, 'www', 'res', 'config'),
    androidDest = path.join(projectRootDir, 'platforms', 'android'),
    iOSDest = path.join(projectRootDir, 'platforms', 'ios', projectName);

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
