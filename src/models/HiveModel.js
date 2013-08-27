/**
 * HiveModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.HiveModel = spiderOakApp.FolderModel.extend({
    defaults: {
      hasHive: true
    },
    parse: function(resp, xhr) {
      if (resp.syncfolder) {
        resp.syncfolder.name = (spiderOakApp.settings.get("app_label")
                                .get("value") + " Hive");
        return resp.syncfolder;
      }
      else {
        this.set("hasHive", false);
        return this.attributes;
      }
    },
    composedUrl: function(bare) {
      var urlTail = encodeURI(this.get("device_path"));
      var urlHead = this.url.replace("s\/","") + this.get("device_encoded");
      if (bare) {
        urlHead = urlHead && urlHead.split("?")[0];
        urlTail = urlTail && urlTail.split("?")[0];
      }
      return (urlHead || "") + (urlTail || "");
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
