/**
 * app.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  _.extend(spiderOakApp, {
    initialize: function() {
      document.addEventListener("deviceready", spiderOakApp.onDeviceReady, false);
    },
    onDeviceReady: function() {
      // @FIXME: This seems cludgey
      if (window.cssLoaded) navigator.splashscreen.hide();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
