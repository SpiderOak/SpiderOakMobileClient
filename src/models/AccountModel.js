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
      rememberme: false,
      data_center_regex: /(https:\/\/[^\/]+)\//m,
      response_parse_regex: /^(login|location):(.+)$/m,
      storage_web_url: "",      // Irrelevant to mobile client for now.
      // @TODO Extract so different brands can have different hosts:
      // @TODO Further parameterize so the base url can be a user setting:
      login_url_preface: "https://spideroak.com/storage/",
      login_url_start: "https://spideroak.com/browse/login"
    },
    initialize: function() {
      _.bindAll(this, "login");
    },
    /** Storage login.
     * https://spideroak.com/faq/questions/37/how_do_i_use_the_spideroak_web_api
     *
     * @param {string} username
     * @param {string} password
     * @param {string} successCallback
     * @param {string} errorCallback
     * @param {string} login_url Optional explicit login location for username
     */
    login: function(username, password, successCallback, errorCallback,
                    login_url) {
      var _self = this;
      var b32username = this.b32encode(username);
      login_url = login_url || _self.get("login_url_start");
      $.ajax({
        type: "POST",
        url: login_url,
        data: {
          username: username,
          password: password
        },
        success: function(data, status, xhr) {
          var where = data.match(_self.get("response_parse_regex"));
          function loginSuccess(login_url) {
            // Set the basicauth details:
            Backbone.BasicAuth.set(username,password);
            // Record the b32username:
            _self.set("b32username",b32username);
            // @TODO: Set the keychain credentials
            // Record the login url:
            _self.set("login_url", login_url);
            // Return the data center part of the url:
            var dc = login_url.match(_self.get("data_center_regex"))[1];
            // Trigger the login complete event so other views can react
            $(document).trigger('loginSuccess');
            successCallback(dc + "/");
          }
          if (where[1] === "login") {
            // Try again at indicated data center and/or path:
            if (where[2].charAt(0) === "/") {
              // Revise just the path part of the login url:
              login_url = login_url.match(
                _self.get("data_center_regex"))[1] + where[2];
            }
            else {
              // Use the new login url, wholesale:
              login_url = where[2];
            }
            // Recurse, with adjusted login_url:
            _self.login(username, password, successCallback, errorCallback,
                        login_url);
          }
          else if (where[1] === "location") {
            _self.set("storage_web_url", where[2]);
            loginSuccess(login_url);
          }
          else {
            errorCallback(0, "unexpected server response");
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
      // Clear internal settings:
      this.clear();
      successCallback();
    },
    b32encode: function(str) {
      var nibbler = new window.Nibbler({
        dataBits: 8,
        codeBits: 5,
        keyString: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
        pad: ""
      });
      return nibbler.encode(str);
    },
    getStorageURL: function() {
      return this.get("login_url_preface") +
              this.get("b32username") +
              "/";
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
