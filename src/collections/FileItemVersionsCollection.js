/**
 * FileItemVersionsCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FileItemVersionsCollection = Backbone.Collection.extend({
    model: spiderOakApp.FileVersionModel,
    parse: function(resp, xhr) {
      // window.console.log(resp);
      _.each(resp, function(file) {
        _.extend(file, window.fileHelper
          .fileTypeFromExtension(file.name)
        );
      });
      return resp;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
