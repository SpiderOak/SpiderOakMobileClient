/**
 * app.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      store       = window.store;

  // Fix for lack of detach in Zepto...
  $.fn.detach = $.fn.remove;

  // Considering changing the template settings as the ERB defaults are annoying
  // _.templateSettings = {
  //   evaluate:    /\{\{#([\s\S]+?)=\}\}/g,          // {{# console.log("blah") }}
  //   interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g, // {{ title }}
  //   escape:      /\{\{\{([\s\S]+?)\}\}\}/g         // {{{ title }}}
  // };

  _.extend(spiderOakApp, {
    // @TODO: Establish distinct config file and fetch settings from it.
    // Retained values will be held in local storage, and local changes
    // will supercede these default values.
    config: {
      server: {value: "spideroak.com", retain: 1}
    },
    initialize: function() {
      // Stub out iScroll where -webkit-overflow-scrolling:touch is supported
      if (window.Modernizr.overflowscrolling) {
        window.iScroll = function(options) {
          // ...
        };

        window.iScroll.prototype.refresh = function() {
          // ...
        };

        window.iScroll.prototype.destroy = function() {
          // ...
        };
      }
      else {
        // Set some limits for Android 2.x
        spiderOakApp.maxEntries = 100;
      }

      spiderOakApp.settings = new spiderOakApp.SettingsCollection();
      spiderOakApp.accountModel = new spiderOakApp.AccountModel();
      spiderOakApp.menuSheetView = new spiderOakApp.MenuSheetView({
        model: spiderOakApp.accountModel
      }).render();
      // Instantiate the favorites and populate from localStorage
      var favorites = window.store.get("favorites");
      favorites = favorites || [];
      spiderOakApp.favoritesCollection =
        new spiderOakApp.FavoritesCollection(favorites);
      var favoritesConfirmationAccepted =
        store.get("favoritesConfirmationAccepted") || false;
      spiderOakApp.accountModel.set("favoritesConfirmationAccepted",
                                    favoritesConfirmationAccepted);
      spiderOakApp.recentsCollection = new spiderOakApp.RecentsCollection();

      // Benefit of the doubt
      this.networkAvailable = true;

      this.version = "0.0.0"; // lame default
      $.ajax({
        url: "./config.xml",
        dataType: "xml",
        success: function(config){
          this.version = $(config).find("widget").attr("version") || "";
        }.bind(this)
      });

      // Start listening for important app-level events
      document.addEventListener("deviceready", this.onDeviceReady, false);
      document.addEventListener("loginSuccess", this.onLoginSuccess, false);
      document.addEventListener("logoutSuccess", this.onLogoutSuccess, false);
      document.addEventListener("resume", this.onResume, false);
      document.addEventListener("offline", this.setOffline, false);
      document.addEventListener("online", this.setOnline, false);
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
    setOnline: function(event) {
      this.networkAvailable = true;
    },
    setOffline: function(event) {
      this.networkAvailable = false;
      var onConfirm = function() {
        // modally block the UI
      };
      navigator.notification.confirm(
        "Sorry. You should still be able to access your favorites, but " +
          "Logging in and access to files or folders requires " +
          "a network connection.",
        onConfirm,
        'Network error',
        'OK'
      );
    },
    onResume: function(event) {
      // ...
    },
    onLoginSuccess: function() {
      spiderOakApp.menuSheetView.render();
      spiderOakApp.storageBarModel = new spiderOakApp.StorageBarModel();
      spiderOakApp.storageBarModel.url =
        spiderOakApp.accountModel.get("storageRootURL");
      var favoritesConfirmationAccepted =
        store.get("favoritesConfirmationAccepted-" +
        spiderOakApp.accountModel.get("b32username")) || false;
      spiderOakApp.accountModel.set("favoritesConfirmationAccepted",
                                    favoritesConfirmationAccepted);
      spiderOakApp.storageBarView = new spiderOakApp.StorageBarView({
        model: spiderOakApp.storageBarModel
      });
      // Instantiate the favorites and populate from localStorage
      var favorites = window.store.get(
        "favorites-" + spiderOakApp.accountModel.get("b32username")
      );
      favorites = favorites || [];
      spiderOakApp.favoritesCollection =
        new spiderOakApp.FavoritesCollection(favorites);

      // Fresh new recents collection
      spiderOakApp.recentsCollection = new spiderOakApp.RecentsCollection();
    },
    onLogoutSuccess: function() {
      if (spiderOakApp.navigator.viewsStack.length > 0) {
        spiderOakApp.navigator.popAll(spiderOakApp.noEffect);
      }
      spiderOakApp.mainView.setTitle("SpiderOak");
      spiderOakApp.favoritesCollection.reset();
      spiderOakApp.recentsCollection.reset();
      if (spiderOakApp.storageBarView) {
        spiderOakApp.storageBarView.empty();
      }
      if (spiderOakApp.shareRoomsCollection) {
        spiderOakApp.shareRoomsCollection.reset();
      }
      if (spiderOakApp.publicShareRoomsCollection) {
        spiderOakApp.publicShareRoomsCollection.reset();
      }
      // And finally, pop up the LoginView
      spiderOakApp.mainView.closeMenu();
      spiderOakApp.loginView.show();
    },
    onBackKeyDown: function(event) {
      event.preventDefault();
      if ($(".modal").is(":visible") ||
          $(".learn-about-spideroak").is(":visible")) {
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
   * prevailing elements that are functions are evaluated, as methods on
   * the object from which they were obtained, for their result.
   *
   * - A head part is taken in this order of precedence:
   *   - the model's .get("urlBase")
   *   - or the model's urlBase attribute
   *   - or the containing collection's .urlBase
   *   - or the containing collection's .url
   * - The url part is taken from the model's .get("url").
   *
   * @this{model}
   # @param {boolen} bare - when set, strip any query string
   */
  Backbone.Model.prototype.composedUrl = function(bare) {
    var urlTail = this.get("url");
    var collection = this.collection;
    var urlHead = this.get("urlBase") || this.urlBase;
    var urlHeadObject = urlHead && this;
    if (! urlHead && collection) {
      urlHead = (collection.get("urlBase") ||
                  collection.urlBase ||
                  collection.url ||
                  "");
      urlHeadObject = urlHead && collection;
    }
    if (typeof urlHead === "function") {
      urlHead = urlHead.call(urlHeadObject);
    }
    if (typeof urlTail === "function") {
      urlTail = urlTail.call(this);
    }
    if (bare) {
      urlHead = urlHead && urlHead.split("?")[0];
      urlTail = urlTail && urlTail.split("?")[0];
    }
    return (urlHead || "") + (urlTail || "");
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
