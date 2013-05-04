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
      if (this.password) {
        /* Temporarily set basic auth for the item password, and restore
           the prevailing basic auth upon return. */
        var bam = spiderOakApp.accountModel.basicAuthManager;
        bam.setAlternateBasicAuth(
          "blank",            // Doesn't matter - username is not regarded.
          this.password       // The salient thing is the password.
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
    which: "PasswordProtectedCollectionBase"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
