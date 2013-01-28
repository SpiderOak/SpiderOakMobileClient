/**
 * AccountModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.AccountModel = Backbone.Model.extend({
    defaults: {
      rememberme: false
    },
    initialize: function() {
      _.bindAll(this, "login");
    },
    login: function(username, password, successCallback, errorCallback) {
      var _self = this;
      var b32username = this.b32encode(username);
      // POST to "https://spideroak.com/storage/"+b32username+"/login"
      //   - as per https://spideroak.com/faq/questions/37/how_do_i_use_the_spideroak_web_api/
      $.ajax({
        type: "POST",
        url: "https://spideroak.com/storage/"+b32username+"/login",
        data: {
          password: password
        },
        success: function(data, status, xhr) {
          if (/^login:/.test(data)) {
            // Try again at appropriate DC
            $.ajax({
              type: "POST",
              url: data.replace(/^login:/,""), // @FIXME: What is the real format of this response?
              data: {
                password: password
              },
              success: function(data, status, xhr) {
                // Set the basicauth details
                Backbone.BasicAuth.set(username,password);
                // Set the b32username
                _self.set("b32username",b32username);
                // @TODO: Set the keychain credentials
                // @FIXME: this should be returning the appropriate DC
                successCallback("https://alternate-dc.spideroak.com/");
              },
              error: function(xhr, errorType, error) {
                // console.log([xhr, errorType, error]);
                errorCallback(xhr.status, "authentication failed");
              }
            });
          }
          else {
            // Set the basicauth details
            Backbone.BasicAuth.set(username,password);
            // Set the b32username
            _self.set("b32username",b32username);
            // @TODO: Set the keychain credentials
            // Return the default DC
            successCallback("https://spideroak.com/");
          }
        },
        error: function(xhr, errorType, error) {
          errorCallback(xhr.status, "authentication failed");
        }
      });
    },
    logout: function(successCallback) {
      // Clear basic auth details
      Backbone.BasicAuth.clear();
      // @TODO: Clear keychain credentials
      // @TODO: Clear any localStorage
      successCallback();
    },
    b32encode: function(str) {
      var nibbler = new window.Nibbler({
        dataBits: 8,
        codeBits: 5,
        keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
        pad: ''
      });
      return nibbler.encode(str);
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
