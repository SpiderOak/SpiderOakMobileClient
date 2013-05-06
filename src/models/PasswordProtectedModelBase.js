/**
 * PasswordProtectedModelBase.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  /** Provide for password-protected remote items.
   *
   * We tailor our URL to request JSON indication of password protection,
   * rather than a 401, adjust our behavior according to receipt of that
   * JSON, and temporarily adjust the app's basic authentication
   * accordingly.
   */
  spiderOakApp.PasswordProtectedModelBase = Backbone.Model.extend({
    defaults: {
      password_required: false,
      password: ""
    },
    initialize: function () {
      if (spiderOakApp.accountModel) {
        this.setPassword(
          spiderOakApp.accountModel.pubSharesPassManager
              .getCurrentAccountSharePass(
                this.get("share_id"),
                this.get("room_key")));
      }
    },
    composedUrl: function(bare) {
      var base = Backbone.Model.prototype.composedUrl.call(this);
      return base + (bare ? "" : "?auth_required_format=json");
    },
    sync: function () {
      if (this.getPassword()) {
        /* Temporarily set basic auth for the item password, and restore
           the prevailing basic auth upon return. */
        var bam = spiderOakApp.accountModel.basicAuthManager;
        bam.setAlternateBasicAuth(
          "blank",              // Doesn't matter - username is not regarded.
          this.getPassword()  // The salient thing is the password.
        );
        try {
          return Backbone.Model.prototype.sync.apply(this, arguments);
        }
        finally {
          bam.resumeAccountBasicAuth();
        }
      }
      else {
        return Backbone.Model.prototype.sync.apply(this, arguments);
      }
    },
    parse: function(resp, xhr) {
      if (resp.password_required) {
        this.removePassword();
        return {password_required: true,
                password: ""};
      }
      else {
        return this.parseSpecific.call(this, resp, xhr);
      }
    },
    setPassword: function(password) {
      if (this.getPassword() !== password) {
        this.set("password", password);
        spiderOakApp.accountModel.pubSharesPassManager
            .setCurrentAccountSharePass(this.get("share_id"),
                                        this.get("room_key"),
                                        password);
      }
    },
    getPassword: function() {
      return this.get("password");
    },
    removePassword: function() {
      if (this.getPassword()) {
        this.setPassword("");
        spiderOakApp.accountModel.pubSharesPassManager
            .removeCurrentAccountSharePass(this.get("share_id"),
                                           this.get("room_key"));
      }
    },
    /** Generate basic auth per creds. */
    getBasicAuth: function () {
      var password = this.getPassword();
      if (password) {
        var tok = "whatever" + ':' + password;
        var hash = btoa(tok);
        return "Basic " + hash;
      }
      else {
        return "";
      }
    },
    clear: function () {
      this.removePassword();
      Backbone.Model.prototype.clear.call(this);
    },
    which: "PasswordProtectedModelBase"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
