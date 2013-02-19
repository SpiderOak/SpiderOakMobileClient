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

  // @TODO Arrange so that base_domain can vary by app configuration.
  var base_domain = "spideroak.com";
  spiderOakApp.AccountModel = Backbone.Model.extend({
    defaults: {
      rememberme: false,
      data_center_regex: /(https:\/\/[^\/]+)\//m,
      response_parse_regex: /^(login|location):(.+)$/m,
      storage_web_url: "",      // Irrelevant to mobile client for now.
      login_url_preface: "https://" + base_domain + "/storage/",
      login_url_start: "https://" + base_domain + "/browse/login",
      logout_url_preface: "https://" + base_domain + "/storage/"
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
          function loginSuccess(login_url, locationResponse) {
            // Obtain the b32username according to the server -
            // the section of the URL before the least '/' delimiter:
            var splat = login_url.split('/');
            var b32username = splat[splat.length - 2];
            var storageRootURL = (splat.slice(0, splat.length-2).join("/")
                                  + "/storage/" + b32username + "/");
            // Replace our notion of the username with the one the server
            // has, according to the b32username: the server preserves the
            // original account's alphabetic case, and uses it, whatever
            // case differences the user enters for login.
            username = _self.b32nibbler.decode(b32username);
            // Set the basicauth details:
            Backbone.BasicAuth.set(username,password);
            // Record the b32username:
            _self.set("b32username",b32username);
            // @TODO: Set the keychain credentials
            // Record the login url:
            _self.set("login_url", login_url);
            // Record the root of the account's storage content:
            _self.set("storageRootURL", storageRootURL);
            // Record the web browsing root location:
            _self.set("webRootURL", locationResponse);
            // Return the data center part of the url:
            var dc = login_url.match(_self.get("data_center_regex"))[1];
            // Trigger the login complete event so other views can react
            $(document).trigger('loginSuccess');
            successCallback(dc + "/");
          }
          if (where && where[1] === "login") {
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
          else if (where && where[1] === "location") {
            var destination = login_url;
            if (destination === _self.get("login_url_start")) {
              destination = where[2];
            }
            loginSuccess(destination, data.slice("location:".length));
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
      // Clear basic auth details:
      Backbone.BasicAuth.clear();
      // @TODO: Clear keychain credentials
      // Post to the logout URL to get the session cookie expired:
      var logout_url = (this.get('logout_url_preface') +
                        this.get("b32username") +
                        "/logout");
      $.ajax({type: "POST",
              url: logout_url,
              error: function(xhr, errorType, error) {
                console.log("Account logout returned error, status: " +
                            xhr.status);
                }
             });
      // @TODO: Clear any localStorage
      // Clear internal settings:
      this.clear();
      successCallback();
    },
    b32nibbler: new window.Nibbler({
      dataBits: 8,
      codeBits: 5,
      keyString: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
      pad: ""
    }),
    getStorageURL: function() {
      return this.get("storageRootURL");
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
