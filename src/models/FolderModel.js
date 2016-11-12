/**
 * FolderModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function () {};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FolderModel = spiderOakApp.PasswordProtectedModelBase.extend({
    defaults: _.extend(
      {},
      spiderOakApp.PasswordProtectedModelBase.prototype.defaults
    ),
    which: "FolderModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
