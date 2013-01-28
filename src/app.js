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

  // notification.alert polyfill for browser testing
  navigator.notification = navigator.notification || {
    alert: function(msg,cb,title,button) {
      window.alert(msg);
    }
  };

})(window.spiderOakApp = window.spiderOakApp || {}, window);
