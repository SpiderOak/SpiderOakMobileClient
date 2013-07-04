/*jshint expr:true */
describe('ShareRoomModel', function() {
  beforeEach(function() {
    this.username = "tester";
    this.b32username = spiderOakApp.b32nibbler.encode(this.username)
    this.urlBase = "https://spideroak.com/";
    this.share_id = "TestShareRoom";
    this.b32_share_id = spiderOakApp.b32nibbler.encode(this.share_id);
    this.room_key = "thekey";
    this.collection = {
      // Return null for any .get(), so .composedUrl() resorts to .urlBase:
      get: function() { return null; },
      urlBase: this.urlBase,
    }
    this.model = new spiderOakApp.ShareRoomModel({
      name: "Test ShareRoom",
      share_id: "TestShareRoom",
      room_key: this.room_key,
      urlRoot: this.urlBase
    }, {
      collection: this.collection,
    });
    this.shouldBeComposedUrl =
        this.urlBase + this.b32_share_id + "/" + this.room_key + "/" +
        "?auth_required_format=json";
  });

  describe('instantiation', function() {
    it('should have a name', function() {
      this.model.get("name").should.be.a("string");
      this.model.get("name").should.equal("Test ShareRoom");
    });
    it('should have a share_id', function() {
      this.model.get("share_id").should.be.a("string");
      this.model.get("share_id").should.equal("TestShareRoom");
    });
    it('should have a room_key', function() {
      this.model.get("room_key").should.be.a("string");
      this.model.get("room_key").should.equal(this.room_key);
    });
    it('should have a proper url value', function() {
      this.model.url.should.be.a("string");
      this.model.url.should.equal(this.shouldBeComposedUrl);
    });
    it('should have a proper .composedUrl() value', function() {
      this.model.composedUrl().should.be.a("string");
      this.model.composedUrl().should.equal(this.shouldBeComposedUrl);
    });
  });
  describe('PublicShareRoomModel', function() {
    beforeEach(function() {
      this.share_id = "TestPublicShareRoom";
      this.b32_share_id = spiderOakApp.b32nibbler.encode(this.share_id);
      this.room_key = "thekey";
      this.model = new spiderOakApp.PublicShareRoomModel({
        name: "Test Public ShareRoom",
        share_id: this.share_id,
        room_key: this.room_key,
        urlRoot: this.urlBase
      }, {
        collection: this.collection,
      });
      this.shouldBeComposedUrl =
          this.urlBase + this.b32_share_id + "/" + this.room_key + "/" +
          "?auth_required_format=json";
    });
    it('should have a proper url value', function() {
      this.model.url.should.be.a("string");
      // Full path because we're setting urlRoot for the tests:
      this.model.url.should.equal(this.shouldBeComposedUrl);
    });
    it('should have a proper .composedUrl() value', function() {
      this.model.composedUrl().should.be.a("string");
      this.model.composedUrl().should.equal(this.shouldBeComposedUrl);
    });

    describe('Remembering and forgetting', function() {
      beforeEach(function() {
        helper.suspendLocalStorage();
      });
      afterEach(function() {
        helper.resumeLocalStorage();
      });
      it('should ask its collection to .saveRetainedRecords() on ' +
         ' retention changes',
         function() {
           this.saveRetainedRecordsSpy = sinon.spy();
           this.model.collection = {
             saveRetainedRecords: this.saveRetainedRecordsSpy
           };
           this.saveRetainedRecordsSpy.should.not.have.been.called;
           this.model.set("remember",
                          this.model.get("remember") === 0 ? 1 : 0);
           this.saveRetainedRecordsSpy.should.have.been.called;
         });
    });

    describe('Password protection', function() {
      beforeEach(function() {
        helper.suspendLocalStorage();
        this.server = sinon.fakeServer.create();
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.server.respondWith(
          "GET",
          this.shouldBeComposedUrl,
          [
            200,
            {"Content-Type": "text/html"},
            '{"password_required": true}'
          ]
        );
        // Simulate authorization failure if missing auth_requres query string:
        this.server.respondWith(
          "GET",
          // Sans the '?auth_required_format=json' query string:
          this.shouldBeComposedUrl.split('\?')[0],
          [
            401,
            {"Content-Type": "text/html"},
            'Not found'
          ]
        );
      });
      afterEach(function() {
        helper.resumeLocalStorage();
      });
      it('should detect password-protected shareroom needing absent password',
         function() {
           this.model.get("password_required").should.be.false;
           this.model.fetch({success: this.successSpy,
                             error:
                             function(model, xhr, options) {
                               this.errorSpy;
                             },
                            });
           this.server.respond();
           this.successSpy.calledWithMatch(200);
           this.model.get("password_required").should.be.true;
         });
      it('should get content when fetching password-protected with password',
         function() {
         });
    });
  });
});
