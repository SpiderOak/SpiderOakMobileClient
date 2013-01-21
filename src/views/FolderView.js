/**
 * FolderView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  // Should be many of these, so will not be tied to an existing DOM element
  // Will be initialised with a unique id and possibly a URL
  // var folderView = new spiderOakApp.FolderView({
  //   id: "someUniqueID",
  //   url: "/path/to/folder"
  // });
  spiderOakApp.FolderView = Backbone.View.extend({
    // ...
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);