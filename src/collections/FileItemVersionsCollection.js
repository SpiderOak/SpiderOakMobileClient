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

  var ppcb = spiderOakApp.PasswordProtectedCollectionBase;
  spiderOakApp.FileItemVersionsCollection = ppcb.extend({
    model: spiderOakApp.FileVersionModel,
    parse: function(resp, xhr) {
      // window.console.log(resp);
      _.each(resp, function(file) {
        _.extend(file, window.fileHelper
          .fileTypeFromExtension(file.name)
        );
      });
      return resp;
    },
    which: "FileItemVersionsCollection"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
