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

  spiderOakApp.LoginView = Backbone.View.extend({
    el: "#login",
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
      // ...
    },
    pageAnimationEnd_handler: function(event, data) {
      // ...
    }
  });
  spiderOakApp.loginView = new spiderOakApp.LoginView().render();


})(window.spiderOakApp = window.spiderOakApp || {}, window);
