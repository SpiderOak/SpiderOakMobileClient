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
      // "focus #menu-search": "menuSearch_focusHandler",
      // "keyup #menu-search": "menuSearch_changeHandler",
      // "tap .clear-icon": "clearIcon_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      // this.$el.bind("pageAnimationStart", this.pageAnimationStart_handler);
      // this.$el.bind("pageAnimationEnd", this.pageAnimationEnd_handler);
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
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      return this;
    }/*,
    pageAnimationStart_handler: function(event, data) {
      if (data.direction === "out") {
        this.$("input[type=search]").attr("disabled", true);
        this.$("input[type=search]").blur();
      }
    },
    pageAnimationEnd_handler: function(event, data) {
      if (data.direction === "in") {
        window.setTimeout(function(){
          this.$("input[type=search]").removeAttr("disabled");
        },100);
      }
    },
    menuSearch_focusHandler: function(event) {
      // ...
    },
    menuSearch_changeHandler: function(event) {
      if ($(event.target).val().length) {
        this.$(".clear-icon").show();
      }
      else {
        this.$(".clear-icon").hide();
      }
    },
    clearIcon_tapHandler: function(event) {
      $("#menu-search").val("");
      this.$(".clear-icon").hide();
    }*/
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
