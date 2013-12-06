/**
 * RecentsCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.RecentsCollection = spiderOakApp.CollectionBase.extend({
    model: spiderOakApp.RecentModel
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
