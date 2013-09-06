/**
 * MenuSheetView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.MenuSheetView = Backbone.View.extend({
    el: "#menusheet",
    events: {
      "tap .logout": "logout_tapHandler",
      "tap .recents": "recents_tapHandler",
      "tap .favorites": "favorites_tapHandler",
      "tap .sharerooms": "sharerooms_tapHandler",
      "tap .settings": "settings_tapHandler",
      "tap .about": "about_tapHandler"
      // "focus #menu-search": "menuSearch_focusHandler",
      // "keyup #menu-search": "menuSearch_changeHandler",
      // "tap .clear-icon": "clearIcon_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
      $(document).on("menuOpening", this.menuOpening);
      $(document).on("menuClosing", this.menuClosing);
      $(document).on("logoutSuccess", this.render);
      $(document).on("offline", this.offline);
      $(document).on("online", this.online);
    },
    render: function(refresh) {
      var inOrOut = {"inorout":
                     spiderOakApp.accountModel.get("isLoggedIn") ?"Out" :"In"};
      this.$el.html(window.tmpl["menusheetTemplate"](inOrOut));
      this.$("input[type=search]").attr("disabled",true);
      // Add subviews for menu items
      if (spiderOakApp.accountModel.get("isLoggedIn")) {
        // Hive
        this.hiveModel = new spiderOakApp.HiveModel();
        this.hiveModel.url =
          spiderOakApp.accountModel.get("storageRootURL");
        this.$(".hive").one("complete", function(event) {
          if (this.hiveModel.attributes.device) {
            this.$(".hive-sep").show();
          }
          this.hiveReady(event, refresh);
        }.bind(this));
        this.hiveView = new spiderOakApp.HiveView({
          model: this.hiveModel,
          el: this.$(".hive")
        });
        // Devices
        this.devicesCollection = new spiderOakApp.DevicesCollection();
        this.devicesCollection.url =
          spiderOakApp.accountModel.get("storageRootURL") + "?device_info=yes";
        this.$(".devices").one("complete", function(event) {
          if (this.devicesCollection.length) {
            this.$(".devices-sep").show();
          }
          this.devicesReady(event, refresh);
        }.bind(this));
        this.devicesListView = new spiderOakApp.DevicesListView({
          collection: this.devicesCollection,
          el: this.$(".devices")
        }).render();
      }

      spiderOakApp.menuScroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });
      this.on("complete", spiderOakApp.menuScroller.refresh, this);

      return this;
    },
    devicesReady: function(event, refresh) {
      this.devicesAreComplete = true;
      $(".devices-sep").show();
      if (this.hiveIsComplete &&
          spiderOakApp.navigator.viewsStack.length === 0) {
        if (!refresh) this.pushFirstDevice();
      }
    },
    hiveReady: function(event, refresh) {
      this.hiveIsComplete = true;
      if (this.hiveModel.get("hasHive")) {
        // Push the hive
        $(".hive-sep").show();
        $(".hive").show();
        var $hiveRef = this.$(".hive").find("li a").first();
        $("#menusheet ul li").removeClass("current");
        $hiveRef.closest("li").addClass("current");
        var options = {
          id: this.hiveModel.cid,
          title: s("SpiderOak Hive"),
          model: this.hiveModel
        };
        if (!refresh) {
          if (spiderOakApp.navigator.viewsStack.length === 0) {
            spiderOakApp.navigator.pushView(
              spiderOakApp.FolderView,
              options,
              spiderOakApp.noEffect);
          }
          else {
            spiderOakApp.navigator.replaceAll(
              spiderOakApp.FolderView,
              options,
              spiderOakApp.noEffect);
          }
        }
      }
      else if(this.devicesAreComplete) {
        if (!refresh) this.pushFirstDevice();
        $(".hive-sep").hide();
        $(".hive").hide();
      }
      else {
        $(".hive-sep").hide();
        $(".hive").hide();
      }
    },
    pushFirstDevice: function() {
      var $firstDevice = this.$(".devices").find("li a").first();
      var firstDeviceModel = _.first(this.devicesCollection.models);
      if (firstDeviceModel) {
        var options = {
          id: firstDeviceModel.cid,
          title: firstDeviceModel.get("name"),
          model: firstDeviceModel
        };
        $("#menusheet ul li").removeClass("current");
        $firstDevice.closest("li").addClass("current");
        spiderOakApp.navigator.pushView(
          spiderOakApp.FolderView,
          options,
          spiderOakApp.noEffect
        );
      }
    },
    sharerooms_tapHandler: function(event) {
      spiderOakApp.mainView.closeMenu(event);
      spiderOakApp.mainView.setTitle("ShareRooms");
      $("#menusheet ul li").removeClass("current");
      $(".sharerooms").closest("li").addClass("current");
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.ShareRoomsRootView,
          {},
          spiderOakApp.noEffect
        );
        return;
      }
      else {
        spiderOakApp.navigator.replaceAll(
          spiderOakApp.ShareRoomsRootView,
          {},
          spiderOakApp.noEffect
        );
      }
    },
    settings_tapHandler: function(event) {
      spiderOakApp.mainView.closeMenu(event);
      spiderOakApp.mainView.setTitle("Settings");
      $("#menusheet ul li").removeClass("current");
      $(".settings").closest("li").addClass("current");
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.SettingsView,
          {},
          spiderOakApp.noEffect
        );
        return;
      }
      else {
        spiderOakApp.navigator.replaceAll(
          spiderOakApp.SettingsView,
          {},
          spiderOakApp.noEffect
        );
      }
    },
    about_tapHandler: function(event) {
      spiderOakApp.mainView.closeMenu(event);
      spiderOakApp.mainView.setTitle("About " + s("SpiderOak"));
      $("#menusheet ul li").removeClass("current");
      $(".about").closest("li").addClass("current");
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.SettingsAboutView,
          {},
          spiderOakApp.noEffect
        );
        return;
      }
      else {
        spiderOakApp.navigator.replaceAll(
          spiderOakApp.SettingsAboutView,
          {},
          spiderOakApp.noEffect
        );
      }
    },
    menuOpening: function(event) {
      // @FIXME: Rectify whatever logout or other activity is causing loss
      //         of the event bindings, and remove this.
      spiderOakApp.menuScroller.refresh();
    },
    menuClosing: function(event) {
      // ...
    },
    recents_tapHandler: function(event) {
      spiderOakApp.mainView.closeMenu(event);
      $("#menusheet ul li").removeClass("current");
      $(".recents").closest("li").addClass("current");
      spiderOakApp.mainView.setTitle("Recents");
      spiderOakApp.mainView.showBackButton(false);
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.RecentsView,
          {},
          spiderOakApp.noEffect
        );
        return;
      }
      else {
        spiderOakApp.navigator.replaceAll(
          spiderOakApp.RecentsView,
          {},
          spiderOakApp.noEffect
        );
      }
    },
    favorites_tapHandler: function(event) {
      spiderOakApp.mainView.closeMenu(event);
      $("#menusheet ul li").removeClass("current");
      $(".favorites").closest("li").addClass("current");
      spiderOakApp.mainView.setTitle("Favorites");
      spiderOakApp.mainView.showBackButton(false);
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.FavoritesView,
          {},
          spiderOakApp.noEffect
        );
        return;
      }
      else {
        spiderOakApp.navigator.replaceAll(
          spiderOakApp.FavoritesView,
          {},
          spiderOakApp.noEffect
        );
      }
    },
    logout_tapHandler: function(event) {
      if (spiderOakApp.accountModel.get("isLoggedIn")) {
        window.setTimeout(function(){
          navigator.notification.confirm(
            'Are you sure you want to sign out?',
            function (button) {
              if (button !== 1) {
                return;
              }
              spiderOakApp.accountModel.logout();
            }.bind(spiderOakApp),
            'Sign out'
          );
        }.bind(this),50);
      }
      else {
        $(document).trigger("logoutSuccess");
      }
    },
    offline: function() {
      this.$(".hive").hide();
      this.$(".hive-sep").hide();
      this.$(".devices").hide();
      this.$(".sharerooms").closest("li").hide();
      this.$(".devices-sep").hide();
    },
    online: function() {
      this.$(".hive").show();
      this.$(".devices").show();
      this.$(".sharerooms").closest("li").show();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
