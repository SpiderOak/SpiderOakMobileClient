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
      qq          = window.qq,
      s           = window.s;

  spiderOakApp.LoginView = spiderOakApp.ViewBase.extend({
    el: "#login",
    events: {
      "submit form": "form_submitHandler",
      "tap .menu-btn": "menuBtn_tapHandler",
      "tap .loginButton": "loginButton_tapHandler",
      "tap .switch": "switch_tapHandler",
      "tap .learn-more": "learnMore_tapHandler",
      "tap .advanced-login-settings": "advancedLoginSettings_tapHandler",
      "tap .cancel-btn": "cancelBtn_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
      $(document).on("focus", "#login input", this.input_focusHandler);
      $(document).on("blur", "#login input", this.input_blurHandler);
      window.html10n.bind("localized", this.render);
    },
    render: function() {
      this.$(".learn-more").html(
        qq("Learn more about {{SpiderOak}}&raquo;",
           {SpiderOak: s("SpiderOak")})
      );
      this.$(".remember-me").html(qq("Stay logged in"));
      this.$(".log-in").text(qq("Log in"));
      var unme =  this.$("#unme");
      if (unme && unme[0] && unme[0].placeholder) {
        unme[0].placeholder = qq("Username");
      }
      var pwrd = this.$("#pwrd");
      if (pwrd && pwrd[0] && pwrd[0].placeholder) {
        pwrd[0].placeholder = qq("Password");
      }
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
      var username = $("#unme").val().trim(),
          password = $("#pwrd").val(),
          b32username = spiderOakApp.b32nibbler.encode(username),
          hasAcceptedId = "hasAcceptedNonZK-" + b32username,
          _this = this;
      if (!username || !password) {
        navigator.notification.alert(qq("Missing username or password"),
                                     null,
                                     qq("Authentication error"),
                                     qq("OK"));
        return;
      }
      if (!spiderOakApp.settings.getOrDefault("server")) {
        if (window.navigator.notification.alert) {
          window.navigator.notification.alert(
            qq("Before using the app, you must set your server in the settings"),
            function() {
              spiderOakApp.loginView.setInitialServer();
            },
            qq("Important note"));
        }
        return;
      }
      if (!window.store.get(hasAcceptedId)) {
        if(document.activeElement) {
          document.activeElement.blur();
        }
        _this.nonZKWarningView = new spiderOakApp.NonZKWarningView({
          proceed: function() {
            window.store.set(hasAcceptedId, true);
            _this.authenticate(event);
          }
        });
        $(".app").append(_this.nonZKWarningView.el);
        _this.nonZKWarningView.render().show();
      } else {
        _this.authenticate(event);
      }
    },
    authenticate: function(event) {
      var username = $("#unme").val().trim();
      var password = $("#pwrd").val();
      var rememberme = $("#rememberme").attr("checked") === "true";
      spiderOakApp.dialogView.showWait({subtitle:qq("Authenticating")});
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
        // Clear it out, and zero the password:
        account.loggedOut();
        var msg,
            silent = false,
            dontClearPassword = false;

        if ((status === 0) && (error === "interrupted")) {
          msg = qq("Authentication interrupted");
          dontClearPassword = true;
          silent = true;
        }
        else if (status === 401) {
          msg = qq("Authentication failed - Unauthorized.");
        }
        else if (status === 403) {
          msg = qq("Authentication failed - Incorrect username or password.");
        }
        else if (status === 404) {
          msg = qq("Incorrect ShareID or RoomKey.");
        }
        else if (status === 418) {
          // SpiderOak uses "teapot" to signal incomplete account - no devices.
          msg = qq("We apologize, but you must first complete your account setup using the {{SpiderOak}} desktop software.  This is necessary so that proper cryptographic keys can be generated to keep your data private.  Please open {{SpiderOak}} on your computer to continue.  Thank you. -- The {{SpiderOak}} Team",
                   {SpiderOak: s("SpiderOak")});
        }
        else {
          msg = qq("Temporary server failure ({{status}}). Please try again later.",
                   {status: status});
          dontClearPassword = true;
        }

        spiderOakApp.dialogView.hide();
        if (! dontClearPassword) {
          $("#pwrd").val("");
        }

        if (! silent) {
          navigator.notification.alert(msg, null,
                                       qq("Authentication error"),
                                       qq("OK"));
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
    menuBtn_tapHandler: function(event) {
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
    advancedLoginSettings_tapHandler: function(event) {
      this.setInitialServer();
    },
    cancelBtn_tapHandler: function(event) {
      window.store.set("showPreliminary", true);
      spiderOakApp.preliminaryView = new spiderOakApp.PreliminaryView();
      $(".app").append(spiderOakApp.preliminaryView.$el);
      spiderOakApp.preliminaryView.render().show();
    },
    setInitialServer: function() {
      $("#subviews > .folderViewLoading").remove();
      $(".menu ul li").removeClass("current");
      $(".settings").closest("li").addClass("current");
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.SettingsView,
          {},
          spiderOakApp.noEffect
        );
      }
      else {
        spiderOakApp.navigator.replaceAll(
          spiderOakApp.SettingsView,
          {},
          spiderOakApp.noEffect
        );
      }
      this.dismiss();
      window.setTimeout(function() {
        $("a.server").trigger("tap");
      }, 200);
    },
    dismiss: function() {
      if (!this.$el.hasClass("dismissed")) {
        if (window.StatusBar && $.os.ios) {
          window.StatusBar.styleDefault();
          $("body").css("background-color",s("#e4e4e4"));
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
            $("body").css("background-color",s("#f59f35"));
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

  spiderOakApp.NonZKWarningView = spiderOakApp.ViewBase.extend({
    className: "nonzk-warning",
    destructionPolicy: "never",
    events: {
      "tap .continue": "continue_tapHandler",
      "tap .never-mind": "nevermind_tapHandler"
    },
    initialize: function() {
      this.proceed = this.options["proceed"];
      window.bindMine(this);
    },
    render: function() {
      this.$el.html(window.tmpl["nonZKWarningViewTemplate"]());
      this.$el.css("-webkit-transform","translate3d(0,100%,0)");
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      return this;
    },
    continue_tapHandler: function(event) {
      this.dismiss();
      this.proceed();
    },
    nevermind_tapHandler: function(event) {
      // Clear the password and return to the login screen.
      $("#pwrd").val("");
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
      var title = qq("Enter your 4 digit passcode to unlock");
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
            title: qq("Error"),
            subtitle: qq("Passcode incorrect.") +
              ((tooMany) ?
               "<br>" + qq("Too many attempts.") :
               "<br>" + qq("Try again.")) +
              "<br><br>" + qq("Attempt {{incorrects}} of {{maxIncorrects}}",
                              {incorrects: this.incorrectAttempts,
                               maxIncorrects: this.maxIncorrectAttempts})
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
        qq("Bypass passcode and log out?"),
        function (ok) {
          if (ok === 1) {
            spiderOakApp.accountModel.bypassPasscode();
            spiderOakApp.accountModel.logout();
            this.dismiss();
          }
        }.bind(this),
        qq("Bypass passcode?"),
        [qq("Yes"), qq("No")]);
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
