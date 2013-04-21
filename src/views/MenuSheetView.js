/**
 * MenuSheetView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.MenuSheetView = Backbone.View.extend({
    el: "#menusheet",
    events: {
      "tap .logout": "logout_tapHandler",
      "tap .recents": "recents_tapHandler",
      "tap .favorites": "favorites_tapHandler",
      "tap .sharerooms": "sharerooms_tapHandler"
      // "focus #menu-search": "menuSearch_focusHandler",
      // "keyup #menu-search": "menuSearch_changeHandler",
      // "tap .clear-icon": "clearIcon_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      $(document).on("menuOpening", this.menuOpening);
      $(document).on("menuClosing", this.menuClosing);
    },
    render: function() {
      var inOrOut = {"inorout":
                     spiderOakApp.accountModel.get("isLoggedIn") ?"Out" :"In"};
      this.$el.html(_.template(window.tpl.get("menusheetTemplate"), inOrOut));
      this.$("input[type=search]").attr("disabled",true);
      // Add subviews for menu items
      this.devicesCollection = new spiderOakApp.DevicesCollection();
      this.devicesCollection.url =
        spiderOakApp.accountModel.get("storageRootURL") + "?device_info=yes";
      this.$(".devices").one("complete", function(event) {
        if (spiderOakApp.navigator.viewsStack.length === 0) {
          var $firstDevice = this.$(".devices").find("li a").first();
          var firstDeviceModel = $firstDevice.data("model");
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
            spiderOakApp.dialogView.hide();
          }
        }
        else {
          // Just in case...
          spiderOakApp.dialogView.hide();
        }
      }.bind(this));
      this.devicesListView = new spiderOakApp.DevicesListView({
        collection: this.devicesCollection,
        el: this.$(".devices")
      }).render();

      spiderOakApp.menuScroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });
      this.on("complete", spiderOakApp.menuScroller.refresh, this);

      return this;
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

    menuOpening: function(event) {
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
            this.logoutConfirmed,
            'Sign out'
          );
        }.bind(this),50);
      }
      else {
        this.logoutConfirmed();
      }
    },
    logoutConfirmed: function(button) {
      if (button === 2) return false;
      // Clean up
      if (spiderOakApp.navigator.viewsStack.length > 0) {
        spiderOakApp.navigator.popAll(spiderOakApp.noEffect);
      }
      spiderOakApp.mainView.setTitle("SpiderOak");
      // Log out
      spiderOakApp.accountModel.logout(function() {
        // And finally, pop up the LoginView
        spiderOakApp.mainView.closeMenu();
        spiderOakApp.loginView.show();
      });
      this.undelegateEvents();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
