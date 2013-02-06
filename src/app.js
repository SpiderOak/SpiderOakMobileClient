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

  // Considering changing the template settings as the ERB defaults are annoying
  // _.templateSettings = {
  //   evaluate:    /\{\{#([\s\S]+?)=\}\}/g,          // {{# console.log("blah") }}
  //   interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g, // {{ title }}
  //   escape:      /\{\{\{([\s\S]+?)\}\}\}/g         // {{{ title }}}
  // };

  _.extend(spiderOakApp, {
    initialize: function() {
      // Start listening for important app-level events
      document.addEventListener(
        "deviceready",
        this.onDeviceReady,
        false
      );
      document.addEventListener(
        "loginSuccess",
        this.onLoginSuccess,
        false
      );
    },
    onDeviceReady: function() {
      // @FIXME: This seems cludgey
      if (window.cssLoaded) navigator.splashscreen.hide();
      // @TODO: Instantiate any plugins
    },
    onLoginSuccess: function() {
      // Instantiate the menusheet and bind the spiderOakApp.accountModel
      spiderOakApp.menuSheetView = new spiderOakApp.MenuSheetView({
        model: spiderOakApp.accountModel
      }).render();
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
