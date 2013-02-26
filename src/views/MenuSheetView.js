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
    sharerooms_tapHandler: function(event) {
      // Instantiate ShareRoomsConsolidatedView and push it on the view stack.
      if (! this.shareRoomsRoot) {
        this.shareRoomsRootView = new spiderOakApp.ShareRoomsRootView();
      }
      this.shareRoomsRootView.render();
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          this.shareRoomsRootView
        );
        return;
      }
      // XXX Do we to provide a case for the current view being the same as
      // the new one?
      else {
        spiderOakApp.navigator.replaceAll(
          this.shareRoomsRootView
        );
      }
    },

    menuOpening: function(event) {
      spiderOakApp.menuScroller.refresh();
    },
    menuClosing: function(event) {
      // ...
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
