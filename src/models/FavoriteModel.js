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

  spiderOakApp.FavoriteModel = spiderOakApp.PasswordProtectedModelBase.extend({
    defaults: _.extend(
      {isFavorite: true},
      spiderOakApp.PasswordProtectedModelBase.prototype.defaults
    )
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
