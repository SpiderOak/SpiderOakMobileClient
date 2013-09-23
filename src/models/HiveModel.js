/**
 * HiveModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.HiveModel = spiderOakApp.FolderModel.extend({
    defaults: {
      hasHive: true
    },
    parse: function(resp, xhr) {
      if (resp.syncfolder) {
        resp.syncfolder.name = s("SpiderOak Hive");
        return resp.syncfolder;
      }
      else {
        this.set("hasHive", false);
        return this.attributes;
      }
    },
    composedUrl: function(bare) {
      var urlTail = this.get("url");
      var urlHead = this.url;
      if (bare) {
        urlHead = urlHead && urlHead.split("?")[0];
        urlTail = urlTail && urlTail.split("?")[0];
      }
      return (urlHead || "") + (urlTail || "");
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
