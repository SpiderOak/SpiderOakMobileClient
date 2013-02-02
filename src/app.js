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

/* Cordova polyfills */

if (! navigator.notification) {
  navigator.notification = {};
}

if (! navigator.notification.alert) {
  navigator.notification.alert =
      function (message, alertCallback, title, buttonName) {
        window.alert(message);
        if (alertCallback) {
            alertCallback();
        }
    };
}

if (! navigator.notification.confirm) {
  navigator.notification.confirm =
      function (message, confirmCallback, title, buttonLabels){
        var isConfirmed = window.confirm(message);
        if (confirmCallback)
        {
          confirmCallback((isConfirmed) ? 1 : 2);
        }
      };
}
