#!/usr/bin/env node

(function(require, console) {
  var projectName = 'SpiderOak',

      // Brand defaults. Values will be gleaned from brand config files.
      brandName = projectname,
      brandIdentifier = "com.spideroak.android",

      fs = require('fs'),
      path = require('path'),
      projectRootDir = path.resolve(__dirname, '..', '..', '..'),

      brandDir = path.join(projectRootDir, 'custom', 'elements.json'),
      brandConfigFilePath = path.join(brandConfigDir, 'brand_config.json'),
      // require throws error if file is not found:
      elements = require(elementsFilePath),
      elementsNum = 0,
      platformDestinations = {
        android: path.join(projectRootDir, 'platforms', 'android'),
        ios: path.join(projectRootDir, 'platforms', 'ios', projectName)
      },
      customElementsDir =
        path.join(projectRootDir,
                  path.join.apply({},
                                  // Split+path.join for platform independence:
                                  elements.GetCustomElementsFrom.split('/'))),
      platform;

  console.log("[hooks] Applying customizations from %s", elementsFilePath);

  /** Copy optional customization elements to the indicated platform dir.
   *
   * @return true if item was present and copied, false otherwise.
   * @param {string} sourceFileName The file being copied from
   * @param {string} targetFileName The file being copied to
   * @param {string} targetPath The target path relative to platfom dir root
   * @param {string} platform The name of the target platform (case insensitive)
   */
  function doCopyIfPresent(sourceFileName, targetFileName,
                           targetPath, platform) {
    var platformLC = platform.toLowerCase();
    if (! platformDestinations.hasOwnProperty(platformLC)) {
      throw new Error("[hooks] Unrecognized customization platform '%s'",
                      platform);
    }
    var fromPath = path.join(customElementsDir, sourceFileName);
    var destPath = path.join(platformDestinations[platformLC],
                             path.join.apply({}, targetPath.split("/")),
                             targetFileName);
    // Copy if optional item is present.
    if (fs.existsSync(fromPath)) {
      if (! fs.existsSync(path.dirname(destPath))) {
        console.log("[hooks] Skipping missing %s destination dir" +
                    " for item %s: %s",
                    platform, item.FileName, path.dirname(destPath));
        return false;
      }
      var readStream = fs.createReadStream(fromPath);
      var writeStream = fs.createWriteStream(destPath);
      // Occupy event queue until write 'end' so process doesn't exit 'til done:
      writeStream.on('end', function (event) {
        // console.log() seems to be ineffective in an event handler?
        //console.log("[hooks] %s written.", destPath);
      });
      //console.log("[hooks] Copying custom platform %s element %s to: %s",
      //            platform, sourceFileName, destPath);
      readStream.pipe(writeStream);
      return true;
    }
    return false;
  }

  /* Iterate the custom element entries, copying elements found in the
   * CustomElements folder to locations indicated, relative to the
   * projectRootDir. */
  for (var i in elements.Items) {
    var item = elements.Items[i],
        sourceFileName = item.SourceFileName || item.FileName,
        targetFileName = item.TargetFileName || item.FileName;
    for (var p in item.Platforms) {
      platform = item.Platforms[p];
      doCopyIfPresent(sourceFileName, targetFileName,
                      item.TargetFolder, platform);
    }
  }
})(require, console);
