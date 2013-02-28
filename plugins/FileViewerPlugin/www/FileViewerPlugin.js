cordova.define("cordova/plugin/fileviewerplugin", function(require, exports, module) {
  var exec = require('cordova/exec');

  var FileViewerPlugin = function() {};

  // Are all of these needed???
  FileViewerPlugin.prototype.ACTION_SEND = "android.intent.action.SEND";
  FileViewerPlugin.prototype.ACTION_VIEW= "android.intent.action.VIEW";
  FileViewerPlugin.prototype.EXTRA_TEXT = "android.intent.extra.TEXT";
  FileViewerPlugin.prototype.EXTRA_SUBJECT = "android.intent.extra.SUBJECT";
  FileViewerPlugin.prototype.EXTRA_STREAM = "android.intent.extra.STREAM";
  FileViewerPlugin.prototype.EXTRA_EMAIL = "android.intent.extra.EMAIL";

  FileViewerPlugin.prototype.view = function(params, success, fail) {
  return exec(function(args) {
      success(args);
      }, function(args) {
          fail(args);
      }, 'FileViewerPlugin', 'view', [params]);
  };

  var fileviewerplugin = new FileViewerPlugin();
  module.exports = fileviewerplugin;
});


/**
  //usage:
  var fileViewer = cordova.require("cordova/plugin/fileviewerplugin");
  var win  = function() { alert('win!');  }
  var fail = function() { alert('fail!'); }

  var params = {
    action: WebIntent.ACTION_VIEW,
    url: encodeURI(entry.fullPath)
  };

   fileViewer.view(params, win, fail);
*/