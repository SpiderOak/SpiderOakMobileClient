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
      qq          = window.qq,
      Promise     = window.Promise,
      store       = window.store;
  $.ajaxSettings = _.extend($.ajaxSettings, {
    timeout: 300000, // five minutes
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

  _.extend(spiderOakApp, {
    config: window.spiderOakMobile_config,     // Supplemented in initialize.
    ready: function() {
      var soApp = window.spiderOakApp,
          readyFinish = new Promise(function (resolve, reject) {
            // Resolve with explicit value for tests and debugging clarity.
            soApp.readyFinishResolver = function() {resolve("readyFinish");};
          }),
          localizeFinish = new Promise(function (resolve, reject) {
            soApp.localizeFinishResolver = function() {resolve("localized");};
          });
      soApp.allFinish = Promise.all([readyFinish, localizeFinish]);
      // Invoke .finishDeviceReady() via an intermediate function, so
      // stubbing of .finishDeviceReady() in tests can be effective:
      soApp.allFinish.then(function () {soApp.finishDeviceReady();});
      window.localizer.prepareHtml10n(soApp.localizeFinishResolver);
      // Start listening for important app-level events
      document.addEventListener("deviceready", this.onDeviceReady, false);
      document.addEventListener("versionready", this.onVersionReady, false);
      document.addEventListener("loginSuccess", this.onLoginSuccess, false);
      document.addEventListener("logoutSuccess", this.onLogoutSuccess, false);
      document.addEventListener("loginStartChange",
                                this.onLoginStartChange, false);
      document.addEventListener("loginConcludeChange",
                                this.onLoginConcludeChange, false);
      document.addEventListener("resume", this.onResume, false);
      document.addEventListener("pause", this.onPause, false);
      document.addEventListener("resign", this.onResign, false);
      document.addEventListener("offline", this.setOffline, false);
      document.addEventListener("online", this.setOnline, false);
    },
    initialize: function() {
      var _this = this;
      _.extend(this.config, window.spiderOakMobile_custom_config);

      // Substitute our ajax wrapper for backbone's internal .ajax() calls:

      Backbone.ajax = this.ajax;

      if (! this.dollarAjax) {
        this.dollarAjax = $.ajax;
      }

      if (! this.cordovaHTTPAjax && window.cordovaHTTP) {
        /** Adapt regular ajax call and response to cordovaHTTP. */
        window.console.log('certificate pinning enabled');
        _this.cordovaHTTPAjax = function cordovaHTTPAjax(options) {
          var url = options.url || null,
              headers = options.headers || {},
              type = options.type || 'GET',
              dataType = options.dataType || 'json',
              timeout = options.timeout || 0,
              data = options.data || {},
              success = options.success || function(){},
              error = options.error || function(){};

          if (!url) options.error(null, 'fail', 'No URL provided');
          // window.console.log('using cordovaHTTPAjax');

          var win = function win(response) {
            // Special provision for SpiderOak's broken Web API response:
            //   'login:' for the login dance,
            //   'location:' also for the login dance, and
            //   '/' for sharing links
            if (/^login:|^location:|^\//.test(response.data)) {
              options.success(response.data, response.status, null);
            } else {
              options.success(JSON.parse(response.data),
                                response.status,
                                null);
            }
          };

          var fail = function(response) {
            window.console.log(response);
            options.error(response, response.status, response.error);
          };

          window.cordovaHTTP[options.type.toLowerCase()](url, data, headers,
                                                         win, fail);
        };
      }

      $.ajax = this.ajax;

      // Stub out iScroll where -webkit-overflow-scrolling:touch is supported
      // Android 4.4 doesn't have -webkit-overflow-scrolling:touch, but *does*
      // have css scrolling
      if (window.Modernizr.overflowscrolling ||
          (window.device && (window.device.platform === "Android") &&
            (parseFloat(window.device.version) >= 4.4))) {
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

      window.iconType = (window.Modernizr.svg) ? "svg" : "png";

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

      // If showPreliminary is flagged false at the config level, then hide
      // the cancel button
      if (spiderOakApp.settings.getOrDefault("showPreliminary") === false) {
        $(".login .cancel-btn").hide();
        spiderOakApp.loginView.$(".learn-more").show();
        spiderOakApp.loginView.$(".advanced-login-settings").show();
      }
      // Determine if we should be showing the preliminary screen at all
      spiderOakApp.showPreliminary = false;
      if (spiderOakApp.settings.getOrDefault("showPreliminary")) {
        spiderOakApp.showPreliminary = true;
        if (window.store.get("showPreliminary") !== undefined) {
          spiderOakApp.showPreliminary = !!window.store.get("showPreliminary");
        }
      }

      // Until this.version gets proper setting from config.xml - if it does:
      this.version = "0.0.1";
      // Don't use spiderOakApp.ajax for this, it's just to get some .xml:
      this.dollarAjax({
        url: "./config.xml",
        dataType: "xml",
        success: function(config){
          var version = $(config).find("widget").attr("version") || "";
          // config.xml is bogus findable during testing:
          if (version) {
            this.version = version;
          }
          $(document).trigger("versionready");
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
      $(document).on("touchstart", "#main", function(event){
        // event.preventDefault();
        touch.x1 = event.touches[0].pageX;
        touch.y1 = event.touches[0].pageY;
      });
      $(document).on("touchmove", "#main", function(event) {
        touch.dx = event.touches[0].pageX - touch.x1; // right, left
        touch.dy = event.touches[0].pageY - touch.y1; // up, down
        if (!$("#main").hasClass("open") &&
            !window.isScrolling &&
            !window.inAction &&
            touch.dy !== 0) {
          window.isScrolling = true;
        }
        if (window.isScrolling) {
          return;
        }
        event.preventDefault();
        window.inAction = true;
        if (event.touches.length == 1 ) {
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
      $(document).on("touchend touchcancel", "#main", function(event) {
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
        if (window.isScrolling) window.isScrolling = false;
      });

      spiderOakApp.checkAlternateServerAllowed();

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
        var passcode = spiderOakApp.accountModel.getPasscode();
        if (passcode) {
          if (! spiderOakApp.accountModel.getLoginState()) {
            // This shouldn't happen:
            console.log("Unexpected application state: passcode " +
                        "set without active login - removing it.");
          }
          else {
            this.passcodeAuthEntryView =
              new spiderOakApp.SettingsPasscodeAuthView();
            $(".app").append(this.passcodeAuthEntryView.el);
            this.passcodeAuthEntryView.render().show();
          }
        }
        spiderOakApp.loginView.dismiss();
        spiderOakApp.mainView.setTitle(s("SpiderOak"));
        $(".splash").hide();
        spiderOakApp.dialogView.hide();
      }
      spiderOakApp.mainView.setTitle(s("SpiderOak"));

      // Show preliminary view, if relevant
      if (spiderOakApp.showPreliminary) {
        window.store.set("showPreliminary", true); // set till explicity dismissed
        spiderOakApp.preliminaryView = new spiderOakApp.PreliminaryView();
        $(".app").append(spiderOakApp.preliminaryView.$el);
        spiderOakApp.preliminaryView.render();
        spiderOakApp.preliminaryView.$el.css({"-webkit-transform":"translate3d(0,0,0)"});
      }
      $(".splash").hide();
      spiderOakApp.loginView.$(".learn-more").html(
        qq("Learn more about [[SpiderOak]] &raquo;",
           {SpiderOak: s("SpiderOak")})
      );
      spiderOakApp.loginView.$(".advanced-login-settings").html(
        qq("Advanced login settings &raquo;")
      );
    },
    backDisabled: true,
    finishDeviceReady: function() {
      window.spiderOakApp.brandSpecificInitialization();
      window.spiderOakApp.initialize();
      spiderOakApp.fileViewer = window.FileViewerPlugin;
    },
    onDeviceReady: function() {
      $(document).on("backbutton", spiderOakApp.onBackKeyDown);
      $(document).on("menubutton", spiderOakApp.onMenuKeyDown);
      if ($.os.ios && parseFloat(window.device.version) >= 7.0) {
        $(".app").css({"top":"20px"}); // status bar hax
      }
      if (window.cordovaHTTP) {
        window.cordovaHTTP.enableSSLPinning(true, function() {
          //window.spiderOakApp.finishDeviceReady();
          window.spiderOakApp.readyFinishResolver();
        }, function() {
          console.log('Error. Enabling cert pinning failed');
        });
      } else {
        //window.spiderOakApp.finishDeviceReady();
        window.spiderOakApp.readyFinishResolver();
      }
    },
    onVersionReady: function () {
      var storedVersion = window.store.get("dataVersion") || "0.0.0",
          semver = window.semver;

      if (semver.gt(spiderOakApp.version, storedVersion)) {
        // Include data migrations that need to happen on version increments.

        //console.log("onVersionReady: current version greater than stored");
        if (!window.store.get("favoritesMigrationHasRun") && $.os.android) {
          spiderOakApp.migrateFavorites();
        }
      }
      else {
        //console.log("onVersionReady: data version already current.");
      }

      window.store.set("dataVersion", spiderOakApp.version);
      spiderOakApp.checkConfigsLoaded();
    },
    checkConfigsLoaded: function () {
      var configLoaded = typeof window.spiderOakMobile_config == "object",
          customConfigLoaded = (typeof window.spiderOakMobile_custom_config ==
                                "object"),
          msg = "";
      if (! (configLoaded && customConfigLoaded)) {
        if (! configLoaded) {
          msg += " standard config";
        }
        if (! customConfigLoaded) {
          if (msg !== "") {
            msg += " AND";
          }
          msg = "Developer: Failed to load" + msg + " custom config";
        }
        console.log(msg);
        if (spiderOakApp.version.split("-").length > 2) {
          // Developer version - be noisy!
          navigator.notification.alert(msg);
        }
      }
    },
    checkAlternateServerAllowed: function() {
      var settings = spiderOakApp.settings,
          inhibitAdvanced = settings.getValue("inhibitAdvancedLogin"),
          server = settings.getValue("server"),
          standardServer = settings.getValue("standardServer");
      if (inhibitAdvanced && (server !== standardServer)) {
        navigator.notification.confirm(
          qq("Advanced login has moved to the '[[SpiderOak_Blue]]' app, and we must switch this app from the alternate, [[server]], to the standard server, [[standardServer]]. To continue using this functionality, please download the '[[SpiderOak_Blue]]' app. This dialog will appear at app start until you authorize the change.",
             {server: server, standardServer: standardServer}),
          function (choice) {
            if (choice === 1) {
              spiderOakApp.settings.get("server").set("value", standardServer);
              spiderOakApp.dialogView.showToast({
                title: qq("Server changed to [[standardServer]]",
                          {standardServer: standardServer}),
                duration: 2000
              });
            }
            else {
              spiderOakApp.dialogView.showToast({
                title: qq("Alternate server retained"),
                duration: 2000
              });
            }
          },
          qq("Non-standard server"),
          [qq("OK, switch now"), qq("No, maybe later")]
        );
      }
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
      if (!this.networkAvailable || window.spiderOakApp.inOfflineConfirm) {
        return;
      }
      this.networkAvailable = false;
      var onConfirm = function() {
        window.spiderOakApp.inOfflineConfirm = false;
      };
      window.spiderOakApp.inOfflineConfirm = true;
      navigator.notification.confirm(
        qq("Sorry. You should still be able to access your favorites, but logging in and access to files or folders requires a network connection."),
        onConfirm,
        qq("Network error"),
        qq("OK")
      );
      spiderOakApp.dialogView.hide(); // In case one is up, say login..
    },
    onPause: function(event) {
      spiderOakApp.lastPaused = Date.now();
      if ($(".modal").is(":visible")) {
        // cancel pending doesnloads, etc
        window.cordova.fireDocumentEvent("backbutton");
      }
    },
    onResume: function(event) {
      // This isn't quick enough on iOS as it saves a shot of what was on the
      //    screen when pausing and uses that as a splash screen of sorts.
      //    We might need to use the splash screen plugin...
      var passcode = spiderOakApp.accountModel.getPasscode();
      if (passcode && ! spiderOakApp.accountModel.getLoginState()) {
        console.log("Unexpected application state: passcode " +
                    "set without active login.");
        return;
      }

      var passcodeTimeout = spiderOakApp.accountModel.getPasscodeTimeout();
      var timeoutInMinutes =
        Math.floor(((Date.now() - spiderOakApp.lastPaused) / 1000) / 60);
      if (passcode && (timeoutInMinutes >= passcodeTimeout)) {
        spiderOakApp.fileViewer.hide();
        this.passcodeAuthEntryView =
          new spiderOakApp.SettingsPasscodeAuthView();
        $(".app").append(this.passcodeAuthEntryView.el);
        this.passcodeAuthEntryView.render().show();
      }
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

      // THIS IS A MIGRATION FOR PRE-3.0.0 FAVOURITES
      var processed = false;
      _.forEach(spiderOakApp.favoritesCollection.models, function(model) {
        if (model.get("faveVersion")) {
          return;
        }
        var hiveRegex = new RegExp(
          spiderOakApp.accountModel.get("b32username") +
            "\/.*\/SpiderOak(\\s|%20)Hive"
        );
        var newUrl = model.get("url").replace(
          hiveRegex,spiderOakApp.accountModel.get("b32username")+"\/s"
        );
        model.set("url", newUrl);
        model.set("faveVersion", spiderOakApp.version);
        model.set(
          "icon",
          window.fileHelper.fileTypeFromExtension(model.get("url")).icon
        );
        processed = true;
      });
      if (processed) {
        spiderOakApp.favoritesCollection.store();
      }

      // Fresh new recents collection
      spiderOakApp.recentsCollection = new spiderOakApp.RecentsCollection();
      spiderOakApp.dialogView.hide();
    },
    onLogoutSuccess: function() {
      if (spiderOakApp.navigator.viewsStack.length > 0) {
        spiderOakApp.navigator.popAll(spiderOakApp.noEffect);
        spiderOakApp.mainView.showBackButton(false);
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
      if (spiderOakApp.accountModel.getLoginState() === "in-process") {
        spiderOakApp.accountModel.interruptLogin();
        return;
      }
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
        spiderOakApp.navigator.popView(spiderOakApp.defaultPopEffect);
        return;
      }
      // navigator.app.exitApp();
      var bindCallback = function(event) {
        navigator.app.exitApp();
      };
      spiderOakApp.dialogView.showToast({
        title: qq("Hit back again to exit"),
        onShow: function() {
          $(document).on("backbutton", bindCallback);
        },
        onHide: function() {
          $(document).off("backbutton", bindCallback);
        }
      });
    },
    onMenuKeyDown: function(event) {
      // The menu button is flakey in some versions of Android
      // and deprecated as of Android 3.0
      if (window.Modernizr.overflowscrolling ||
          (window.device && (window.device.platform === "Android") &&
            (parseFloat(window.device.version) >= 3.0))) {
        return;
      }
      if ($("#main").hasClass("open")) {
        spiderOakApp.mainView.closeMenu();
      } else {
        spiderOakApp.mainView.openMenu();
      }
    },
    downloader: new window.FileDownloadHelper(),
    navigator: new window.BackStack.StackNavigator({el:'#subviews'}),
    noEffect: new window.BackStack.NoEffect(),
    fadeEffect: new window.BackStack.FadeEffect(),
    defaultEffect: (($.os.android) ?
                    new window.BackStack.NoEffect() :
                    new spiderOakApp.FastSlideEffect()),
    defaultPopEffect: (($.os.android) ?
                       new window.BackStack.NoEffect() :
                       new spiderOakApp.FastSlideEffect({direction:'right'})),
    b32nibbler: new window.Nibbler({dataBits: 8,
                                    codeBits: 5,
                                    keyString:
                                      "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
                                    pad: ""
                                   }),
    /** spiderOakApp.ajax() select ajax handler and includes basicauth.
     *
     * We use an ajax handler in this order of precedence:
     *
     * 1. Prefer "alternateAjax" function designated in settings, if any.
     * 2. Otherwise, use cordovaHTTPAjax - it depends on the cordovaHTTP
     *    plugin.
     * 3. Otherwise, use $.ajax.
     * 4. There is no 4.
     *
     * We include the 'Basic' 'Authorization' options header if we find
     * credentials in (in order of precedence):
     *
     * 1. The options parameter, in the form of a 'credentials' attribute
     *    having a value of an object with 'username' and 'password' fields, or
     * 2. accountModel.basicAuthManager.getAccountBasicAuth() having a
     *
     * @param {object} options like $.ajax(options)
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
                          ((spiderOakApp && spiderOakApp.cordovaHTTPAjax) ||
                           (spiderOakApp && spiderOakApp.dollarAjax) ||
                           $.ajax));
      return ajaxFunction(options);
    }
  });

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
        var dummyFileEntry = {fullPath: "/sdcard" + downloadOptions.to,
                              name: downloadOptions.fileName,
                              toURL: function() {
                                return downloadOptions.from; }
                             };
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
