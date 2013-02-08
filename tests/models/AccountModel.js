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
        expect(this.server.requests[0].method).to.equal("POST");
      });
      it('should use the expected login start url', function() {
        expect(this.server.requests[0].url)
          .to.equal("https://spideroak.com/browse/login");
      });
      // @TODO: There must be a better way to check query parameters?
      it('should pass the username as query data', function() {
        var match = this.server.requests[0].requestBody
          .match("username=" + this.username);
        expect(match).to.be.an("Array");
        expect(match).to.have.length(1);
      });
      it('should pass the password as query data', function() {
        var match = this.server.requests[0].requestBody
          .match("password=" + this.password);
        expect(match).to.be.an("Array");
        expect(match).to.have.length(1);
      });
      it('should set accountModel rememberme attribute to false by default',
        function() {
          expect(this.accountModel.get("rememberme")).to.equal(false);
        }
      );
      it('should be able to set accountModel rememberme attribute to true',
        function() {
          this.accountModel.set("rememberme",true);
          expect(this.accountModel.get("rememberme")).to.equal(true);
        }
      );
      it('should call the default success callback', function() {
        expect(this.successSpy.calledOnce).to.equal(true);
        expect(this.successSpy.calledWith(
          "https://spideroak.com/"
        )).to.equal(true);
      });
      it('should set accountModel b32username upon successful login',
        function() {
          expect(this.accountModel.get("b32username"))
            .to.equal(this.b32username);
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
        expect(this.successSpy.calledOnce).to.equal(true);
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
          console.log("yop");
//          expect(Backbone.BasicAuth.set.calledWith(this.username,this.password))
//            .to.equal(true);
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
        expect(this.errorSpy.calledOnce).to.equal(true);
        expect(this.errorSpy.calledWith(
          404, "authentication failed"
        )).to.equal(true);
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
        expect(this.server.requests[1].method).to.equal("POST");
      });
      it('should call the alternate success callback', function() {
        expect(this.successSpy.calledOnce).to.equal(true);
        expect(this.successSpy.calledWith(
          "https://alternate-dc.spideroak.com/"
        )).to.equal(true);
      });
      it('should set accountModel b32username upon successful alternate login',
        function() {
          expect(this.accountModel.get("b32username")).to.equal(this.b32username);
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
        expect(this.errorSpy.calledOnce).to.equal(true);
        expect(this.errorSpy.calledWith(
          404, "authentication failed"
        )).to.equal(true);
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
        expect(Backbone.BasicAuth.clear.called).to.equal(true);
        Backbone.BasicAuth.clear.restore();
      });
      it("should POST to the account's logout URL", function() {
          this.successSpy = sinon.spy();
          this.accountModel.logout(this.successSpy);
          this.server.respond();
          // Be sure to check against the LAST request.
          //  as there might be other requests involved in logging in
          var lastIndex = (this.server.requests.length - 1);
          expect(this.server.requests[lastIndex].status)
            .to.equal(200);
      });
      // @TODO: Clear keychain credentials test
      // @TODO: Clear any localStorage test
   });
  });

});
