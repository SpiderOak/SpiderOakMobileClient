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
      "tap .switch": "switch_tapHandler",
      "tap .learn-more": "learnMore_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
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
    input_focusHandler: function(event) {
      // this.$(".login-logo").hide();
      // $(".login-logo").css({"height":"10px", "opacity":"0"});
      $(event.target).closest("div.login-input").addClass("focused");
    },
    input_blurHandler: function(event) {
      // this.$(".login-logo").show();
      // $(".login-logo").css({"height":"auto", "opacity":"1"});
      $(event.target).closest("div.login-input").removeClass("focused");
    },
    form_submitHandler: function(event) {
      event.preventDefault();

      spiderOakApp.dialogView.showWait({subtitle:"Authenticating"});

      var username = $("#unme").val().trim();
      var password = $("#pwrd").val();
      var rememberme = $("#rememberme").is(":checked");

      var success = function(apiRoot) {
        // @TODO: Do something with the apiRoot
        // Navigate away...
        this.dismiss();
        var b32username = spiderOakApp.accountModel.get("b32username");
        // Store the "remember me" setting
        if (rememberme) {
          if (!window.store.get("hasAcceptedTheRisk-" + b32username)) {
            // Pop up the warning
            this.rememberMeWarningView =
              new spiderOakApp.RememberMeWarningView();
            $(".app").append(this.rememberMeWarningView.el);
            this.rememberMeWarningView.render().show();
          }
          else {
            // Go ahead...
            account.set("rememberme",rememberme);
            spiderOakApp.settings.setOrCreate(
              "rememberedAccount",
              JSON.stringify(spiderOakApp.accountModel.toJSON()),
              true
            );
          }
        }
      }.bind(this);
      var error = function(status, error) {
        // Clear it out
        account.loggedOut();
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
          msg = ("Temporary server failure. Please try again later (" +
                 status + ")");
        }

        spiderOakApp.dialogView.hide();

        navigator.notification.alert(msg, null, "Authentication error", "OK");
      };

      if(document.activeElement) {
        document.activeElement.blur();
      }
      var account = spiderOakApp.accountModel;
      account.login(username, password, success, error);
    },
    loginButton_tapHandler: function(event) {
      event.preventDefault();
      this.form_submitHandler(event);
    },
    shareRoomsButton_tapHandler: function(event) {
      event.preventDefault();
      spiderOakApp.mainView.setTitle("ShareRooms");
      $(".sharerooms").closest("li").addClass("current");
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.ShareRoomsRootView,
          {},
          spiderOakApp.noEffect
        );
      }
      else {
        spiderOakApp.navigator.replaceAll(
          spiderOakApp.ShareRoomsRootView,
          {},
          spiderOakApp.noEffect
        );
      }
      this.dismiss();
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
    learnMore_tapHandler: function(event) {
      var learnMoreView = new spiderOakApp.LearnAboutView();
      $(".app").append(learnMoreView.$el);
      learnMoreView.render().show();
    },
    dismiss: function() {
      if (!this.$el.hasClass("dismissed")) {
        this.$("input").attr("disabled", true);
        this.$el.animate({"-webkit-transform":"translate3d(0,100%,0)"}, 100);
        this.$el.addClass("dismissed");
        // Clear username and password values
        this.$("input").val("");
      }
    },
    show: function() {
      if (this.$el.hasClass("dismissed")) {
        this.$("input").removeAttr("disabled");
        this.$el.animate({"-webkit-transform":"translate3d(0,0,0)"}, 100);
        this.$el.removeClass("dismissed");
      }
    }
  });
  spiderOakApp.loginView = new spiderOakApp.LoginView().render();

  spiderOakApp.RememberMeWarningView = Backbone.View.extend({
    className: "rememberme-warning",
    destructionPolicy: "never",
    events: {
      "tap .remember-me": "rememberMe_tapHandler",
      "tap .forget-me": "forgetMe_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
    },
    render: function() {
      this.$el.html(window.tmpl["rememberMeWarningViewTemplate"]());
      this.$el.css("-webkit-transform","translate3d(0,100%,0)");
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      return this;
    },
    rememberMe_tapHandler: function(event) {
      var b32username = spiderOakApp.accountModel.get("b32username");
      spiderOakApp.accountModel.set("rememberme", true);
      window.store.set(
        "hasAcceptedTheRisk-" + b32username,
        true
      );
      spiderOakApp.settings.setOrCreate(
        "rememberedAccount",
        JSON.stringify(spiderOakApp.accountModel.toJSON()),
        true
      );
      this.dismiss();
    },
    forgetMe_tapHandler: function(event) {
      spiderOakApp.accountModel.set("rememberme", false);
      if (this.options && this.options.checkBox) {
        this.options.checkBox.prop("checked",false);
      }
      this.dismiss();
    },
    show: function() {
      this.$el.animate({"-webkit-transform":"translate3d(0,0,0)"}, 100);
    },
    dismiss: function(event) {
      this.$el.animate({"-webkit-transform":"translate3d(0,100%,0)"}, {
        duration: 100,
        complete: function() {
          this.remove();
        }.bind(this)
      });
    },
    remove: function() {
      this.close();
      this.$el.remove();
      this.stopListening();
      return this;
    },
    close: function() {
      // Clean up our subviews
      this.scroller.destroy();
    }
  });


})(window.spiderOakApp = window.spiderOakApp || {}, window);
