/*jshint expr:true */
describe('AccountModel', function() {
  describe('login/logout', function() {
    beforeEach(function(){
      this.server = sinon.fakeServer.create();
      this.username = "testusername";
      this.b32username = "ORSXG5DVONSXE3TBNVSQ"; // nibbler b32 of "testusername"
      this.password = "testpassword";
      this.accountModel =
        spiderOakApp.accountModel = new spiderOakApp.AccountModel();
    });

    afterEach(function() {
      this.server.restore();
    });

    // @FIXME: Add in jasmine-sinon to make sinon behave better
    describe('successful basic login', function(){
      beforeEach(function(){
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.server.respondWith(
          "POST",
          "https://spideroak.com/browse/login",
          [200, {"Content-Type": "text/html"},
           "location:https://spideroak.com/" + this.b32username + "/storage"]
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
            .should.equal("https://spideroak.com/browse/login");
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
      it('should set proper accountModel storage root URL' +
         ' upon successful login',
         function() {
           this.accountModel.getStorageURL().should.equal(
             "https://spideroak.com/storage/" + this.b32username + "/");
         }
        );
    });

    describe('successful case-insensitive login', function(){
      it('should use proper case-translated username for basic auth',
         function() {
           this.usernameUpCased = this.username.toUpperCase();
           sinon.spy(Backbone.BasicAuth,'set');
           this.successSpy = sinon.spy();
           this.errorSpy = sinon.spy();
           this.server.respondWith(
             "POST",
             "https://spideroak.com/browse/login",
             [200, {"Content-Type": "text/html"},
              "location:https://spideroak.com/" + this.b32username + "/storage"]
           );
           this.accountModel.login(this.usernameUpCased, this.password,
                                   this.successSpy, this.errorSpy);
           this.server.respond();
           this.successSpy.calledOnce.should.equal(true);
           Backbone.BasicAuth.set.should.have.been.calledWith(this.username,
                                                              this.password);
           Backbone.BasicAuth.set.restore();
         }
        );
    });

    describe('events', function() {
      beforeEach(function(){
        this.successSpy = sinon.spy();
        document.addEventListener("loginSuccess", this.successSpy, false);
        this.server.respondWith(
          "POST",
          "https://spideroak.com/browse/login",
          [200, {"Content-Type": "text/html"},
           "location:https://spideroak.com/" + this.b32username + "/storage"]
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

    describe('backbone basic authentication', function() {
      it('should set Backbone.BasicAuth', function() {
          sinon.spy(Backbone.BasicAuth,'set');
          this.accountModel.login(this.username, this.password,
                                  function(){}, function(){});
          this.server.respondWith(
            "POST",
            "https://spideroak.com/browse/login",
            [
              200,
              {"Content-Type": "text/html"},
              "location:https://spideroak.com/" + this.b32username + "/storage"
            ]
          );
          this.server.respond();
          Backbone.BasicAuth.set.should.have.been.calledWith(this.username,
                                                             this.password);
          Backbone.BasicAuth.set.restore();
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
          "https://spideroak.com/browse/login",
          [
            200,
            {"Content-Type": "text/html"},
            "login:https://alternate-dc.spideroak.com/" +
              this.b32username +
              "/login"
          ]
        );
        this.server.respondWith(
          "POST",
          "https://alternate-dc.spideroak.com/" + this.b32username + "/login",
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

    // rare but possible?
    describe('unsuccessful alternate login', function() {
      beforeEach(function(){
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.server.respondWith(
          "POST",
          "https://spideroak.com/storage/"+this.b32username+"/login",
          [
            200,
            {"Content-Type": "text/html"},
            "login:https://alternate-dc.spideroak.com/"+this.b32username+"/login"
          ]
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
          "https://spideroak.com/browse/login",
          [200, {"Content-Type": "text/html"},
           "location:https://spideroak.com/" + this.b32username + "/storage"]
        );
        this.server.respondWith(
          "POST",
          "https://spideroak.com/storage/" + this.b32username + "/logout",
          [200, {"Content-Type": "text/html"},
           "the response page"]
        );
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.accountModel.login(this.username, this.password,
                                this.successSpy, this.errorSpy);
        this.server.respond();
      });
      it('should clear BackBone.BasicAuth', function() {
        sinon.spy(Backbone.BasicAuth,'clear');
        this.accountModel.logout(function(){});
        this.server.respond();
        Backbone.BasicAuth.clear.should.have.been.called;
        Backbone.BasicAuth.clear.restore();
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
      // @TODO: Clear keychain credentials test
      // @TODO: Clear any localStorage test
   });
  });

});
