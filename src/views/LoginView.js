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
      'focus input': 'input_focusHandler',
      'blur input': 'input_blurHandler',
      'submit form': 'form_submitHandler'
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
    },
    input_focusHandler: function(event) {
      this.$('.login-logo').addClass('rotated');
    },
    input_blurHandler: function(event) {
      this.$('.login-logo').removeClass('rotated');
    },
    form_submitHandler: function(event) {
      this.$('input').blur();
      // @FIXME: Repace with actual login procedure
      window.jQT.goTo('#main','slidedown');
    }
  });
  spiderOakApp.loginView = new spiderOakApp.LoginView().render();


})(window.spiderOakApp = window.spiderOakApp || {}, window);
