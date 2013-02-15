/**
 * StorageView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  // A subset of the folder view
  spiderOakApp.StorageView = spiderOakApp.FolderView.extend({
    templateID: "#storageViewTemplate"
  });
  spiderOakApp.storageView = new spiderOakApp.StorageView().render();

})(window.spiderOakApp = window.spiderOakApp || {}, window);
