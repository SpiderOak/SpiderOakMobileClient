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

  spiderOakApp.FilesCollection = Backbone.Collection.extend({
    model: spiderOakApp.FileModel,
    parse: function(resp, xhr) {
      // window.console.log(resp);
      _.each(resp.files, function(file) {
        _.extend(file, window.fileHelper
          .fileTypeFromExtension(file.name)
        );
      });
      return resp.files;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
