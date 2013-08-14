#!/usr/bin/env node

(function(require, console) {
  var projectName = 'SpiderOak',
      fs = require('fs'),
      path = require('path'),
      projectRootDir = path.resolve(__dirname, '..', '..', '..'),
      elementsFilePath = path.join(projectRootDir, 'custom', 'elements.json'),
      // require throws error if file is not found:
      elements = require(elementsFilePath),
      elementsNum = 0,
      platformDestinations = {
        android: path.join(projectRootDir, 'platforms', 'android', 'assets'),
        ios: path.join(projectRootDir, 'platforms', 'ios', projectName)
      },
      customElementsDir =
        path.join(projectRootDir,
                  path.join.apply({}, elements.GetCustomElementsFrom)),
      platform;

  console.log("[hooks] Applying customizations from %s", elementsFilePath);

  /** Copy optional customization elements to the indicated platform dir.
   */
  function doCopyIfPresent(fileName, relativePath, platform) {
    var platformLC = platform.toLowerCase();
    if (! platformDestinations.hasOwnProperty(platformLC)) {
      throw new Error("[hooks] Unrecognized customization platform '%s'",
                      platform);
    }
    var fromPath = path.join(customElementsDir, fileName);
    var destPath = path.join(platformDestinations[platformLC],
                             path.join.apply({}, relativePath),
                             fileName);
    // Copy if optional item is present.
    if (fs.existsSync(fromPath)) {
      if (! fs.existsSync(path.dirname(destPath))) {
        console.log("[hooks] Skipping missing platform %s" +
                    " destination dir %s, for file %s",
                    path.dirname(destPath), platform, item.FileName);
        return false;
      }
      var readStream = fs.createReadStream(fromPath);
      var writeStream = fs.createWriteStream(destPath);
      // By queuing the end event, we ensure that copying finishes before
      // the node.js process exits, because the event queue must drain
      // before exit.
      writeStream.on('end', function (event) {});
      console.log("[hooks] Copying custom platform %s element %s to: %s",
                  platform, fileName, destPath);
      readStream.pipe(writeStream);
      return true;
    }
    return false;
  }

  /* Iterate the custom element entries, copying elements found in the
   * CustomElements folder to locations indicated, relative to the
   * projectRootDir. */
  for (var i in elements.Items) {
    var item = elements.Items[i];
    for (var p in item.Platforms) {
      platform = item.Platforms[p];
      doCopyIfPresent(item.FileName, item.TargetFolder, platform);
    }
  }
})(require, console);
