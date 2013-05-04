/**
 * PasswordProtectedCollectionBase.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  /** Provide for password-protected remote collections of items.
   *
   * Unlike password-protected models, we behave unquivocally according to
   * the presence of a password in the object, and temporarily adjust the
   * app's basic authentication accordingly.
   */
  spiderOakApp.PasswordProtectedCollectionBase = Backbone.Collection.extend({
    sync: function () {
      if (this.getPassword()) {
        /* Temporarily set basic auth for the item password, and restore
           the prevailing basic auth upon return. */
        var bam = spiderOakApp.accountModel.basicAuthManager;
        bam.setAlternateBasicAuth(
          "blank",            // Doesn't matter - username is not regarded.
          this.getPassword()  // The salient thing is the password.
        );
        try {
          return Backbone.Collection.prototype.sync.apply(this, arguments);
        }
        finally {
          bam.resumeAccountBasicAuth();
        }
      }
      else {
        return Backbone.Collection.prototype.sync.apply(this, arguments);
      }
    },
    setPassword: function (password) {
      if (this.getPassword() !== password) {
        this.password = password;
        spiderOakApp.accountModel.pubSharesPassManager
            .setCurrentAccountSharePass(this.get("share_id"),
                                        this.get("room_key"),
                                        password);
      }
    },
    getPassword: function() {
      return this.password;
    },
    removePassword: function () {
      if (this.getPassword()) {
        this.setPassword("");
        spiderOakApp.accountModel.pubSharesPassManager
            .removeCurrentAccountSharePass(this.get("share_id"),
                                           this.get("room_key"));
      }
    },
    clear: function () {
      this.removePassword();
      Backbone.Collection.prototype.clear.call(this);
    },
    which: "PasswordProtectedCollectionBase"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
