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
  spiderOakApp.PasswordProtectedModelBase = spiderOakApp.ModelBase.extend({
    defaults: {
      password_required: false,
      password: "",
      preliminary: true         // Until individual records fetched from server.
    },
    initialize: function () {
      spiderOakApp.ModelBase.prototype.initialize.call(this);
      var shareId = this.get("share_id");
      var roomKey = this.get("room_key");
      if (spiderOakApp.accountModel && shareId && roomKey) {
        this.setPassword(
          spiderOakApp.accountModel.pubSharesPassManager
              .getCurrentAccountSharePass(
                this.get("share_id"),
                this.get("room_key")));
      }
    },
    composedUrl: function(bare) {
      var base = spiderOakApp.ModelBase.prototype.composedUrl.call(this);
      var query = "auth_required_format=json";
      var delim = base.match(/\?/) ? "&" : "?";
      return base + (bare ? "" : (delim + query));
    },
    /** Transiently include tailored authentication if we have a password */
    sync: function (method, model, options) {
      if (this.getPassword()) {
        /* Temporarily set basic auth for the item password, and restore
           the prevailing basic auth upon return. */
        var bam = spiderOakApp.accountModel.basicAuthManager;
        // The username is disregarded by the server for content passwords.
        bam.setAlternateBasicAuth("blank", this.getPassword());
        try {
          return spiderOakApp.ModelBase.prototype.sync.apply(this, arguments);
        }
        finally {
          bam.resumeAccountBasicAuth();
        }
      }
      else {
        return spiderOakApp.ModelBase.prototype.sync.apply(this, arguments);
      }
    },
    parse: function(resp, xhr) {
      if (resp.password_required) {
        this.removePassword();
        return {password_required: true,
                preliminary: false,
                password: ""};
      }
      else {
        var got = this.parseSpecific.call(this, resp, xhr);
        got.password_required = false;
        got.preliminary = false;
        return got;
      }
    },
    /** Default content-specific parse is default backbone parse. */
    parseSpecific: function(resp, xhr) {
      return spiderOakApp.ModelBase.prototype.parse.call(this, resp, xhr);
    },
    setPassword: function(password) {
      if (this.getPassword() !== password) {
        this.set("password", password);
        var shareId = this.get("share_id");
        var roomKey = this.get("room_key");
        if (shareId && roomKey) {
          if (password) {
            spiderOakApp.accountModel.pubSharesPassManager
                .setCurrentAccountSharePass(this.get("share_id"),
                                            this.get("room_key"),
                                            password);
          }
          else {
            spiderOakApp.accountModel.pubSharesPassManager
                .removeCurrentAccountSharePass(this.get("share_id"),
                                               this.get("room_key"));
          }
        }
      }
    },
    getPassword: function() {
      return this.get("password");
    },
    removePassword: function() {
      if (this.getPassword()) {
        this.setPassword("");
        this.unfetch();
      }
    },
    /** Noop, the deriving class must implement something meaningful. */
    unfetch: function () {
    },
    /** Generate basic auth per creds. */
    getBasicAuth: function () {
      var password = this.getPassword();
      if (password) {
        return window.makeBasicAuthString("whatever", password);
      }
      else {
        return "";
      }
    },
    clear: function () {
      this.removePassword();
      spiderOakApp.ModelBase.prototype.clear.call(this);
    },
    which: "PasswordProtectedModelBase"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
