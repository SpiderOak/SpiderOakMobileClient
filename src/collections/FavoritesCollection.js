/**
 * FavoritesCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FavoritesCollection = spiderOakApp.CollectionBase.extend({
    model: spiderOakApp.FavoriteModel,
    comparator: function(object) {
      return object.get("name");
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
