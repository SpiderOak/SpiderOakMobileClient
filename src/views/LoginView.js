/**
 * LoginView.js
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
      "submit form": "form_submitHandler",
      "tap .shareRoomsButton": "shareRoomsButton_tapHandler",
      "tap .loginButton": "loginButton_tapHandler",
      "tap .switch": "switch_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      $(document).on("focus", "#login input", this.input_focusHandler);
      $(document).on("blur", "#login input", this.input_blurHandler);
    },
    render: function() {
      // @FIXME: This will actually be set by the users choice...
      if (this.$(".switch").hasClass("on")) {
        this.$(".switch input[type=checkbox]").attr("checked",true);
      }
      return this;
    },
    // pageAnimationStart_handler: function(event, data) {
    //   // Assume that if this view is being displayed it is due to
    //   //  logging out or needing reauthentication
    //   if (data.direction === "in") {
    //     // Clear inputs
    //     $("#username").val("");
    //     $("#password").val("");
    //     spiderOakApp.accountModel.logout(function() {
    //       spiderOakApp.accountModel = undefined;
    //     });
    //   }
    // },
    // pageAnimationEnd_handler: function(event, data) {
    //   // ...
    // },
    input_focusHandler: function(event) {
      // @TODO: also change logos
      $(event.target).closest("div.login-input").addClass("focused");
    },
    input_blurHandler: function(event) {
      // @TODO: also change logos
      $(event.target).closest("div.login-input").removeClass("focused");
    },
    form_submitHandler: function(event) {
      event.preventDefault();

      spiderOakApp.dialogView.showWait({subtitle:"Authenticating"});

      var username = $("#unme").val();
      var password = $("#pwrd").val();
      var rememberme = $("#rememberme").is(":checked");

      var success = function(apiRoot) {
        // @TODO: Do something with the apiRoot
        // Store the "remember me" setting
        account.set("rememberme",rememberme);
        // @TODO: Unblock spinner
        // Navigate away...
        this.dismiss();
      }.bind(this);
      var error = function(status, error) {
        // Clear it out
        spiderOakApp.accountModel = account = undefined;
        // @TODO: Unblock spinner
        var msg;
        if (status === 401) {
          msg = "Authentication failed - Unauthorized.";
        }
        else if (status === 403) {
          msg = "Authentication failed - Incorrect username or password.";
        }
        else if (status === 404) {
          msg = "Incorrect ShareID or RoomKey.";
        }
        else if (status === 418) {
          msg = ("We apologize, but you must first complete your account" +
            " setup using the SpiderOak desktop software.  This is necessary" +
            " so that proper cryptographic keys can be generated to" +
            " keep your data private.  Please open SpiderOak on your" +
            " computer to continue.  Thank you. -- The SpiderOak Team");
        }
        else {
          msg = ("Temporary server failure. Please try again later.");
        }

        spiderOakApp.dialogView.hide();

        navigator.notification.alert(msg, null, "Authentication error", "OK");
      };

      if(document.activeElement) {
        document.activeElement.blur();
      }
      var account = spiderOakApp.accountModel = new spiderOakApp.AccountModel();
      account.login(username, password, success, error);
    },
    loginButton_tapHandler: function(event) {
      event.preventDefault();
      this.form_submitHandler(event);
    },
    shareRoomsButton_tapHandler: function(event) {
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
    },
    dismiss: function() {
      if (!this.$el.hasClass("dismissed")) {
        this.$el.animate({"-webkit-transform":"translate3d(0,100%,0)"}, 100);
        this.$el.addClass("dismissed");
        // Clear username and password values
        this.$("input").val("");
      }
    },
    show: function() {
      if (this.$el.hasClass("dismissed")) {
        this.$el.animate({"-webkit-transform":"translate3d(0,0,0)"}, 100);
        this.$el.removeClass("dismissed");
      }
    }
  });
  spiderOakApp.loginView = new spiderOakApp.LoginView().render();


})(window.spiderOakApp = window.spiderOakApp || {}, window);
