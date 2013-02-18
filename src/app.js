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

  // Fix for lack of detach in Zepto...
  $.fn.detach = $.fn.remove;

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
    backDisabled: true,
    onDeviceReady: function() {
      document.addEventListener(
        "backbutton",
        spiderOakApp.onBackKeyDown,
        false
      );
      document.addEventListener(
        "menubutton",
        spiderOakApp.onMenuKeyDown,
        false
      );
      // @FIXME: This seems cludgey
      if (window.cssLoaded) navigator.splashscreen.hide();
      // @TODO: Instantiate any plugins
    },
    onLoginSuccess: function() {
      // Instantiate the menusheet and bind the spiderOakApp.accountModel
      spiderOakApp.menuSheetView = new spiderOakApp.MenuSheetView({
        model: spiderOakApp.accountModel
      }).render();
    },
    onBackKeyDown: function(event) {
      event.preventDefault();
      // @FIXME: Extend this logic a bit... it's a bit simplistic
      if ($("#main").hasClass("open")) {
        spiderOakApp.mainView.closeMenu();
        return;
      }
      if ($(".nav .back-btn").css("display") === "block") {
        spiderOakApp.navigator.popView(spiderOakApp.defaultEffect);
        return;
      }
      navigator.app.exitApp();
    },
    onMenuKeyDown: function(event) {
      spiderOakApp.mainView.openMenu();
    },
    navigator: new window.BackStack.StackNavigator({el:'#subviews'}),
    noEffect: new window.BackStack.NoEffect(),
    fadeEffect: new window.BackStack.FadeEffect(),
    defaultEffect: (($.os.android) ? new window.BackStack.NoEffect() :
      null)
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);

/* Cordova polyfills */

if (! window.cordova) {
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
}

/* Function.bind polyfill */

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        FNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof FNOP && oThis ? this : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    FNOP.prototype = this.prototype;
    fBound.prototype = new FNOP();
 
    return fBound;
  };
}
