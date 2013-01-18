/**
 * MainView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.MainView = Backbone.View.extend({
    el: "#main",
    events: {
      // ...
    },
    initialize: function() {
      _.bindAll(this);
      this.$el.bind('pageAnimationStart', this.pageAnimationStart_handler);
      this.$el.bind('pageAnimationEnd', this.pageAnimationEnd_handler);
    },
    render: function() {
      return this;
    },
    pageAnimationStart_handler: function(event, data) {
      // console.log("main.pageAnimationStart - " + data.direction);

    },
    pageAnimationEnd_handler: function(event, data) {
      // console.log("main.pageAnimationEnd - " + data.direction);
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
