describe('Application setup', function() {
  describe('components', function() {
    describe('yepnope', function() {
      it('should have yepnope', function() {
        expect(window.yepnope).to.be.a('function');
      });
    });

    describe('zepto', function() {
      it('should have zepto', function() {
        expect(window.$).to.be.a('function');
        // not only should $ exist, but $ should be Zepto, not jQuery...
        expect(window.$).to.equal(window.Zepto);
      });
    });

    describe('underscore', function() {
      it('should have underscore', function() {
        expect(window._).to.be.a('function');
      });
    });

    describe('backbone', function() {
      it('should have backbone', function() {
        expect(window.Backbone).to.be.an('object');
      });
      it('should have backbone.basicauth', function() {
        expect(window.Backbone.BasicAuth).to.be.an('object');
      });
    });

    describe('sinon', function() {
      it('should have sinon', function() {
        expect(window.sinon).to.be.an('object');
      });
      it('should have sinon spies', function() {
        expect(window.sinon.spy).to.be.a('function');
      });
      it('should have sinon mocks', function() {
        expect(window.sinon.mock).to.be.a('function');
      });
      it('should have sinon stubs', function() {
        expect(window.sinon.stub).to.be.a('function');
      });
    });

    describe('nibbler', function() {
      it('should have nibbler', function() {
        expect(window.Nibbler).to.be.a('function');
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
        expect(encoded_share_id).to.equal("NV4V643IMFZGKX3JMQ");
      });
    });

    describe('jQTouch', function() {
      it('should have jqtouch', function() {
        expect(window.$.jQTouch).to.be.a('function');
      });
      it('should have jqtouch menusheet', function() {
        expect(window.$.fn.menusheet).to.be.a('function');
      });
    });
  });

  describe('initialize', function() {
    beforeEach(function() {
      sinon.spy(window.spiderOakApp, "onDeviceReady");
    });
    afterEach(function() {
      window.spiderOakApp.onDeviceReady.restore();
    });
    it('should have spiderOakApp', function() {
      expect(window.spiderOakApp).to.be.an('object');
    });
    
    it('should bind deviceready', function() {
      window.spiderOakApp.initialize();
      helper.trigger(window.document,'deviceready');
      expect(window.spiderOakApp.onDeviceReady.called).to.equal(true);
    });
  });

});


