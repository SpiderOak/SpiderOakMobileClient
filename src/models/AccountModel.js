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
  spiderOakApp.AccountModel = Backbone.Model.extend({
    defaults: {
      rememberme: false,
      data_center_regex: /(https:\/\/[^\/]+)\//m,
      response_parse_regex: /^(login|location):(.+)$/m,
      storage_web_url: "",      // Irrelevant to mobile client for now.

      isLoggedIn: false,
      b32username: "",
      basicAuthCredentials: "",
      login_url: "",
      storageRootURL: "",
      mySharesListURL: "",
      mySharesRootURL: "",
      webRootURL: "",
      favoritesConfirmationAccepted: false
    },
    initialize: function() {
      _.bindAll(this, "login");
    },
    /** Storage login.
     * https://spideroak.com/faq/questions/37/how_do_i_use_the_spideroak_web_api
     *
     * optionalHost is for lightweight test of alternate server addresses.
     *
     * @param {string} username
     * @param {string} password
     * @param {string} successCallback - gets data, status code, xhr
     * @param {string} errorCallback - gets status code, status text, xhr
     * @param {string} login_url Optional explicit login location
     * @param {string} login_optionalHost Optional explicit login domain
     */
    login: function(username, password, successCallback, errorCallback,
                    login_url, optionalHost) {
      if (!spiderOakApp.networkAvailable && navigator.notification) {
        navigator.notification.confirm(
          "Sorry. You should still be able to access your favorites, but " +
            "Logging in and access to files or folders requires " +
            "a network connection.",
          function(){},
          'Network error',
          'OK'
        );
        spiderOakApp.dialogView.hide();
        return;
      }

      var _self = this,
          server = (optionalHost ||
                    spiderOakApp.settings.get("server").get("value")),
          login_url_start = "https://" + server + "/browse/login";

      login_url = login_url || login_url_start;
      $.ajax({
        type: "POST",
        url: login_url,
        data: {
          username: username,
          password: password
        },
        success: function(data, status, xhr) {
          var where = data.match(_self.get("response_parse_regex"));
          /** Register settings according to a successful login.
           *
           * @param {string} login_url - the actual login location. Eg:
           *        https://web-dc2.spideroak.com/storage/EBRG6Z3VOMQA/login
           * @param {string} locationResponse - the account's web browsing URL
           */
          function loginSuccess(login_url, locationResponse) {
            var splat = login_url.split('/');
            var b32username = splat[splat.length - 2];
            var storageHost = splat.slice(0, splat.length-3).join("/");
            var storageRootURL = storageHost + "/storage/" + b32username + "/";

            _self.set("login_url_preface", "https://" + server + "/storage/");
            _self.set("login_url_start", "https://" + server + "/browse/login");
            _self.set("logout_url_preface", "https://" + server + "/storage/");

            // Replace our notion of the username with the one the server
            // has, according to the b32username: the server preserves the
            // original account's alphabetic case, and uses it, whatever
            // case differences the user enters for login.
            username = spiderOakApp.b32nibbler.decode(b32username);
            // Set the basicauth details:
            Backbone.BasicAuth.set(username,password);
            // Record the b32username:
            _self.set("b32username",b32username);
            // @TODO: Set the keychain credentials
            // Record the basic auth credentials
            _self.set("basicAuthCredentials",
                      _self.getBasicAuth(username, password));
            // Record the login url:
            _self.set("login_url", login_url);
            // Record the root of the account's storage content:
            _self.set("storageRootURL", storageRootURL);
            // Record the location of the account's shares list:
            _self.set("mySharesListURL", storageRootURL + "shares");
            // Record the location of the account's shares root:
            _self.set("mySharesRootURL", storageHost + "/share/");
            // Record the web browsing root location:
            _self.set("webRootURL", locationResponse);
            // Return the data center part of the url:
            var dc = login_url.match(_self.get("data_center_regex"))[1];
            // Trigger the login complete event so other views can react
            _self.set("isLoggedIn", true);
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
                        login_url, optionalHost);
          }
          else if (where && where[1] === "location") {
            var destination = login_url;
            if (destination === login_url_start) {
              destination = where[2];
            }
            loginSuccess(destination, data.slice("location:".length));
          }
          else {
            errorCallback(0, "unexpected server response", xhr);
          }
        },
        error: function(xhr, errorType, error) {
          errorCallback(xhr.status, "authentication failed", xhr);
        }
      });
    },
    getBasicAuth: function (user, password) {
      var tok = user + ':' + password;
      var hash = btoa(tok);
      return "Basic " + hash;
    },
    /** Do server logout and local zeroing of credentials, etc.
     *
     * We always do local zeroing and call successCallback, regardless of
     * server response.
     */
    logout: function(successCallback) {
      // Clear basic auth details:
      Backbone.BasicAuth.clear();
      if (this.get("isLoggedIn")) {
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
      }
      this.loggedOut();
      $(document).trigger("logoutSuccess");
      if (successCallback) {
        successCallback();
      }
    },
    /** Clear account resources. */
    loggedOut: function() {
      if (spiderOakApp.recentsCollection) {
          spiderOakApp.recentsCollection.reset([]);
      }
      if (spiderOakApp.publicShareRoomsCollection) {
        spiderOakApp.publicShareRoomsCollection.reset();
      }
      this.clear();
      this.set(this.defaults);
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
