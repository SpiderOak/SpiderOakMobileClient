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
