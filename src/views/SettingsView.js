 /**
 * SettingsView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.SettingsView = Backbone.View.extend({
    destructionPolicy: "never",
    events: {
      "tap .send-feedback": "feedback_tapHandler",
      //"tap .account-settings": "accountSettings_tapHandler",
      "tap .server": "server_tapHandler",
      "change #settings-rememberme": "rememberMe_changeHandler"
    },
    initialize: function() {
      _.bindAll(this);
      this.on("viewActivate", this.viewActivate);
      this.on("viewDeactivate", this.viewDeactivate);
      $(document).on("settingChanged", this.render);
      spiderOakApp.navigator.on("viewChanging", this.viewChanging);
    },
    render: function() {
      this.settingsInfo = spiderOakApp.storageBarModel &&
                          spiderOakApp.storageBarModel.toJSON() ||
                          {};
      this.settingsInfo.firstname = this.settingsInfo.firstname || "";
      this.settingsInfo.lastname = this.settingsInfo.lastname || "";
      _.extend(this.settingsInfo,
               {server: spiderOakApp.settings.get("server").get("value")});
      this.$el.html(
        _.template(
          window.tpl.get("settingsViewTemplate"), this.settingsInfo
        ));
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      return this;
    },
    feedback_tapHandler: function() {
      // @FIXME: This is a bit Android-centric
      var subject = "Feedback on SpiderOak Android app version " +
        spiderOakApp.version;
      var extras = {};
      extras[spiderOakApp.fileViewer.EXTRA_SUBJECT] = subject;
      extras[spiderOakApp.fileViewer.EXTRA_EMAIL] = "Android@spideroak.com";
      var params = {
        action: spiderOakApp.fileViewer.ACTION_SEND,
        type: "text/plain",
        extras: extras
      };
      spiderOakApp.fileViewer.share(
        params,
        function(){
          // ...
        },
        function(error) { // @FIXME: Real error handling...
          console.log(JSON.stringify(error));
        }
      );
    },
    accountSettings_tapHandler: function(event) {
      spiderOakApp.navigator.pushView(
        spiderOakApp.SettingsAccountView,
        {},
        spiderOakApp.defaultEffect
      );
    },
    rememberMe_changeHandler: function(event) {
      var rememberme = $(event.target).is(":checked");
      var b32username = spiderOakApp.accountModel.get("b32username");
      if (rememberme) {
        if (!window.store.get("hasAcceptedTheRisk-" + b32username)) {
          // Pop up the warning
          this.rememberMeWarningView =
            new spiderOakApp.RememberMeWarningView({
              checkBox: $(event.target)
            });
          $(".app").append(this.rememberMeWarningView.el);
          this.rememberMeWarningView.render().show();
        }
        else {
          // Go ahead...
          spiderOakApp.accountModel.set("rememberme",rememberme);
          spiderOakApp.settings.setOrCreate(
            "rememberedAccount",
            JSON.stringify(spiderOakApp.accountModel.toJSON()),
            true
          );
        }
      }
      else {
        spiderOakApp.settings.remove("rememberedAccount");
        spiderOakApp.settings.saveRetainedSettings();
      }
    },
    server_tapHandler: function(event) {
      var settingsServerView = new spiderOakApp.SettingsServerView({
        model: spiderOakApp.settings.get("server")
      });
      spiderOakApp.navigator.pushView(
        settingsServerView,
        {},
        spiderOakApp.defaultEffect
      );
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle("Settings");
        if (!!spiderOakApp.navigator.viewsStack[0] &&
              spiderOakApp.navigator.viewsStack[0].instance === this) {
          spiderOakApp.mainView.showBackButton(false);
        }
        else if (!spiderOakApp.navigator.viewsStack[0] ||
            spiderOakApp.navigator.viewsStack.length === 0) {
          spiderOakApp.mainView.showBackButton(false);
        }
        else {
          spiderOakApp.mainView.showBackButton(true);
        }
      }
    },
    viewActivate: function(event) {
      if (spiderOakApp.navigator.viewsStack[0].instance === this) {
        spiderOakApp.mainView.showBackButton(false);
      }
      spiderOakApp.backDisabled = false;
    },
    viewDeactivate: function(event) {
      this.remove();
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

  spiderOakApp.SettingsAccountView = Backbone.View.extend({
    // Derive from this and define your particular rendering.
    templateID: "settingsAccountViewTemplate",
    viewTitle: "Account",
    destructionPolicy: "never",
    initialize: function() {
      _.bindAll(this);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    getTemplateValues: function() {
      return spiderOakApp.storageBarModel.toJSON();
    },
    render: function() {
      this.$el.html(
        _.template(
          window.tpl.get(this.templateID),
          this.getTemplateValues()
        )
      );
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });
      return this;
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle(this.viewTitle);
        if (!!spiderOakApp.navigator.viewsStack[0] &&
              spiderOakApp.navigator.viewsStack[0].instance === this) {
          spiderOakApp.mainView.showBackButton(false);
        }
        else if (!spiderOakApp.navigator.viewsStack[0] ||
            spiderOakApp.navigator.viewsStack.length === 0) {
          spiderOakApp.mainView.showBackButton(false);
        }
        else {
          spiderOakApp.mainView.showBackButton(true);
        }
      }
    },
    viewActivate: function(event) {
      if (spiderOakApp.navigator.viewsStack[0].instance === this) {
        spiderOakApp.mainView.showBackButton(false);
      }
      spiderOakApp.backDisabled = false;
    },
    viewDeactivate: function(event) {
      this.remove();
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

  spiderOakApp.SettingsServerView = Backbone.View.extend({
    name: "Server Address",
    templateID: "settingsServerViewTemplate",
    events: {
      "submit form": "form_submitHandler",
      "tap .changeServerButton": "changeServerButton_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
      this.listenTo(this.model, "change", function () {
        $(document).trigger("settingChanged");
      });
    },
    render: function() {
      this.$el.html(_.template(window.tpl.get(this.templateID),
                               this.getTemplateValues()));
      return this;
    },
    getTemplateValues: function() {
      return {
        server: this.model.get("value"),
        isLoggedIn: spiderOakApp.accountModel.get("isLoggedIn")
      };
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle("Server Address");
        spiderOakApp.mainView.showBackButton(true);
      }
    },
    viewActivate: function(event) {
      spiderOakApp.backDisabled = false;
    },
    viewDeactivate: function(event) {
      this.$("input").val("");
      this.$("input").blur();
    },
    /** Validate and apply the server host change.
     *
     * We have to dance around a bit for server validation and logout:
     *
     * - We have to go through the error (and possibly success) callback on
     *   a login test to verify that the new designated address host a valid
     *   SpiderOak service. (We use deliberately invalid credentials.)
     * - We use a further callback, for employment via logout in the case
     *   that server change is valid and the current session is authenticated.
     */
    form_submitHandler: function(event) {
      spiderOakApp.dialogView.showWait({
        title: "Validating"
      });
      var newServer = this.$("[name=server]").val().trim(),
          wasServer = this.model.get("value");
      event.preventDefault();
      this.$("input").blur();

      if (newServer === wasServer) {
        spiderOakApp.dialogView.hide();
        spiderOakApp.dialogView.showNotify({
          title: "<i class='icon-info'></i> Unchanged",
          subtitle: "The specified address is\nalready current"
        });
        spiderOakApp.navigator.popView();
      }
      else {
        var didLogout = spiderOakApp.accountModel.get("isLoggedIn");

        /** Take suitable action, from handleLoginProbeResult.
         *
         * This may be run as a logout callback, if logout is necessary,
         * else, run directly.
         */
        var concludeServerChangeAttempt = function() {
          spiderOakApp.dialogView.hide();
          var subtitle = "Service host changed to " + newServer;
          if (didLogout) {
            subtitle += "\nand session logged out";
          }
          this.model.set("value", newServer);
          spiderOakApp.dialogView.showNotify({
            title: "<i class='icon-info'></i> Server changed",
            subtitle: subtitle
          });
          if (spiderOakApp.navigator.viewsStack.length > 0) {
            spiderOakApp.navigator.popView();
          }
        }.bind(this);

        /** Callback for login probe to validate server SpiderOak-ness
         *
         * This should only be run as an error callback, because the login
         * attempt is not viable for legitimate servers.  It should still
         * do the right thing, though, if called as a success callback for an
         * unexpectedly login success.
         */
        var handleLoginProbeResult = function(statusCode, statusText, xhr) {

          // We use xhr.status because xhr is a consistent parameter for both
          // success and failure callbacks:
          if (xhr.status !== 403) {
            // Host is not a SpiderOak service provider - fail:
            spiderOakApp.dialogView.hide();
            if (spiderOakApp.navigator.viewsStack.length > 0) {
              spiderOakApp.navigator.popView();
            }
            navigator.notification.alert(
              newServer + " is not the host of a valid SpiderOak service." +
                " The server is unchanged.",
              null,
              "Validation error",
              "OK"
            );
          }

          else {
            // Valid SpiderOak service provider - make the change:

            // (Recheck the login status, to prevent some potential gambits
            // for suborned servers to try.)
            if (spiderOakApp.accountModel.get("isLoggedIn")) {
              didLogout = true;
              spiderOakApp.accountModel.logout(concludeServerChangeAttempt);
            }
            else {
              concludeServerChangeAttempt();
            }
          }
        };

        // Do the right thing via a login probe of the new server address:
        spiderOakApp.accountModel.login(" ", "",
                                        handleLoginProbeResult,
                                        handleLoginProbeResult,
                                        null,
                                        newServer);
      }
    },
    changeServerButton_tapHandler: function(event) {
      event.preventDefault();
      this.form_submitHandler(event);
    },
    close: function(){
      this.remove();
      this.unbind();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
