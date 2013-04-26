/**
 * SettingsModels.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.SettingModel = spiderOakApp.FolderModel.extend({
    initialize: function() {
      // Base behavior is a no-op.
      this.on("change", this.collection.trigger("change"));
    },
    fetch: function(options) {
      // Base behavior is a no-op.
    },
    which: "SettingModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
