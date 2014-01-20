/**
 * LoginView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.LoginView = spiderOakApp.ViewBase.extend({
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
      $(".learn-more").html("Learn more about " + s("SpiderOak") + " &raquo;");
      $(".remember-me").html(s("Stay logged in"));
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
      var rememberme = $("#rememberme").attr("checked") === "true";

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
        var msg,
            silent = false;
        if ((status === 0) && (error === "interrupted")) {
          msg = "Authentication interrupted";
          silent = true;
        }
        else if (status === 401) {
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
                 " setup using the " +
                 s("SpiderOak") + " desktop software.  This is necessary" +
                 " so that proper cryptographic keys can be generated to" +
                 " keep your data private.  Please open " +
                 s("SpiderOak") + " on your" +
                 " computer to continue.  Thank you. -- The " +
                 s("SpiderOak") + "Team");
        }
        else {
          msg = ("Temporary server failure. Please try again later (" +
                 status + ")");
        }

        spiderOakApp.dialogView.hide();

        if (! silent) {
          navigator.notification.alert(msg, null, "Authentication error", "OK");
        }
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
      $("#subviews > .folderViewLoading").remove();
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
      window.setTimeout(function() {
        window.spiderOakApp.mainView.openMenu();
      }, 130);
    },
    switch_tapHandler: function(event) {
      var $this = null;
      if ($(event.target).hasClass("switch")) {
        $this = $(event.target);
      }
      else {
        $this = $(event.target).closest(".switch");
      }
      var $checkbox = this.$("input[type=checkbox]");
      var checked = ($checkbox.attr("checked") === "true");
      $checkbox.attr("checked",!checked);
      $this.toggleClass("on");
    },
    learnMore_tapHandler: function(event) {
      var learnMoreView = new spiderOakApp.LearnAboutView();
      $(".app").append(learnMoreView.$el);
      learnMoreView.render().show();
    },
    dismiss: function() {
      if (!this.$el.hasClass("dismissed")) {
        if (window.StatusBar && $.os.ios) {
          window.StatusBar.styleDefault();
          $("body").css("background-color","#e4e4e4");
        }
        this.$("input").attr("disabled", true);
        this.$el.animate({"-webkit-transform":"translate3d(0,100%,0)"}, 100);
        this.$el.addClass("dismissed");
        // Clear username and password values
        this.$("input").val("");
      }
    },
    show: function() {
      if (this.$el.hasClass("dismissed")) {
        if (window.StatusBar && $.os.ios) {
          window.setTimeout(function() {
            window.StatusBar.styleLightContent();
            $("body").css("background-color","#f59f35");
          }, 100);
        }
        this.$("input").removeAttr("disabled");
        this.$el.animate({"-webkit-transform":"translate3d(0,0,0)"}, 100);
        this.$el.removeClass("dismissed");
      }
    }
  });
  spiderOakApp.loginView = new spiderOakApp.LoginView().render();

  spiderOakApp.RememberMeWarningView = spiderOakApp.ViewBase.extend({
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

  // Wasn't sure where else to put this?
  spiderOakApp.SettingsPasscodeAuthView = spiderOakApp.ViewBase.extend({
    viewTitle: "Enter Passcode",
    className: "passcode-auth-entry",
    events: {
      "touchstart .pinpad .num": "pinpadNum_tapHandler",
      "tap .passcode-cancel-btn": "a_bypassTapHandler"
    },
    initialize: function() {
      window.bindMine(this);
      this.action = "auth";
      this.incorrectAttempts = 0;
      this.maxIncorrectAttempts = 5;
    },
    render: function() {
      var title = "Enter your 4 digit passcode to unlock";
      this.$el.html(window.tmpl["passcodeEntryViewTemplate"]({
        title: title,
        actionBar: true
      }));
      this.$el.css("-webkit-transform","translate3d(0,100%,0)");
      return this;
    },
    show: function() {
      // THERE CAN BE ONLY ONE!!
      if ($(".main").hasClass("passcodeActive")) {
        return;
      }
      $(".main").addClass("passcodeActive");
      this.$el.animate({"-webkit-transform":"translate3d(0,0,0)"}, 100);
    },
    dismiss: function(event) {
      this.$el.animate({"-webkit-transform":"translate3d(0,100%,0)"}, {
        duration: 100,
        complete: function() {
          $(".main").removeClass("passcodeActive");
          this.remove();
        }.bind(this)
      });
    },
    // This is WET-ter than it could be
    pinpadNum_tapHandler: function(event) {
      event.preventDefault();
      var $passcodeInput = this.$(".passcode");
      var $target = $(event.target);
      var passcode = $passcodeInput.val();
      var num = '';
      if ($target.hasClass("num")) {
        num = $target.find(".number").text();
      } else {
        num = $target.closest(".num").find(".number").text();
      }
      if (!num) {
        // backspace
        if (!passcode.length) return;
        passcode = passcode.substr(0, (passcode.length - 1));
        $passcodeInput.val(passcode);
        return;
      }
      if (passcode.length < 3) {
        $passcodeInput.val(passcode.toString()+num);
        // add it and wait for more...
        return;
      } else if (passcode.length === 3) {
        $passcodeInput.val(passcode.toString()+num);
        passcode = $passcodeInput.val();
        if (spiderOakApp.accountModel.getPasscode() === passcode) {
          this.dismiss();
        } else {
          this.incorrectAttempts++;
          var tooMany = (this.incorrectAttempts >= this.maxIncorrectAttempts);
          spiderOakApp.dialogView.showNotify({
            title: "Error",
            subtitle: "Passcode incorrect." +
              ((tooMany) ? "<br>Too many attempts." : "<br>Try again.") +
              "<br><br>attempt " + this.incorrectAttempts + " of " +
              this.maxIncorrectAttempts
          });
          if (tooMany) {
            spiderOakApp.accountModel.bypassPasscode();
            spiderOakApp.accountModel.logout();
            this.dismiss();
          }
          // Clear the confirm code so they can try again
          $passcodeInput.val("");
        }
      }
    },
    a_bypassTapHandler: function(event) {
      event.preventDefault();
      navigator.notification.confirm(
        "Bypass passcode and log out?",
        function (ok) {
          if (ok === 1) {
            spiderOakApp.accountModel.bypassPasscode();
            spiderOakApp.accountModel.logout();
            this.dismiss();
          }
        }.bind(this),
        "Bypass passcode?",
        "Yes,No");
    },
    remove: function() {
      this.close();
      this.$el.remove();
      this.stopListening();
      return this;
    },
    close: function() {
      // Clean up our subviews
    }
  });


})(window.spiderOakApp = window.spiderOakApp || {}, window);
