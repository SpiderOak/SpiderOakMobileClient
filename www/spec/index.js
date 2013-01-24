describe('spiderOakApp', function() {
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
      // Since these are individual scripts, test for them as well
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
      }, "deviceready should be called once", 500);
      
      runs(function(){
        expect(spiderOakApp.onDeviceReady).toHaveBeenCalled();
      });
    });
  });

});
