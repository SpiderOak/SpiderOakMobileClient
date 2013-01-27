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

  spiderOakApp.FolderModel = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this);
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
