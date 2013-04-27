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
      this.on("change", function () {
        this.collection.trigger("change");
      });
    },
    which: "SettingModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
