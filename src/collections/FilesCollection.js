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
    // ...
    parse: function(resp, xhr) {
      // window.console.log(resp);
      return resp.files;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
