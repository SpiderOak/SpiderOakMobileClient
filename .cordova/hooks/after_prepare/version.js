#!/usr/bin/env node
(function(require, console) {
  var
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    et = require('elementtree'),
    plist = require('plist'),
    shell = require('shelljs'),
    projectRootDir = path.resolve(__dirname, '..', '..', '..'),
    projectConfigFilePath = path.join(projectRootDir,
                                      'custom', 'brand', 'project_config.json'),
    projectConfig = require(projectConfigFilePath),
    genericConfigFile = path.join(
      projectRootDir,
      'config.xml'
    ),
    iOSConfigFilePath = path.join(
        projectRootDir,
        'platforms',
        'ios',
        projectConfig.projectName
    ),
    iOSConfigXMLFilePath = path.join(
        projectRootDir,
        'platforms',
        'ios',
        projectConfig.projectName,
        'config.xml'
    ),
    androidConfigFilePath = path.join(
        projectRootDir,
        'platforms',
        'android'
    ),
    androidConfigXMLFilePath = path.join(
        projectRootDir,
        'platforms',
        'android',
        'res',
        'xml',
        'config.xml'
    ),
    version = shell.exec('git describe --tags', {silent:true}).output.trim();
  var etSubElement = et.SubElement;

  var displayName = projectConfig.projectName;
  if (projectConfig.displayName) {
    displayName = projectConfig.displayName;
  }
  var shortDisplayName = projectConfig.projectName;
  if (projectConfig.shortDisplayName) {
    shortDisplayName = projectConfig.shortDisplayName;
  }

  if (fs.existsSync(iOSConfigFilePath)) {
    var plistFile = path.join(iOSConfigFilePath, projectConfig.projectName + '-Info.plist');
    var infoPlist = plist.parseFileSync(plistFile);
    var config = new et.ElementTree(
      et.XML(
        fs.readFileSync(genericConfigFile, 'utf-8')
      )
    );
    var package = config.getroot().attrib.id.split(".");
    package.pop();
    package.push(projectConfig.projectName);
    infoPlist['CFBundleIdentifier'] = package.join(".");
    infoPlist['CFBundleVersion'] = moment().format('YYYYMMDDkkmm');
    infoPlist['CFBundleShortVersionString'] = version;
    infoPlist['CFBundleDisplayName'] = shortDisplayName;
    var info_contents = plist.build(infoPlist);
    info_contents = info_contents.replace(/<string>[\s\r\n]*<\/string>/g,'<string></string>');
    fs.writeFileSync(plistFile, info_contents, 'utf-8');
    var configXML = new et.ElementTree(
      et.XML(
        fs.readFileSync(iOSConfigXMLFilePath, 'utf-8')
      )
    );
    configXML.getroot().attrib.version = version;
    fs.writeFileSync(
      iOSConfigXMLFilePath, configXML.write({indent: 4}), 'utf-8'
    );
  }

  if (fs.existsSync(androidConfigFilePath)) {
    var doc = new et.ElementTree(
      et.XML(
        fs.readFileSync(path.join(androidConfigFilePath, 'AndroidManifest.xml'), 'utf-8')
      )
    );
    doc.getroot().attrib['android:versionName'] = version;
    doc.getroot()._children.forEach(function(child, index) {
      if (child.tag === 'application') {
        child.attrib['android:label'] = displayName;
        child._children.forEach(function(subchild, index) {
          if (subchild.tag === 'activity') {
            subchild.attrib['android:label'] = shortDisplayName;
          }
        });
      }
    });
    fs.writeFileSync(
      path.join(androidConfigFilePath, 'AndroidManifest.xml'), doc.write({indent: 4}), 'utf-8'
    );
    var configXML = new et.ElementTree(
      et.XML(
        fs.readFileSync(androidConfigXMLFilePath, 'utf-8')
      )
    );
    configXML.getroot().attrib.version = version;
    fs.writeFileSync(
      androidConfigXMLFilePath, configXML.write({indent: 4}), 'utf-8'
    );
  }


})(require, console);
