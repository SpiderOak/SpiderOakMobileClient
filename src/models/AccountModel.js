/**
 * AccountModel.js
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

  // @TODO Arrange so that base_domain can vary by app configuration.
  spiderOakApp.AccountModel = spiderOakApp.ModelBase.extend({
    defaults: {
      rememberme: false,
      data_center_regex: /(https:\/\/[^\/]+)\//m,
      response_parse_regex: /^(login|location):(.+)$/m,
      storage_web_url: "",      // Irrelevant to mobile client for now.

      state: false,
      interrupting: false,
      loginname: "",
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
      this.basicAuthManager = new spiderOakApp.BasicAuthManager();
      this.pubSharesPassManager = new spiderOakApp.PubSharesPassManager(this);
      if (typeof this.get("isLoggedIn") !== "undefined") {
        /* Backwards compat, for transition to 2.4 from earlier versions. */
        if (this.get("isLoggedIn")) {
          this.set("state", true);
        }
        this.unset("isLoggedIn");
      }
      if (this.getLoginState() === true) {
        // We're being initialized as part of remember-me reconstitution.
        this.loggedIn();
      }
    },

    /** Report status login of login process, including intermediate state.
     *
     * @returns (boolean) false: not logged in
     * @returns (boolean) true: logged in
     * @returns (string) "in-process": login dance is happening
     * @returns (string) "interrupting": login dance is being interrupted
     *
     * @see setState
     */
    getLoginState: function() {
      return this.get("state");
    },
    /** Set status of login process. Intended for internal use only.
     *
     * In addition to setting the state, we notice start and finish trigger the 
     * @see getState
     */
    setLoginState: function(state) {
      this.set("state", state);
    },
    loggedIn: function() {
      this.setLoginState(true);
      if (this.passcodeWasBypassed()) {
        this.passcodeWasBypassedFollowup();
      }
    },
    doInterruption: function() {
      var status = this.getLoginState();
      if (status === true) {
        // logged in - logout, clearing stuff in the process:
        this.logout();
        return "interrupting";
      }
      else if ((status === "in-process") || (status === "interrupting")) {
        // Not actually logged in, just clear stuff:
        this.loggedOut();
        return "interrupting";
      }
      else {
        console.log("AccountModel.login(): unexpected interruption state");
        this.loggedOut();
        return "interrupting";
      }
    },

    /* Account Passcode scheme:
     *
     * - The account model provides the passcode management interface.
     * - Accounts can have passcodes and timeouts associated with them
     *   - per device,
     *   - preserved across logins.
     * - During account login, the account activates the passcode in the app
     *   - and deactivates upon logout.
     *   - There is never an active passcode when no account is logged in.
     * - Bypassing passcode from challenge screen, while passcode is active:
     *   - Logs out active account
     *   - Setts account so user gets choice to remove passcode on next login
     *   - So intruders can't get account access by passcode bypass.
     *     - because they still have to log in to the account to access it.
     *   - But user can avoid lock-out due to forgotten passcode.
     */
    /** Return passcode associated with account. */
    getPasscode: function () {
      return spiderOakApp.settings.getOrDefault(
        this.getPasscodeSettingId("passcode"),
        undefined
      );
    },
    /** Associate passcode for account, then activate it. */
    setPasscode: function (passcode) {
      if (! this.getLoginState()) {
        return false;
      }
      spiderOakApp.settings.setOrCreate(
        this.getPasscodeSettingId("passcode"),
        passcode,
        true
      );
      spiderOakApp.settings.saveRetainedSettings();
    },
    /** Return passcode timeout associated with account, or 0 if none. */
    getPasscodeTimeout: function () {
      return spiderOakApp.settings.getOrDefault(
        this.getPasscodeSettingId("passcodeTimeout"),
        0
      );
    },
    /** Associate passcodeTimeout for account, then activate it. */
    setPasscodeTimeout: function (passcodeTimeout) {
      if (! this.getLoginState()) {
        return false;
      }
      spiderOakApp.settings.setOrCreate(
        this.getPasscodeSettingId("passcodeTimeout"),
        passcodeTimeout,
        true
      );
      spiderOakApp.settings.saveRetainedSettings();
    },
    /** Remove this account's passcode, and deactivate it. */
    unsetPasscode: function () {
      // Do this whether or not an account login currently is active.
      spiderOakApp.settings.remove(this.getPasscodeSettingId("passcode"));
      spiderOakApp.settings.remove(
        this.getPasscodeSettingId("passcodeTimeout")
      );
      spiderOakApp.settings.saveRetainedSettings();
    },
    /** Bypass the passcode, prepping for followup on next login. */
    bypassPasscode: function () {
      if (! this.getLoginState()) {
        return false;
      }
      spiderOakApp.settings.setOrCreate(
        this.getPasscodeSettingId("passcodeWasBypassed"),
        true,
        true
      );
      spiderOakApp.settings.saveRetainedSettings();
    },
    passcodeWasBypassed: function () {
      return spiderOakApp.settings.getOrDefault(
        this.getPasscodeSettingId("passcodeWasBypassed"),
        false
      );
    },
    /** Post notification for bypassed passcode, and clear status. */
    passcodeWasBypassedFollowup: function () {
      spiderOakApp.settings.remove(
        this.getPasscodeSettingId("passcodeWasBypassed"));
      spiderOakApp.settings.saveRetainedSettings();
      if (! this.getLoginState()) {
        console.log("AccountModel: unexpected passcode bypassed state");
        return false;
      }
      navigator.notification.confirm(
        qq("Your account was logged off on bypass of your passcode. Remove your passcode?"),
        function (ok) {
          if (ok === 2) {
            this.unsetPasscode();
            spiderOakApp.dialogView.showNotify({
              title: "<i class='icon-info'></i>" + qq("Passcode removed"),
              subtitle: qq("Navigate to Settings to establish a new passcode.")
            });
          }
          else {
            spiderOakApp.dialogView.showNotify({
              title: "<i class='icon-info'></i>" + qq("Passcode Kept")
            });
          }
        }.bind(this),
        qq("Passcode was bypassed"),
        [qq("Keep it"),qq("Remove it")]);
    },
    /** Return distinct name for persistent setting. */
    getPasscodeSettingId: function (which) {
      return which + "_" + this.get("b32username");
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
     * @param {string} probeHost Optional explicit login domain, for trial that will not have actual login effect
     */
    login: function(username, password, successCallback, errorCallback,
                    login_url, probeHost) {
      var ajax = probeHost ? spiderOakApp.dollarAjax : spiderOakApp.ajax;

      /* @TODO: Move the notification to a view element, probably LoginView. */
      if (!spiderOakApp.networkAvailable && navigator.notification) {
        navigator.notification.confirm(
          qq("Sorry! You should still be able to access your favorites, but logging in and access to files or folders requires a network connection."),
          function(){},
          qq("Network error"),
          qq("OK")
        );
        spiderOakApp.dialogView.hide();
        return;
      }

      if (this.getLoginState() === "interrupting") {
        return this.doInterruption();
      }
      else if (! probeHost) {
        this.setLoginState("in-process");
      }

      var _self = this,
          server = (probeHost ||
                    spiderOakApp.settings.getValue("server")),
          login_url_start = "https://" + server + "/browse/login";
      login_url = login_url || login_url_start;


      ajax({
        type: "POST",
        url: login_url,
        cache: false,
        headers: {
          "X-SpiderOak-Mobile-Client": s("SpiderOak")
        },
        data: {
          username: username,
          password: password
        },

        /** Handle server login success. */
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
            var gotUsername = spiderOakApp.b32nibbler.decode(b32username);
            var storageHost = splat.slice(0, splat.length-3).join("/");
            var storageRootURL = storageHost + "/storage/" + b32username + "/";

            _self.set("login_url_preface", "https://" + server + "/storage/");
            _self.set("login_url_start", "https://" + server + "/browse/login");
            _self.set("logout_url_preface", "https://" + server + "/storage/");

            // The name by which they logged in.  (For Blue/enterprise
            // users, it's different than b32decode(b32username.)
            _self.set("loginname", username);
            // The base32 encrypted version of the internal username used
            // on the login and content urls.
            _self.set("b32username",b32username);
            // @TODO: Set the keychain credentials
            // Set the basicauth details:
            _self.basicAuthManager.setAccountBasicAuth(username, password);
            // Record the basic auth credentials
            _self.set("basicAuthCredentials",
                      _self.basicAuthManager.getAccountBasicAuth());
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
            _self.loggedIn();
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
            if ((_self.login(username, password,
                             successCallback, errorCallback,
                             login_url, probeHost) === "interrupting") &&
                errorCallback) {
              errorCallback(0, "interrupted", xhr);
            }
          }
          else if (where && where[1] === "location") {
            var destination = login_url;
            if (destination === login_url_start) {
              destination = where[2];
            }
            if (! probeHost) {
              loginSuccess(destination, data.slice("location:".length));
            }
          }
          else {
            if (username === "") {
              errorCallback(403, "Authentication failed", xhr);
            }
            else {
              errorCallback(0, "unexpected server response", xhr);
            }
          }
        },
        error: function(xhr, errorType, error) {
          if (! probeHost) {
            _self.setLoginState(false);
          }
          errorCallback(xhr.status, "authentication failed", xhr);
        }
      });
    },

    /** Interrupt in-process login, or logout if logged in.
     *
     * @return (boolean) true if login is in process, or was logged-in.
     */
    interruptLogin: function() {
      var status = this.getLoginState();
      if (status === "in-process") {
        this.setLoginState("interrupting");
        return true;
      }
      else if (status === "interrupting") {
        return true;
      }
      else if (status === true) {
        this.logout();
        return true;
      }
      else {
        return false;
      }
    },
    /** Do server logout and local zeroing of credentials, etc.
     *
     * We always do local zeroing and call successCallback, regardless of
     * server response.
     */
    logout: function(successCallback) {
      // Clear basic auth details:
      this.basicAuthManager.clear();
      spiderOakApp.settings.remove("rememberedAccount");
      spiderOakApp.settings.saveRetainedSettings();
      if (this.getLoginState() === true) {
        // @TODO: Clear keychain credentials
        // Post to the logout URL to get the session cookie expired:
        var logout_url = (this.get('logout_url_preface') +
                          this.get("b32username") +
                          "/logout");
        spiderOakApp.ajax(
          {
            type: "POST",
            url: logout_url,
            cache: false,
            error: function(xhr, errorType, error) {
              console.log("Account logout returned error, status: " +
                          xhr.status);
            }
          }
        );
      }
      this.loggedOut();
      $(document).trigger("logoutSuccess");
      if (successCallback) {
        successCallback();
      }
    },
    /** Clear account resources. */
    loggedOut: function() {
      this.pubSharesPassManager.loggedOut();
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

  spiderOakApp.BasicAuthManager = function () {
    // @TESTTHIS
    var accountUsername = "",
        accountPassword = "",
        currentAuthString = "";
    return {
      /** Establish basic auth based on credentials, and stash them. */
      setAccountBasicAuth: function (username, password) {
        accountUsername = username;
        accountPassword = password;
        this.resumeAccountBasicAuth();
        return this;
      },
      /** Reestablish basic auth based on stashed credentials. */
      resumeAccountBasicAuth: function () {
        if ((accountUsername !== "") || (accountPassword !== "")) {
          currentAuthString =
            window.makeBasicAuthString(accountUsername, accountPassword);
        }
        else {
          currentAuthString = "";
        }
      },
      /** Establish basic auth per alternate creds, keeping stashed around. */
      setAlternateBasicAuth: function (username, password) {
        currentAuthString = window.makeBasicAuthString(username, password);
      },
      /** Return currently obtaining basic auth string, or "". */
      getCurrentBasicAuth: function () {
        return currentAuthString;
      },
      /** Return account basic auth string, or false if not logged in. */
      getAccountBasicAuth: function () {
        return ((accountUsername !== "") &&
                (accountPassword !== "") &&
                window.makeBasicAuthString(accountUsername, accountPassword));
      },
      clear: function () {
        accountUsername = accountPassword = currentAuthString = "";
      }
    };
  };
  /** Maintain passwords for protected ShareRooms, per account.
   *
   * Make it easy to track obtained passwords within a login session, and
   * also easy to expunge ones when they prove to be obsolete.  Currently,
   * the records are not retained across application sessions.
   *
   * Removing a ShareRoom wipes the password record for that ShareRoom,
   * in the context of the current account.
   *
   * ShareRoom password records obtained while not authenticated are
   * retained across and within authenticated sessions.
   *
   * The records could be retained across app sessions using settings, but
   * that would require decisions about the security exposure, and also UI
   * for the user to elect such preservation and selective dropping of
   * specific records.
   */
  spiderOakApp.PubSharesPassManager = function (accountModel) {
    var byAccount = {};

    return {
      _currentAccount: function () {
        var it = "";
        if (spiderOakApp.accountModel) {
          it = spiderOakApp.accountModel.get("b32username");
        }
        if (! byAccount.hasOwnProperty(it)) {
          byAccount[it] = {};
        }
        return it;
      },
      loggedOut: function () {
        delete byAccount[this._currentAccount()];
        return this;
      },
      setCurrentAccountSharePass: function (shareId, roomKey, password) {
        var currentPasses = byAccount[this._currentAccount()];
        if (! currentPasses) {
          currentPasses = byAccount[this._currentAccount()] = {};
        }
        currentPasses[JSON.stringify({shareId: shareId,
                                      roomKey: roomKey})] = password;
        return this;
      },
      getCurrentAccountSharePass: function (shareId, roomKey) {
        var passes = byAccount[this._currentAccount()] || {};
        var stringified = JSON.stringify({shareId: shareId,
                                          roomKey: roomKey});
        var got = (passes[stringified]);
        if (! got && this._currentAccount()) {
          // Try the no-authentication record, too:
          passes = byAccount[""] || {};
          got = passes[stringified];
        }
        return got || "";
      },
      removeCurrentAccountSharePass: function (shareId, roomKey) {
        var passes = byAccount[this._currentAccount()] || {};
        var stringified = JSON.stringify({shareId: shareId,
                                          roomKey: roomKey});
        delete passes[stringified];
        // Also remove from no-authentication records:
        if (this._currentAccount()) {
          passes = byAccount[""] || {};
          delete passes[stringified];
        }
        return this;
      },
      clear: function () {
        byAccount = {};
      }
    };
  };

})(window.spiderOakApp = window.spiderOakApp || {}, window);
