#!/usr/bin/env node
(function(require) {
  var fs = require('fs'),
    path = require('path'),
    projectRootDir = path.resolve(__dirname, '..', '..', '..'),
    projectConfigFilePath = path.join(projectRootDir,
                                      'custom', 'brand', 'project_config.json'),
    projectName = require(projectRootDir).projectName,
    res = path.join(projectRootDir, 'merges', 'ios', 'res', 'screen'),
    iOSDest = path.join(projectRootDir, 'platforms', 'ios',
                        projectName, 'Resources', 'splash');

  var iOSSplashes = [
    { file: 'iphone_portrait.png', dest: 'Default~iphone.png' },
    { file: 'iphone_retina_portrait.png', dest: 'Default@2x~iphone.png' },
    { file: 'iphone5_retina_portrait.png', dest: 'Default-568h@2x~iphone.png' },
    { file: 'ipad_portrait.png', dest: 'Default-Portrait~ipad.png' },
    { file: 'ipad_retina_portrait.png', dest: 'Default-Portrait@2x~ipad.png' },
    { file: 'ipad_landscape.png', dest: 'Default-Landscape~ipad.png' },
    { file: 'ipad_retina_landscape.png', dest: 'Default-Landscape@2x~ipad.png' }
  ];

  function copyFile(from, to) {
    var readStream = fs.createReadStream(from);
    var writeStream = fs.createWriteStream(to);
    // Occupy event queue until write 'end' so process doesn't exit 'til done:
    writeStream.on('end', function (event) {});
    readStream.pipe(writeStream);
  }

  if (fs.existsSync(res)) {
    if (fs.existsSync(iOSDest)) {
      console.log("[hooks] copying ios splashes...");
      // iOS
      var idx;
      for (idx in iOSSplashes) {
        copyFile(
          path.join(res, iOSSplashes[idx].file),
          path.join(iOSDest, iOSSplashes[idx].dest)
        );
      }
    }
  }

})(require);
