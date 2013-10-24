/**
 * StorageBarModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.StorageBarModel = spiderOakApp.ModelBase.extend({
    parse: function(resp, xhr) {
      var stats = resp.stats;
      var size = resp.stats.size_for_robots;
      var backupsize = parseInt(resp.stats.backupsize_for_robots, 10);
      var percentUsed =
        Math.ceil((backupsize / size) * 100);
      stats.percentUsed = percentUsed;
      return stats;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
