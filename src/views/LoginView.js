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
      "focus input": "input_focusHandler",
      "blur input": "input_blurHandler",
      "submit form": "form_submitHandler",
      "tap .shareRoomsButton": "shareRoomsButton_tapHandler",
      "tap .loginButton": "loginButton_tapHandler",
      "tap .switch": "switch_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      this.$el.bind("pageAnimationStart", this.pageAnimationStart_handler);
      this.$el.bind("pageAnimationEnd", this.pageAnimationEnd_handler);
    },
    render: function() {
      // @FIXME: This will actually be set by the users choice...
      if (this.$(".switch").hasClass("on")) {
        this.$(".switch input[type=checkbox]").attr("checked",true);
      }
      return this;
    },
    pageAnimationStart_handler: function(event, data) {
      // Assume that if this view is being displayed it is due to
      //  logging out or needing reauthentication
      if (data.direction === "in") {
        // Clear inputs
        $("#username").val("");
        $("#password").val("");
        spiderOakApp.accountModel.logout(function() {
          spiderOakApp.accountModel = undefined;
        });
      }
    },
    pageAnimationEnd_handler: function(event, data) {
      // ...
    },
    input_focusHandler: function(event) {
      // window.setTimeout(function(){
        this.$(".login-logo").addClass("rotated");
      // },50);
    },
    input_blurHandler: function(event) {
      // window.setTimeout(function(){
        this.$(".login-logo").removeClass("rotated");
      // },50);
    },
    form_submitHandler: function(event) {
      this.$("input").blur();
      var username = $("#username").val();
      var password = $("#password").val();
      var rememberme = $("#rememberme").is(":checked");

      var success = function(apiRoot) {
        // @TODO: Do something with the apiRoot
        // Store the "remember me" setting
        account.set("rememberme",rememberme);
        // @TODO: Unblock spinner
        // Navigate away...
        window.jQT.goTo("#main","slidedown");
      };
      var error = function(status, error) {
        // @TODO: Are there more options than just 403?
        // Clear it out
        spiderOakApp.accountModel = account = undefined;
        // @TODO: Unblock spinner
        navigator.notification.alert(
          "Authentication failed. Please check your details and try again.",
          null,
          "Authentication error",
          "OK");
      };

      var account = spiderOakApp.accountModel = new spiderOakApp.AccountModel();
      account.login(username, password, success, error);
    },
    loginButton_tapHandler: function(event) {
      this.$("input").blur();
      event.preventDefault();
    },
    shareRoomsButton_tapHandler: function(event) {
      this.$("input").blur();
      event.preventDefault();
    },
    switch_tapHandler: function(event) {
      var $this = null;
      if ($(event.target).hasClass("switch")) {
        $this = $(event.target);
      }
      else {
        $this = $(event.target).closest(".switch");
      }
      var $checkbox = $this.find("input[type=checkbox]");
      $checkbox.attr("checked",!$checkbox.is(":checked"));
      $this.toggleClass("on");
    }
  });
  spiderOakApp.loginView = new spiderOakApp.LoginView().render();


})(window.spiderOakApp = window.spiderOakApp || {}, window);
