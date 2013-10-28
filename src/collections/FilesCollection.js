/**
 * FilesCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  var ppcb = spiderOakApp.PasswordProtectedCollectionBase;
  spiderOakApp.FilesCollection = ppcb.extend({
    model: spiderOakApp.FileModel,
    parse: function(resp, xhr) {
      // window.console.log(resp);
      _.each(resp.files, function(file) {
        _.extend(file, window.fileHelper
          .fileTypeFromExtension(file.name)
        );
        if ($.os.ios) {
          file.openInternally = true;
        }
      });
      return resp.files;
    },
    which: "FilesCollection"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
