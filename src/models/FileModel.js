/**
 * FileModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FileModel = spiderOakApp.PasswordProtectedModelBase.extend({
    initialize: function (options) {
      // XXX @DELETEME
      return 1;
    },
    defaults: _.extend(
      {isFavorite: false},
      spiderOakApp.PasswordProtectedModelBase.prototype.defaults
    ),
    parseSpecific: function(resp, xhr) {
      return Backbone.Model.prototype.parse.call(this, resp, xhr);
    },
    which: "FileModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
