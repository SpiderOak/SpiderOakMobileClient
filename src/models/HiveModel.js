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
        resp.syncfolder.name = "SpiderOak Hive";
        return resp.syncfolder;
      }
      else {
        this.set("hasHive", false);
        return this.attributes;
      }
    },
    composedUrl: function() {
      var urlTail = encodeURI(this.get("device_path"));
      var urlHead = this.url.replace("s\/","") + this.get("device_encoded");
      var urlHeadObject = urlHead && this;
      return (urlHead || "") + (urlTail || "");
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
