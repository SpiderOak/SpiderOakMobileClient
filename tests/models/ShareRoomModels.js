/*jshint expr:true */
describe('ShareRoomModel', function() {
  beforeEach(function() {
    this.username = "tester";
    this.b32username = window.spiderOakApp.b32nibbler.encode(this.username)
    this.urlBase = "https://spideroak.com/";
    this.share_id = "TestShareRoom";
    this.b32_share_id = window.spiderOakApp.b32nibbler.encode(this.share_id);
    this.room_key = "thekey";
    this.collection = {
      // Return null for any .get(), so .composedUrl() resorts to .urlBase:
      get: function() { return null; },
      urlBase: this.urlBase,
    }
    this.model = new window.spiderOakApp.ShareRoomModel({
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
      this.b32_share_id = window.spiderOakApp.b32nibbler.encode(this.share_id);
      this.room_key = "thekey";
      this.pubSharePassword = "thepassword";
      this.model = new window.spiderOakApp.PublicShareRoomModel({
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
        window.spiderOakApp.initialize()
        this.server = sinon.fakeServer.create();
        this.successSpy = sinon.spy();
        this.errorSpy = sinon.spy();
        var responder = function (request) {
          if (request.hasOwnProperty("requestHeaders") &&
              request.requestHeaders.Authorization ===
              "Basic Ymxhbms6dGhlcGFzc3dvcmQ=") {
            request.respond(
              200,
              {"Content-Type": "application/json"},
              JSON.stringify(
                {browse_url: "/browse/share/" + this.b32_share_id + "/aroomkey",
                 dirs: [],
                 stats: {
                   room_name: "The fetched name",
                   firstname: "Some",
                   lastname: "Body",
                    number_of_files: 0,
                    number_of_folders: 0,
                    room_description: "The fetched description",
                    room_size: "123 MB",
                    start_date: ""}}
              )
            );
          }
          else if (request.url === this.shouldBeComposedUrl) {
            // Password needed, and "...?auth_required_format=json" provokes
            // a content-based prompt for auth:
            request.respond(
              200,
              {"Content-Type": "application/json"},
              '{"password_required": true}'
            );
          }
          else if (request.url === this.shouldBeComposedUrl.split('\?')[0]) {
            // Password needed, but no "...?auth_required_format=json" means
            // do a 401 Unauthorized response:
            request.respond(
              401,
              {"Content-Type": "text/plain"},
              'Unauthorized'
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
      it('should recognize passworded shareroom needing absent password',
         function() {
           this.model.get("password_required").should.be.false;
           this.model.fetch();
           this.server.respond();
           this.server.requests[0].status.should.equal(200);
           this.model.get("password_required").should.be.true;
         });
      it('should get content when fetching passworded shareroom with password',
         function() {
           this.model.setPassword(this.pubSharePassword);
           this.model.get("password").should.equal(this.pubSharePassword);
           this.model.fetch();
           this.server.respond();
           this.server.requests[0].status.should.equal(200);
           this.model.get("name").should.equal("The fetched name");
           this.model.get("description")
               .should.equal("The fetched description");
         });
      it('should remove fetching content on password removal',
         function() {
           this.model.setPassword(this.pubSharePassword);
           this.model.get("password").should.equal(this.pubSharePassword);
           this.model.fetch();
           this.server.respond();
           this.server.requests[0].status.should.equal(200);
           this.model.get("name").should.equal("The fetched name");
           this.model.removePassword();
           // The only way I've found to assert a value of undefined:
           chai.expect(this.model.get("name")).to.equal(undefined);
         });
    });
  });
});
