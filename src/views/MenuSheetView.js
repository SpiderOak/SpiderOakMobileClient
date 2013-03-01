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
      "tap .logout": "logout_tapHandler"
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
      this.$("input[type=search]").attr("disabled",true);
      // Add subviews for menu items
      this.devicesCollection = new spiderOakApp.DevicesCollection();
      this.devicesCollection.url = spiderOakApp.accountModel.getStorageURL();
      this.devicesListView = new spiderOakApp.DevicesListView({
        collection: this.devicesCollection,
        el: this.$(".devices")
      }).render();
      spiderOakApp.menuScroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      return this;
    },
    menuOpening: function(event) {
      spiderOakApp.menuScroller.refresh();
    },
    menuClosing: function(event) {
      // ...
    },
    logout_tapHandler: function(event) {
      window.setTimeout(function(){
        navigator.notification.confirm(
          'Are you sure you want to sign out?.',
          this.logoutConfirmed,
          'Sign out'
        );
      }.bind(this),50);
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
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
