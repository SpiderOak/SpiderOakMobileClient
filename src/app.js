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
      // Hax for Android 2.x not groking :active
      $(document).on("touchstart", "a", function(event) {
        var $this = $(this);
        $this.addClass("active");
      });
      $(document).on("touchend", "a", function(event) {
        var $this = $(this);
        $this.removeClass("active");
      });
      $(document).on("touchmove", "a", function(event) {
        var $this = $(this);
        $this.removeClass("active");
      });
      $(".splash").hide();
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
      spiderOakApp.fileViewer = window.cordova &&
        window.cordova.require("cordova/plugin/fileviewerplugin");
    },
    onLoginSuccess: function() {
      // Instantiate the menusheet and bind the spiderOakApp.accountModel
      // @TODO: refactor so menuSheetView can also be used without active login.
      spiderOakApp.menuSheetView = new spiderOakApp.MenuSheetView({
        model: spiderOakApp.accountModel
      }).render();
      // Instantiate the favorites and populate from localStorage
      var favorites = window.store.get(
        "favorites-" + spiderOakApp.accountModel.get("b32username")
      );
      favorites = favorites || [];
      spiderOakApp.favoritesCollection =
        new spiderOakApp.FavoritesCollection(favorites);
      // console.log(JSON.stringify(favorites));
    },
    onBackKeyDown: function(event) {
      event.preventDefault();
      if ($(".modal").is(":visible")) {
        return;
      }
      // @FIXME: Extend this logic a bit... it's a bit simplistic
      if ($("#main").hasClass("open")) {
        spiderOakApp.mainView.closeMenu();
        return;
      }
      if ($(".nav .back-btn").is(":visible")) {
        spiderOakApp.navigator.popView(spiderOakApp.defaultEffect);
        return;
      }
      navigator.app.exitApp();
    },
    onMenuKeyDown: function(event) {
      if ($("#main").hasClass("open")) {
        spiderOakApp.mainView.closeMenu();
      }
      else {
        spiderOakApp.mainView.openMenu();
      }
    },
    downloader: new window.FileDownloadHelper(),
    navigator: new window.BackStack.StackNavigator({el:'#subviews'}),
    noEffect: new window.BackStack.NoEffect(),
    fadeEffect: new window.BackStack.FadeEffect(),
    defaultEffect: (($.os.android) ? new window.BackStack.NoEffect() : null),
    b32nibbler: new window.Nibbler({dataBits: 8,
                                    codeBits: 5,
                                    keyString:
                                      "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
                                    pad: ""
                                   })
  });

  /*
   * How a model in our framework determines its' composite URL.
   *
   * The URL is a concatenation of model and collection url elements.  Any
   * prevailing elements that are functions are evaluated for their result.
   *
   * - A head part is taken in this order of precedence:
   *   - the model's collection's urlBase attribute, or
   *   - the model's collection's url attribute,
   * - The url part is taken from the model's .get("url").
   *
   * @this{model}
   */
  Backbone.Model.prototype.composedUrl = function() {
    var urlTail = this.get("url");
    var collection = this.collection;
    var urlHead = collection ? (collection.urlBase || collection.url) : "";
    if (typeof urlTail === "function") {
      urlTail = urlTail.call(this);
    }
    if (typeof urlHead === "function") {
      urlHead = urlHead.call(this.collection);
    }
    return urlHead + urlTail;
  };
  /**
   * Method to fetch model.url string and function versions identically.
   */
  Backbone.Model.prototype.urlResult = function() {
    return (typeof this.url === "function") ? this.url() : this.url;
  };

})(window.spiderOakApp = window.spiderOakApp || {}, window);

/* Function.bind polyfill */

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - " +
        "what is trying to be bound is not callable");
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
