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
      if (! this.shareRoomsCollection) {
        this.shareRoomsCollection = new spiderOakApp.ShareRoomsCollection();
        this.shareRoomsListView = new spiderOakApp.ShareRoomsListView({
          collection: this.shareRoomsCollection
        }).render();
      }
      else {
        this.shareRoomsListView.render();
      }
      this.shareRoomsListModel = this.shareRoomsListView.model;
      spiderOakApp.mainView.closeMenu(event);
      var options = {
        id: this.shareRoomsListViewModel.cid,
        model: this.shareRoomsListViewModel
      };
      $("#menusheet ul li").removeClass("current");
      event.element.addClass("current");
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.FolderView,
          options,
          spiderOakApp.noEffect
        );
        return;
      }
      else if (_.last(spiderOakApp.navigator.viewsStack)
                .instance.model.cid === this.model.cid) {
        return;
      }
      spiderOakApp.navigator.replaceAll(
        spiderOakApp.FolderView,
        options,
        spiderOakApp.noEffect
      );
    },

    menuOpening: function(event) {
      spiderOakApp.menuScroller.refresh();
    },
    menuClosing: function(event) {
      // ...
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
