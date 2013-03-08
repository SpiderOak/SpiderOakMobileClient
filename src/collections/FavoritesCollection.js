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

  spiderOakApp.FavoritesCollection = Backbone.Collection.extend({
    model: spiderOakApp.FavoriteModel
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
