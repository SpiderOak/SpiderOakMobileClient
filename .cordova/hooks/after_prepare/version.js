#!/usr/bin/env node
(function(require, console) {
  var projectName = 'SpiderOak',
    fs = require('fs'),
    path = require('path'),
    et = require('elementtree'),
    plist = require('plist'),
    shell = require('shelljs'),
    projectRootDir = path.resolve(__dirname, '..', '..', '..'),
    genericConfigFile = path.join(
      projectRootDir,
      'www',
      'config.xml'
    ),
    iOSConfigFilePath = path.join(
        projectRootDir,
        'platforms',
        'ios',
        projectName
    ),
    androidConfigFilePath = path.join(
        projectRootDir,
        'platforms',
        'android'
    ),
    version = shell.exec('git describe --tags', {silent:true}).output.trim();

  if (fs.existsSync(iOSConfigFilePath)) {
    var plistFile = path.join(iOSConfigFilePath, projectName + '-Info.plist');
    var infoPlist = plist.parseFileSync(plistFile);
    var config = new et.ElementTree(
      et.XML(
        fs.readFileSync(genericConfigFile, 'utf-8')
      )
    );
    var package = config.getroot().attrib.id.split(".");
    package.pop();
    package.push(projectName);
    infoPlist['CFBundleIdentifier'] = package.join(".");
    infoPlist['CFBundleVersion'] = version;
    infoPlist['CFBundleShortVersionString'] = version;
    var info_contents = plist.build(infoPlist);
    info_contents = info_contents.replace(/<string>[\s\r\n]*<\/string>/g,'<string></string>');
    fs.writeFileSync(plistFile, info_contents, 'utf-8');
  }

  if (fs.existsSync(androidConfigFilePath)) {
    var doc = new et.ElementTree(
      et.XML(
        fs.readFileSync(path.join(androidConfigFilePath, 'AndroidManifest.xml'), 'utf-8')
      )
    );
    doc.getroot().attrib['android:versionName'] = version;
    fs.writeFileSync(
      path.join(androidConfigFilePath, 'AndroidManifest.xml'), doc.write({indent: 4}), 'utf-8'
    );
  }


})(require, console);
