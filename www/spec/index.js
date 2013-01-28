describe('Application setup', function() {
  describe('components', function() {
    describe('yepnope', function() {
      it('should have yepnope', function() {
        expect(window.yepnope).toBeDefined();
      });
    });

    describe('zepto', function() {
      it('should have zepto', function() {
        expect(window.$).toBeDefined();
        // not only should $ exist, but $ should be Zepto, not jQuery...
        expect(window.$).toEqual(window.Zepto);
      });
    });

    describe('underscore', function() {
      it('should have underscore', function() {
        expect(window._).toBeDefined();
      });
    });

    describe('backbone', function() {
      it('should have backbone', function() {
        expect(window.Backbone).toBeDefined();
      });
      it('should have backbone.basicauth', function() {
        expect(window.Backbone.BasicAuth).toBeDefined();
      });
    });

    describe('sinon', function() {
      it('should have sinon', function() {
        expect(window.sinon).toBeDefined();
      });
      it('should have sinon spies', function() {
        expect(window.sinon.spy).toBeDefined();
      });
      it('should have sinon mocks', function() {
        expect(window.sinon.mock).toBeDefined();
      });
      it('should have sinon stubs', function() {
        expect(window.sinon.stub).toBeDefined();
      });
    });

    describe('nibbler', function() {
      it('should have nibbler', function() {
        expect(window.Nibbler).toBeDefined();
      });
      it('should properly encode a username or share id',function() {
        // "my_share_id" -> "NV4V643IMFZGKX3JMQ"
        //   as described here:
        //   https://spideroak.com/faq/questions/37/how_do_i_use_the_spideroak_web_api/
        var share_id = "my_share_id";
        var nibbler = new window.Nibbler({
          dataBits: 8,
          codeBits: 5,
          keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
          pad: ''
        });
        var encoded_share_id = nibbler.encode(share_id);
        expect(encoded_share_id).toBe("NV4V643IMFZGKX3JMQ");
      });
    });

    describe('jQTouch', function() {
      it('should have jqtouch', function() {
        expect(window.$.jQTouch).toBeDefined();
      });
      it('should have jqtouch menusheet', function() {
        expect(window.$.fn.menusheet).toBeDefined();
      });
    });
  });

  describe('initialize', function() {
    it('should have spiderOakApp', function() {
      expect(window.spiderOakApp).toBeDefined();
    });
    
    it('should bind deviceready', function() {
      runs(function(){
        spyOn(spiderOakApp,'onDeviceReady');
        spiderOakApp.initialize();
        helper.trigger(window.document,'deviceready');
      });
      
      waitsFor(function(){
        return (spiderOakApp.onDeviceReady.calls.length > 0);
      }, "deviceready to be called once", 10);
      
      runs(function(){
        expect(spiderOakApp.onDeviceReady).toHaveBeenCalled();
      });
    });
  });

});

describe('AccountModel', function() {
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
        "https://spideroak.com/storage/"+this.b32username+"/login",
        [200, {"Content-Type": "text/html"}, "location:/some/location"]
      );
      this.accountModel.login(this.username, this.password, this.successSpy, this.errorSpy);
      this.server.respond();
    });
    it('should call the server using POST', function() {
      expect(this.server.requests[0].method).toEqual("POST");
    });
    it('should properly encode the username', function() {
      expect(this.server.requests[0].url).toEqual("https://spideroak.com/storage/ORSXG5DVONSXE3TBNVSQ/login");
    });
    it('should set accountModel rememberme attribute to false by default', function() {
      expect(this.accountModel.get("rememberme")).toBeFalsy();
    });
    it('should be able to set accountModel rememberme attribute to true', function() {
      this.accountModel.set("rememberme",true);
      expect(this.accountModel.get("rememberme")).toBeTruthy();
    });
    it('should call the default success callback', function() {
      expect(this.successSpy.calledOnce).toBeTruthy();
      expect(this.successSpy.calledWith(
        "https://spideroak.com/"
      )).toBeTruthy();
    });
    it('should set accountModel b32username upon successful login', function() {
      expect(this.accountModel.get("b32username")).toEqual(this.b32username);
    });
  });
  
  describe('backbone basic authentication', function() {
    it('should set Backbone.BasicAuth', function() {
      runs(function() {
        spyOn(Backbone.BasicAuth,'set');
        this.accountModel.login(this.username, this.password, function(){}, function(){});
        this.server.respondWith(
          "POST",
          "https://spideroak.com/storage/"+this.b32username+"/login",
          [200, {"Content-Type": "text/plain"}, "location:/some/location"]
        );
        this.server.respond();
      });
      waitsFor(function() {
        return (Backbone.BasicAuth.set.calls.length > 0);
      },"Backbone.BasicAuth.set to be called once",10);
      runs(function() {
        expect(Backbone.BasicAuth.set).toHaveBeenCalledWith(this.username, this.password);
      });
    });
  });

  describe('successful alternate login', function() {
    beforeEach(function(){
      this.successSpy = sinon.spy();
      this.errorSpy = sinon.spy();
      this.server.respondWith(
        "POST",
        "https://spideroak.com/storage/"+this.b32username+"/login",
        [200, {"Content-Type": "text/html"}, "login:https://alternate-dc.spideroak.com/"+this.b32username+"/login"]
      );
      this.server.respondWith(
        "POST",
        "https://alternate-dc.spideroak.com/"+this.b32username+"/login",
        [200, {"Content-Type": "text/html"}, "location:/some/other/location"]
      );
      this.accountModel.login(this.username, this.password, this.successSpy, this.errorSpy);
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

  describe('unsuccessful basic login', function() {
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
  });

});
