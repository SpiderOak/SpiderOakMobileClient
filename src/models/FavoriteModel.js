/**
 * FavoriteModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FavoriteModel = Backbone.Model.extend({
    defaults: {
      isFavorite: true
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
