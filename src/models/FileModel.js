/**
 * FileModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function () {};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FileModel = spiderOakApp.PasswordProtectedModelBase.extend({
    defaults: _.extend(
      {isFavorite: false},
      spiderOakApp.PasswordProtectedModelBase.prototype.defaults
    ),
    which: "FileModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
