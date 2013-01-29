describe('AccountModel', function() {
  describe('login/logout', function() {
    beforeEach(function(){
      this.server = sinon.fakeServer.create();
      this.username = "testusername";
      this.b32username = "ORSXG5DVONSXE3TBNVSQ"; // nibbler b32 of "testusername"
      this.password = "testpassword";
      this.accountModel = new spiderOakApp.AccountModel();
    });

    afterEach(function() {
      this.accountModel = undefined;
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
        expect(this.server.requests[0].method).toEqual("POST");
      });
      it('should use the expected login start url', function() {
        expect(this.server.requests[0].url)
          .toEqual("https://spideroak.com/browse/login");
      });
      // @TODO: There must be a better way to check query parameters?
      it('should pass the username as query data', function() {
        expect(this.server.requests[0].requestBody
          .match("username=" + this.username)).toBeTruthy();
      });
      it('should pass the password as query data', function() {
        expect(this.server.requests[0].requestBody
          .match("password=" + this.password)).toBeTruthy();
      });
      it('should set accountModel rememberme attribute to false by default',
        function() {
          expect(this.accountModel.get("rememberme")).toBeFalsy();
        }
      );
      it('should be able to set accountModel rememberme attribute to true',
        function() {
          this.accountModel.set("rememberme",true);
          expect(this.accountModel.get("rememberme")).toBeTruthy();
        }
      );
      it('should call the default success callback', function() {
        expect(this.successSpy.calledOnce).toBeTruthy();
        expect(this.successSpy.calledWith(
          "https://spideroak.com/"
        )).toBeTruthy();
      });
      it('should set accountModel b32username upon successful login',
        function() {
          expect(this.accountModel.get("b32username"))
            .toEqual(this.b32username);
        }
      );
    });

    describe('backbone basic authentication', function() {
      it('should set Backbone.BasicAuth', function() {
        runs(function() {
          spyOn(Backbone.BasicAuth,'set');
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
        });
        waitsFor(function() {
          return (Backbone.BasicAuth.set.calls.length > 0);
        },"Backbone.BasicAuth.set to be called once",10);
        runs(function() {
          expect(Backbone.BasicAuth.set).toHaveBeenCalledWith(this.username,
                                                              this.password);
        });
      });
    });

    describe('unsuccessful basic login', function() {
      beforeEach(function(){
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.accountModel.login(this.username, this.password, this.successSpy, this.errorSpy);
        this.server.respond();
      });
      it('should call the error callback', function() {
        // default 404 is a decent enough error
        expect(this.errorSpy.calledOnce).toBeTruthy();
        expect(this.errorSpy.calledWith(
          404, "authentication failed"
        )).toBeTruthy();
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
        expect(this.server.requests[1].method).toEqual("POST");
      });
      it('should call the alternate success callback', function() {
        expect(this.successSpy.calledOnce).toBeTruthy();
        expect(this.successSpy.calledWith(
          "https://alternate-dc.spideroak.com/"
        )).toBeTruthy();
      });
      it('should set accountModel b32username upon successful alternate login', function() {
        expect(this.accountModel.get("b32username")).toEqual(this.b32username);
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
        this.accountModel.login(this.username, this.password, this.successSpy, this.errorSpy);
        this.server.respond();
      });
      it('should call the error callback', function() {
        // default 404 is a decent enough error
        expect(this.errorSpy.calledOnce).toBeTruthy();
        expect(this.errorSpy.calledWith(
          404, "authentication failed"
        )).toBeTruthy();
      });
    });

    describe('logout', function() {
      beforeEach(function(){
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.server.respondWith(
          "POST",
          "https://spideroak.com/storage/"+this.b32username+"/login",
          [200, {"Content-Type": "text/html"}, "location:/some/location"]
        );
        this.accountModel.login(this.username, this.password, this.successSpy, this.errorSpy);
        this.server.respond();
      });
      it('should clear BackBone.BasicAuth', function() {
        runs(function() {
          spyOn(Backbone.BasicAuth,'clear');
          this.accountModel.logout(function(){});
        });
        waitsFor(function() {
          return (Backbone.BasicAuth.clear.calls.length > 0);
        },"Backbone.BasicAuth.clear to be called once",10);
        runs(function() {
          expect(Backbone.BasicAuth.clear).toHaveBeenCalled();
        });
      });
      // @TODO: Clear keychain credentials test
      // @TODO: Clear any localStorage test
      // @TODO: Clear out cookie if required
    });
  });

});
