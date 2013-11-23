/*jshint expr:true */
describe('AccountModel', function() {
  beforeEach(function(){
    helper.suspendLocalStorage();
    window.spiderOakApp.initialize();
    this.accountModel = window.spiderOakApp.accountModel;
  });
  afterEach(function(){
    helper.resumeLocalStorage();
  });
  describe('login/logout', function() {
    beforeEach(function(){
      this.server = sinon.fakeServer.create();
      this.username = "testusername";
      this.b32username = window.spiderOakApp.b32nibbler.encode(this.username);
      this.password = "testpassword";
      this.loginURL = "https://spideroak.com/browse/login";
      this.loginURLUnCached = RegExp(this.loginURL + "(\\?.*)?");
      this.loginAltURL = ("https://alternate-dc.spideroak.com/" +
                          this.b32username +
                          "/login");
      this.loginAltURLUnCached = RegExp(this.loginAltURL + "(\\?.*)?");
      this.loginLocation = ("location:https://spideroak.com/storage/" +
                            this.b32username +
                            "/login");
    });

    afterEach(function() {
      this.server.restore();
    });

    describe('successful basic login', function(){
      beforeEach(function(){
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.server.respondWith(
          "POST",
          this.loginURLUnCached,
          [200, {"Content-Type": "text/html"}, this.loginLocation]
        );
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.server.respond();
      });
      it('should call the server using POST', function() {
        this.server.requests[0].method.should.equal("POST");
      });
      it('should use the expected login start url', function() {
        this.server.requests[0].url
            .should.match(this.loginURLUnCached);
      });
      // @TODO: There must be a better way to check query parameters?
      it('should pass the username as query data', function() {
        var match = this.server.requests[0].requestBody
          .match("username=" + this.username);
        match.should.be.an("Array");
        match.should.have.length(1);
      });
      it('should pass the password as query data', function() {
        var match = this.server.requests[0].requestBody
          .match("password=" + this.password);
        match.should.be.an("Array");
        match.should.have.length(1);
      });
      it('should set accountModel rememberme attribute to false by default',
        function() {
          this.accountModel.get("rememberme").should.equal(false);
        }
      );
      it('should be able to set accountModel rememberme attribute to true',
        function() {
          this.accountModel.set("rememberme",true);
          this.accountModel.get("rememberme").should.equal(true);
        }
      );
      it('should call the default success callback', function() {
        this.successSpy.calledOnce.should.equal(true);
        this.successSpy.should.have.been.calledWith("https://spideroak.com/");
      });
      it('should set accountModel b32username upon successful login',
        function() {
          this.accountModel.get("b32username").should.equal(this.b32username);
        }
      );
      it('should set the basic authentication credentials for file headers',
        function() {
          this.accountModel.get("basicAuthCredentials").should.be.ok;
          this.accountModel.get("basicAuthCredentials").should
            .equal("Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA==");
        }
      );
      it('should set proper accountModel storage root URL' +
         ' upon successful login',
         function() {
           this.accountModel.get("storageRootURL").should.equal(
             "https://spideroak.com/storage/" + this.b32username + "/");
         }
        );
    });

    describe('passwords with international characters', function() {
      beforeEach(function(){
        this.xhr = sinon.useFakeXMLHttpRequest();
        this.requests = [];
        this.xhr.onCreate = function (xhr) {
          this.requests.push(xhr);
        }.bind(this);
        this.server.respondWith(
          "POST",
          this.loginURLUnCached,
          [200, {"Content-Type": "text/html"}, this.loginLocation]
        );
      });
      afterEach(function() {
        this.xhr.restore();
      });

      it('should convey passwords with latin characters to the server',
         function() {
           this.funkyCharPassword = "Æàáâãäåæ";
           this.accountModel.login(this.username, this.funkyCharPassword,
                                   this.successSpy, this.errorSpy);
           this.server.respond();
           this.requests.length.should.equal(1);
           // Get the password from the request body:
           this.decodedGotPass =
               decodeURIComponent(this.requests[0].requestBody
                                  .split("&")[1]
                                  .split("=")[1]);
           this.decodedGotPass.should.equal(this.funkyCharPassword);
         });
      it('should convey ascii non-control password characters mostly unsulled',
         function() {
           // Include a bunch of spaces, since the first is treated specially.
           this.asciiNonControls = "  ";
           for (var i=32; i<=127;i++) {
             this.asciiNonControls += String.fromCharCode(i);
           }
           this.accountModel.login(this.username, this.asciiNonControls,
                                   this.successSpy, this.errorSpy);
           this.server.respond();
           this.requests.length.should.equal(1);
           // Get the password from the request body:
           this.decodedGotPass =
               decodeURIComponent(this.requests[0].requestBody
                                  .split("&")[1]
                                  .split("=")[1]);
           this.decodedGotPass.should.equal(
             // The first space is replaced with a "+" due to uri encoding (?)
             //this.asciiNonControls.replace(/ /g, "+")
             // Zepto 1.0RC1 only escapes first space in sequence:
             this.asciiNonControls.replace(/ /, "+")
           );
         });
      it('should set a known HTML auth for a particular password with' +
         ' btoa-breaking UTF8 characters',
         function() {
           this.btoaBreakingPassword = "שָׁלוֹם";
           /* Exposed directly to this password, btoa would fail with:
              "Error: INVALID_CHARACTER_ERR: DOM Exception 5" */
           var bam = this.accountModel.basicAuthManager;
           bam.setAccountBasicAuth(this.accountname, this.btoaBreakingPassword);
           bam.getAccountBasicAuth().should.equal(
             "Basic dW5kZWZpbmVkOtep1rjXgdec15XWuded"
           );
         });
      it('should convey ascii non-control plus btoa-breaking UTF8 password' +
         ' characters mostly unsulled',
         function() {
           // Include a bunch of spaces, since the first is treated specially.
           this.amalgamPassword = "שָׁלוֹם";
           this.amalgamPassword = "  ";
           for (var i=32; i<=127;i++) {
             this.amalgamPassword += String.fromCharCode(i);
           }
           this.accountModel.login(this.username, this.amalgamPassword,
                                   this.successSpy, this.errorSpy);
           this.server.respond();
           this.requests.length.should.equal(1);
           // Get the password from the request body:
           this.decodedGotPass =
               decodeURIComponent(this.requests[0].requestBody
                                  .split("&")[1]
                                  .split("=")[1]);
           this.decodedGotPass.should.equal(
             //this.amalgamPassword.replace(/ /g, "+")
             // Zepto 1.0RC1 only escapes first space in sequence:
             this.asciiNonControls.replace(/ /, "+")
           );
         });
      it('should set a known HTML auth for a particular password with' +
         ' btoa-breaking UTF8 and ascii non-controls',
         function() {
           // Include plain ascii, URL special, latin1, simple Chinese, Hebrew:
           this.btoaBreakingPassword = "abc &:+ ¤«£k 日 שָׁלוֹם";
           for (var i=32; i<=127;i++) {
             this.btoaBreakingPassword += String.fromCharCode(i);
           }
           var bam = this.accountModel.basicAuthManager;
           bam.setAccountBasicAuth(this.accountname, this.btoaBreakingPassword);
           bam.getAccountBasicAuth().should.equal(
             "Basic dW5kZWZpbmVkOmFiYyAmOisgwqTCq8KjayDml6Ug16nWuNeB15zXlda5150gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn8="
           );
         });
    });

    describe('case-altered username', function(){
      it('client should fail login with case-altered username',
         function() {
           this.usernameUpCased = this.username.toUpperCase();
           this.successSpy = sinon.spy();
           this.errorSpy = sinon.spy();
           // The server responds affirmatively to the case-altered username:
           this.server.respondWith(
             "POST",
             this.loginURLUnCached,
             [200, {"Content-Type": "text/html"}, this.loginLocation]
           );
           this.accountModel.login(this.usernameUpCased, this.password,
                                   this.successSpy, this.errorSpy);
           this.server.respond();
           this.successSpy.should.not.have.been.called;
           this.errorSpy.should.have.been.calledOnce;
           this.errorSpy.should.have.been.calledWith(403);
         }
        );
    });

    describe('different login and content-URL username', function(){
      beforeEach(function() {
           this.blueLoginName = "test1@some.where.local";
           this.blueb32username = window.spiderOakApp.b32nibbler.encode(
             "some_test_user_123");
           sinon.spy(this.accountModel.basicAuthManager,'setAccountBasicAuth');
           this.successSpy = sinon.spy();
           this.errorSpy = sinon.spy();
           // The server responds affirmatively to the case-altered username:
           this.server.respondWith(
             "POST",
             this.loginURLUnCached,
             [200, {"Content-Type": "text/html"}, this.loginLocation]
           );
           this.accountModel.login(this.blueLoginName, this.password,
                                   this.successSpy, this.errorSpy);
           this.server.respond();
      });
      afterEach(function(){
        this.accountModel.basicAuthManager.setAccountBasicAuth.restore();
      });
      it('Login to blue-style server should succeed - where login username' +
         ' differs by more than case from content-URL base32 encoded username.',
         function() {
           this.successSpy.should.have.been.calledOnce;
           this.errorSpy.should.not.have.been.called;
           this.accountModel.basicAuthManager.setAccountBasicAuth
             .should.have.been.called;
         }
        );
      it('Blue-server login should yield accountModel "loginname" same' +
         ' as that provided by user for login.',
         function() {
           this.accountModel.get("loginname").should.equal(
             this.blueLoginName);
         }
        );
    });

    describe('events', function() {
      beforeEach(function(){
        this.successSpy = sinon.spy();
        document.addEventListener("loginSuccess", this.successSpy, false);
        this.server.respondWith(
          "POST",
          this.loginURLUnCached,
          [200, {"Content-Type": "text/html"}, this.loginLocation]
        );
        this.accountModel.login(this.username, this.password,
                                function(){}, function(){});
        this.server.respond();
      });
      afterEach(function() {
        document.removeEventListener("loginSuccess", this.successSpy, false);
      });
      it('should trigger `loginSuccess` event on document', function() {
        this.successSpy.should.have.been.calledOnce;
      });
    });

    describe('basic authentication', function() {
      it('login should set basicAuthManager account basic auth', function() {
          sinon.spy(this.accountModel.basicAuthManager,'setAccountBasicAuth');
          this.accountModel.login(this.username, this.password,
                                  function(){}, function(){});
          this.server.respondWith(
            "POST",
            this.loginURLUnCached,
            [200, {"Content-Type": "text/html"}, this.loginLocation]
          );
          this.server.respond();
          this.accountModel.basicAuthManager.setAccountBasicAuth
            .should.have.been.calledWith(this.username, this.password);
          this.accountModel.basicAuthManager.setAccountBasicAuth.restore();
      });
    });

    describe('unsuccessful basic login', function() {
      beforeEach(function(){
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.server.respond();
      });
      it('should call the error callback', function() {
        // default 404 is a decent enough error
        this.errorSpy.should.have.been.calledOnce;
        this.errorSpy.should.have.been.calledWith(404, "authentication failed");
      });
    });

    describe('successful alternate login', function() {
      beforeEach(function(){
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.server.respondWith(
          "POST",
          this.loginURLUnCached,
          [200, {"Content-Type": "text/html"}, "login:" + this.loginAltURL]
        );
        this.server.respondWith(
          "POST",
          this.loginAltURLUnCached,
          [
            200,
            {"Content-Type": "text/html"},
            "location:/" + this.b32username + "/login"
          ]
        );
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.server.respond();
      });
      it('should call the alternate server using POST', function() {
        this.server.requests[1].method.should.equal("POST");
      });
      it('should call the alternate success callback', function() {
        this.successSpy.should.have.been.calledOnce;
        this.successSpy.should.have.been.calledWith(
          "https://alternate-dc.spideroak.com/"
        );
      });
      it('should set accountModel b32username upon successful alternate login',
        function() {
          this.accountModel.get("b32username").should.equal(this.b32username);
        });
    });

    describe('interrupt in-process login', function() {
      beforeEach(function(){
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();

        /* In order to contrive for login interruptions at specific point
         * in the recursive login process, we instrument the fakeServer
         * responder so we can invoke login interruption at the key points.
         */

        /* Set this to URL on which responder will interrupt login process:
         */
        this.responderInterruptAfterURL = "set this to desired URL";
        /* To affirm that login state is "in-process" while login is happening,
           set .responderInterruptAfterURL === "test getLoginState" */
        this.responderLoginState = [];
        var responder = function (request) {
          function accumulateLoginTestState() {
            if (this.responderInterruptAfterURL === "test getLoginState") {
              this.responderLoginState.push(this.accountModel.getLoginState());
            };
          }
          if (request.url.match(RegExp(this.responderInterruptAfterURL +
                                       "(.*)?"))) {
            this.accountModel.interruptLogin();
          }
          if (request.url.match(this.loginURLUnCached)) {
            accumulateLoginTestState();
            request.respond(
              200,
              {"Content-Type": "text/html"},
              "login:" + this.loginAltURL);
          }
          else if (request.url.match(this.loginAltURLUnCached)) {
            accumulateLoginTestState();
            request.respond(
              200,
              {"Content-Type": "text/html"},
              this.loginLocation
            );
          }
          // Provide for logout:
          else if (request.url.match(
            RegExp("https://spideroak.com/storage/" +
                   this.b32username + "/logout(\\?.*)?"))) {
            request.respond(
              200, {"Content-Type": "text/html"}, "the response page"
            );
          }
          else {
            request.respond(
              404,
              {"Content-Type": "text/plain"},
              'Not found'
            );
          }
        }.bind(this);
        this.server.respondWith(responder);
      });
      afterEach:(function() {
        this.responderInterruptAfterURL = false;
      });
      it('non-interrupted login should work as usual', function() {
        this.accountModel.getLoginState().should.equal(false);
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.responderInterruptAfterURL = false;
        this.server.respond();
        this.accountModel.getLoginState().should.equal(true);
      });
      it('getLoginState() should be "in-process" during login', function() {
        this.accountModel.getLoginState().should.equal(false);
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.responderInterruptAfterURL = "test getLoginState";
        this.server.respond();
        this.responderLoginState.map(function (state) {
          state.should.equal("in-process");
        });
      });
      it('interrupting should work in the early login process', function() {
        this.accountModel.getLoginState().should.equal(false);
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.responderInterruptAfterURL = this.loginURL;
        this.server.respond();
        // We're doing a multi-stage login:
        this.accountModel.getLoginState().should.equal(false);
      });
    });

    // rare but possible?
    describe('unsuccessful alternate login', function() {
      beforeEach(function(){
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.server.respondWith(
          "POST",
          "https://spideroak.com/storage/"+this.b32username+"/login",
          [200, {"Content-Type": "text/html"}, "login:" + this.loginAltURL]
        );
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.server.respond();
      });
      it('should call the error callback', function() {
        // default 404 is a decent enough error
        this.errorSpy.should.have.been.calledOnce;
        this.errorSpy.should.have.been.calledWith(404, "authentication failed");
      });
    });

    describe('logout', function() {
      beforeEach(function(){
        this.server.respondWith(
          "POST",
          this.loginURLUnCached,
          [200, {"Content-Type": "text/html"}, this.loginLocation]
        );
        this.server.respondWith(
          "POST",
          RegExp("https://spideroak.com/storage/" +
                 this.b32username +
                 "/logout(\\?.*)?"),
          [200, {"Content-Type": "text/html"},
           "the response page"]
        );
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.server.respond();
      });
      it('should clear basicAuthManager account basic auth', function() {
        sinon.spy(this.accountModel.basicAuthManager,'clear');
        this.accountModel.logout(function(){});
        this.server.respond();
        this.accountModel.basicAuthManager.clear.should.have.been.called;
        this.accountModel.basicAuthManager.clear.restore();
      });
      it("should POST to the account's logout URL", function() {
          this.successSpy = sinon.spy();
          this.accountModel.logout(this.successSpy);
          this.server.respond();
          // Be sure to check against the LAST request.
          //  as there might be other requests involved in logging in
          var lastIndex = (this.server.requests.length - 1);
          this.server.requests[lastIndex].status.should.equal(200);
      });
      it('should clear the account attributes', function() {
        this.accountModel.logout(function(){});
        this.server.respond();
        this.accountModel.get("b32username").should.equal("");
        this.accountModel.get("basicAuthCredentials").should.equal("");
        this.accountModel.get("login_url").should.equal("");
        this.accountModel.get("storageRootURL").should.equal("");
        this.accountModel.get("mySharesRootURL").should.equal("");
        this.accountModel.get("mySharesListURL").should.equal("");
        this.accountModel.get("webRootURL").should.equal("");
      });
      // @TODO: Clear keychain credentials test
      // @TODO: Clear any localStorage test
   });
    describe('login after logout', function() {
      beforeEach(function(){
        this.server.respondWith(
          "POST",
          this.loginURLUnCached,
          [200, {"Content-Type": "text/html"}, this.loginLocation]
        );
        this.server.respondWith(
          "POST",
          RegExp("https://spideroak.com/storage/" +
                 this.b32username +
                 "/logout(\\?.*)?"),
          [200, {"Content-Type": "text/html"},
           "the response page"]
        );
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.server.respond();
        this.accountModel.logout(function(){});
        this.server.respond();
      });



      // @TODO: Clear keychain credentials test
      // @TODO: Clear any localStorage test
   });
  });

});
