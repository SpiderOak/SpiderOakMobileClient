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
      s           = window.s,
      store       = window.store;
  $.ajaxSettings = _.extend($.ajaxSettings, {
    timeout: 180000, // two minutes
    // timeout: 3000, // three seconds
    error: function(collection, response, options) {
      console.log("Default error handler thrown:");
      // might leave us in a strange state, but better then an endless hang...
      spiderOakApp.dialogView.hide();
      console.log(JSON.stringify(response.statusText));
      spiderOakApp.dialogView.showNotifyErrorResponse(response);
    }
  });

  // Fix for lack of detach in Zepto...
  $.fn.detach = $.fn.remove;

  // Considering changing the template settings as the ERB defaults are annoying
  // _.templateSettings = {
  //   evaluate:    /\{\{#([\s\S]+?)=\}\}/g,      // {{# console.log("blah") }}
  //   interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g, // {{ title }}
  //   escape:      /\{\{\{([\s\S]+?)\}\}\}/g     // {{{ title }}}
  // };

  _.extend(spiderOakApp, {
    config: window.spiderOakMobile_config,     // Supplemented in initialize.
    ready: function() {
      // Start listening for important app-level events
      document.addEventListener("deviceready", this.onDeviceReady, false);
      document.addEventListener("loginSuccess", this.onLoginSuccess, false);
      document.addEventListener("logoutSuccess", this.onLogoutSuccess, false);
      document.addEventListener("resume", this.onResume, false);
      document.addEventListener("offline", this.setOffline, false);
      document.addEventListener("online", this.setOnline, false);
    },
    initialize: function() {
      _.extend(this.config, window.spiderOakMobile_custom_config);

      // Substitute our ajax wrapper for backbone's internal .ajax() calls:
      Backbone.ajax = this.ajax;
      if (! this.dollarAjax) {
        this.dollarAjax = $.ajax;
      }
      $.ajax = this.ajax;

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
      // trailing slash of weirdness
      var favorites = window.store.get("favorites-");
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
      // Don't use spiderOakApp.ajax for this, it's just to get some .xml:
      this.dollarAjax({
        url: "./config.xml",
        dataType: "xml",
        success: function(config){
          this.version = $(config).find("widget").attr("version") || "";
        }.bind(this)
      });

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

      // Dragging open the menu
      var touch = {};
      var pxMultiplier = 1;
      var threshold = 80;
      $(document).on("touchstart", "#nav", function(event){
        touch.x1 = event.touches[0].pageX;
        touch.y1 = event.touches[0].pageY;
      });
      $(document).on("touchmove", "#nav", function(event) {
        window.inAction = true;
        if (event.touches.length == 1 ) {
          touch.dx = event.touches[0].pageX - touch.x1; // right, left
          // touch.dy = event.touches[0].pageY - touch.y1; // up, down

          var d = touch.dx * pxMultiplier;
          var pos;
          if (!$("#main").hasClass("open") && touch.dx > 0) {
            pos = (d < 270) ? d : 270;
            $("#main")
              .css({ '-webkit-transform':'translate3d(' + pos + 'px,0,0)' });
          }
          else if ($("#main").hasClass("open") && touch.dx < 0) {
            if ($("#main").hasClass("open")) {
              pos = ((270 - Math.abs(d)) > 0) ? (270 - Math.abs(d)) : 0;
              $("#main")
                .css({ '-webkit-transform':'translate3d(' + pos + 'px,0,0)' });
            }
          }
        }
      });
      $(document).on("touchend touchcancel", "#nav", function(event) {
        if (window.inAction) {
          var d = touch.dx * pxMultiplier;
          if (touch.dx > 0 && !$("#main").hasClass("open")) {
            if (touch.dx > threshold) {
              spiderOakApp.mainView.openMenu();
            }
            else {
              spiderOakApp.mainView.closeMenu();
            }
          }
          else if (touch.dx < 0 && $("#main").hasClass("open")) {
            if (Math.abs(d) > threshold) {
              spiderOakApp.mainView.closeMenu();
            }
            else {
              spiderOakApp.mainView.openMenu();
            }
          }
          touch.dx = 0;
          window.inAction = false;
        }
      });

      // If rememberedAccount is set, reconstitute account from serialized
      // state:
      // 1. check remember me state, if on...
      // 2. spiderOakApp.dialogView.showWait();
      // 3. spiderOakApp.loginView.dismiss();
      // 4. <get the user data from AccountManager plugin>
      // 5. spiderOakApp.accountModel =
      //        new spiderOakApp.AccountModel(<serialised AccountModel>);
      // 6. spiderOakApp.accountModel
      //        .basicAuthManager.setAccountBasicAuth(<username>, <password>);
      // 7. spiderOakApp.onLoginSuccess();
      var rememberedAccount =
        spiderOakApp.settings.getOrDefault("rememberedAccount");
      if (rememberedAccount) {
        var rememberedAccountModel = JSON.parse(rememberedAccount);
        var credentials = atob(rememberedAccountModel
          .basicAuthCredentials.split(" ")[1]).split(":");
        spiderOakApp.dialogView.showWait();
        spiderOakApp.accountModel =
          new spiderOakApp.AccountModel(rememberedAccountModel);
        spiderOakApp.accountModel.basicAuthManager
          .setAccountBasicAuth(credentials[0], credentials[1]);
        spiderOakApp.onLoginSuccess();
        spiderOakApp.loginView.dismiss();
        $(".splash").hide();
        spiderOakApp.dialogView.hide();
        return;
      }
      $(".learn-more").html("Learn more about " + s("SpiderOak") + " &raquo;");
      $(".splash").hide();

      if (!window.store.get("favoritesMigrationHasRun") && $.os.android) {
        spiderOakApp.migrateFavorites();
      }

    },
    backDisabled: true,
    onDeviceReady: function() {
      window.spiderOakApp.initialize();
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
      if (!this.networkAvailable) {
        if (spiderOakApp.menuSheetView) {
          spiderOakApp.menuSheetView.render(true);
        }
      }
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
      spiderOakApp.dialogView.hide(); // In case one is up, say login..
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
      spiderOakApp.dialogView.hide();
    },
    onLogoutSuccess: function() {
      if (spiderOakApp.navigator.viewsStack.length > 0) {
        spiderOakApp.navigator.popAll(spiderOakApp.noEffect);
      }
      spiderOakApp.mainView.setTitle(s("SpiderOak"));
      // Instantiate the favorites and populate from localStorage
      // trailing slash of weirdness
      var favorites = window.store.get("favorites-");
      favorites = favorites || [];
      spiderOakApp.favoritesCollection.reset(favorites);

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
                                   }),
    /** spiderOakApp.ajax() consolidates basicauth and alternate ajax functions.
     *
     * We include the 'Basic' 'Authorization' options header if we find a
     * credentials in (in order of precedence):
     *
     * 1. The options parameter, in the form of a 'credentials' attribute
     *    having a value of an object with 'username' and 'password' fields, or
     * 2. accountModel.basicAuthManager.getAccountBasicAuth() having a 
     *
     * #param {object} options like $.ajax(options)
     */
    ajax: function (options) {
      var authString =
            spiderOakApp.accountModel.basicAuthManager.getCurrentBasicAuth();
      if (authString) {
        options = window.makeBasicOptionsHeader(options, authString);
      }
      // Make this usable even when settings are not yet established.
      var ajaxFunction = ((spiderOakApp &&
                           spiderOakApp.settings &&
                           spiderOakApp.settings.getOrDefault("alternateAjax",
                                                              null)) ||
                          // In case this is called before this.initialize()
                          ((spiderOakApp && spiderOakApp.dollarAjax) ||
                           $.ajax));
      return ajaxFunction(options);
    }
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
    var result = (urlHead || "") + (urlTail || "");
    return result;
  };

  if (! window.cordova || window.cordova.cordovaAbsent) {
    /* Polyfill for file downloader functionality. */
    // This enables, eg, creating favorites.  You still can't view files...
    // We can't do this in cordova polyfills, because it depends on
    // spiderOakApp object existing.
    if (! window.LocalFileSystem) {
      window.LocalFileSystem = {TEMPORARY: 0,
                                PERSISTENT: 1};
    }
    if (! window.requestFileSystem) {
      window.requestFileSystem = function (options, something,
                                           gotFS, notGotFS) {
        // Call the gotFS(filesystem) success callback
        return gotFS({
          // ... on a pseudo-filesystem object with a 'root' element:
          root: {
            // ... with a 'getFile' method:
            getFile: function (path, options, gotFile, notGotFile) {
              // ... that applies a gotFile success callback:
              return gotFile({
                // ... to a pseudo-fileEntry object with a 'remove' method:
                remove: function (removed, notRemoved) {
                  // ... that calls its' removed callback:
                  return removed();
                }
              });
            }}
        });
      };
    }
    if (! window.FileTransfer) {
      spiderOakApp.downloader.downloadFile = function (downloadOptions,
                                                       successCallback,
                                                       errorCallback) {
        console.log("fake downloadFile");
        spiderOakApp.dialogView.showWait({
          title: "Debugging mode: Contents not dowloaded"
        });
        var dummyFileEntry = {fullPath: "/sdcard" + downloadOptions.to,
                              name: downloadOptions.fileName};
        return successCallback(dummyFileEntry);
      };
    }
  }

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
