/**
 * FolderModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FolderModel = spiderOakApp.PasswordProtectedModelBase.extend({
    defaults: _.extend(
      {},
      spiderOakApp.PasswordProtectedModelBase.prototype.defaults
    ),
    parseSpecific: function(resp, xhr) {
      // Specifically bypass PasswordProtectedModelBase.parse - we were
      // called form there:
      return Backbone.Model.prototype.parse.call(this, resp, xhr);
    },
    which: "FolderModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
