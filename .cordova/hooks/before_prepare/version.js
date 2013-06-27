#!/usr/bin/env node
(function(require, console) {
  var projectName = 'SpiderOak',
    fs = require('fs'),
    path = require('path'),
    et = require('elementtree'),
    shell = require('shelljs'),
    configPath = path.join('.', 'www', 'config.xml');

  var doc = new et.ElementTree(et.XML(fs.readFileSync(configPath, 'utf-8')));
  doc.getroot().attrib.version =
    shell.exec('git describe --tags', {silent:true}).output.trim();
  fs.writeFileSync(configPath, doc.write({indent: 4}), 'utf-8');


})(require, console);
