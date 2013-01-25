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
      'submit form': 'form_submitHandler',
      'tap .shareRoomsButton': 'shareRoomsButton_tapHandler',
      'tap .loginButton': 'loginButton_tapHandler',
      'tap .switch': 'switch_tapHandler'
    },
    initialize: function() {
      _.bindAll(this);
      this.$el.bind('pageAnimationStart', this.pageAnimationStart_handler);
      this.$el.bind('pageAnimationEnd', this.pageAnimationEnd_handler);
    },
    render: function() {
      // @FIXME: This will actually be set by the users choice...
      if (this.$('.switch').hasClass('on')) {
        this.$('.switch input[type=checkbox]').attr('checked',true);
      }
      return this;
    },
    pageAnimationStart_handler: function(event, data) {
      // ...
    },
    pageAnimationEnd_handler: function(event, data) {
      // ...
    },
    input_focusHandler: function(event) {
      // window.setTimeout(function(){
        this.$('.login-logo').addClass('rotated');
      // },50);
    },
    input_blurHandler: function(event) {
      // window.setTimeout(function(){
        this.$('.login-logo').removeClass('rotated');
      // },50);
    },
    form_submitHandler: function(event) {
      this.$('input').blur();
      // @FIXME: Repace with actual login procedure
      window.jQT.goTo('#main','slidedown');
    },
    loginButton_tapHandler: function(event) {
      this.$('input').blur();
      event.preventDefault();
    },
    shareRoomsButton_tapHandler: function(event) {
      this.$('input').blur();
      event.preventDefault();
    },
    switch_tapHandler: function(event) {
      var $this = $(event.target).hasClass('switch') ? $(event.target) : $(event.target).closest('.switch');
      $this.find('input[type=checkbox]').attr('checked',!$this.find('input[type=checkbox]').attr('checked'));
      $this.toggleClass('on');
    }
  });
  spiderOakApp.loginView = new spiderOakApp.LoginView().render();


})(window.spiderOakApp = window.spiderOakApp || {}, window);
