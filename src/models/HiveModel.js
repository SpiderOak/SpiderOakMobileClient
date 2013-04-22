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
    parse: function(resp, xhr) {
      resp.syncfolder.name = "SpiderOak Hive";
      return resp.syncfolder;
    },
    composedUrl: function() {
      var urlTail = encodeURI(this.get("device_path"));
      var urlHead = this.url.replace("s\/","") + this.get("device_encoded");
      var urlHeadObject = urlHead && this;
      return (urlHead || "") + (urlTail || "");
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
