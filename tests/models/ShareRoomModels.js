/*jshint expr:true */
describe('ShareRoomModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.urlBase = "https://spideroak.com/";
      this.share_id = "TestShareRoom";
      this.b32_share_id = spiderOakApp.b32nibbler.encode(this.share_id);
      this.room_key = "thekey";
      this.model = new spiderOakApp.ShareRoomModel({
        name: "Test ShareRoom",
        share_id: "TestShareRoom",
        room_key: "thekey"
      });
      this.collection = {
        // Return null for any .get(), so .composedUrl() resorts to .urlBase:
        get: function() { return null; },
        urlBase: this.urlBase
      }
      this.model.collection = this.collection;
      this.model.shouldBeComposedUrl =
          this.urlBase + this.b32_share_id + "/" + this.room_key + "/" +
          "?auth_required_format=json";
    });
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
      this.model.get("room_key").should.equal("thekey");
    });
    it('should have a proper URL', function() {
      this.model.get("url").should.be.a("string");
      this.model.get("url")
          .should.equal("KRSXG5CTNBQXEZKSN5XW2/thekey/");
    });
    it('should have a proper .composedUrl() value', function() {
      this.model.composedUrl().should.be.a("string");
      this.model.composedUrl().should.equal(
        this.model.shouldBeComposedUrl
      );
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
        room_key: this.room_key
      });
      this.model.collection = this.collection;
      this.model.shouldBeComposedUrl =
          this.urlBase + this.b32_share_id + "/" + this.room_key + "/" +
          "?auth_required_format=json";
    });
    it('should have a proper URL', function() {
      this.model.get("url").should.be.a("string");
      this.model.get("url")
          .should.equal("KRSXG5CQOVRGY2LDKNUGC4TFKJXW63I/thekey/");
    });
    it('should have a proper .composedUrl()', function() {
      this.model.composedUrl().should.be.a("string");
      this.model.composedUrl().should.equal(
        this.model.shouldBeComposedUrl
      );
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

    describe('Password protected provision', function() {
      beforeEach(function() {
        helper.suspendLocalStorage();
        this.username = "tester";
        this.b32username = spiderOakApp.b32nibbler.encode(this.username)
        this.shares_root = (this.model.urlBase + "share/" +
                            this.b32username +
                            "/");
        this.server = sinon.fakeServer.create();
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        this.server.respondWith(
          "GET",
          this.shares_root + "?auth_required_format=json",
          [
            200,
            {"Content-Type": "text/html"},
            '{"password_required": true}'
          ]
        );
        this.server.respondWith(
          "GET",
          this.shares_root,
          [
            401,
            {"Content-Type": "text/html"},
            ''
          ]
        )
        this.server.respond();
      });
      afterEach(function() {
        helper.resumeLocalStorage();
      });
      it('should discern password is required when fetching without it',
         function() {
           this.model.get("password_required").should.be.false;
           this.model.fetch({success:
                             function(model, resp, options) {
                               this.successSpy(resp);
                             },
                             error: 
                             function(xhr, errorType, error) {
                               this.errorSpy(xhr, error);
                             },
                            });
           this.model.get("password_required").should.be.true;
           this.server.reset();
         });
      it('should get the content, when fetching with the password',
         function() {
         });
    });
  });
});
