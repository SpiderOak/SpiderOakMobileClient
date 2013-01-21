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
      spiderOakApp.mainView = new spiderOakApp.MainView().render();
    },
    onDeviceReady: function() {
      // @FIXME: This seems cludgey
      navigator.splashscreen.hide();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
