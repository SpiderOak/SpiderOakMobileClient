/**
 * FavoritesCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.FavoritesCollection = spiderOakApp.CollectionBase.extend({
    model: spiderOakApp.FavoriteModel,
    /** Get root of favorites path for current user */
    basePath: function() {
      return ("Download/" +
              s("SpiderOak") +
              "/.favorites/" +
              (spiderOakApp.accountModel.get("b32username") || "anonymous"));
    },
    comparator: function(object) {
      return object.get("name");
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
