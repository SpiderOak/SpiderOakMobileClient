/*jshint expr:true */
describe('FileModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.content = {
        name: "filename.pdf",
        url: "filename.pdf",
        ctime: 1359167989,
        etime: 1359167998,
        mtime: 1359167946,
        size: 255434,
        versions: 2
      };
      this.model = new spiderOakApp.FileModel(
        this.content,
        {
          collection: this.collection
        });
    });
    it('should have a name', function() {
      this.model.get("name").should.be.a("string");
      this.model.get("name").should.equal(this.content.name);
    });
    it('should have a URL', function() {
      this.model.get("url").should.be.a("string");
      this.model.get("url").should.equal(this.content.url);
    });
    it('should have a ctime', function() {
      this.model.get("ctime").should.be.a("number");
      this.model.get("ctime").should.equal(this.content.ctime);
      var dateFromTimestamp = new Date(this.model.get("ctime") * 1000);
      dateFromTimestamp.should.be.a("Date");
      dateFromTimestamp.should.be.above(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have an etime', function() {
      this.model.get("etime").should.be.a("number");
      this.model.get("etime").should.equal(this.content.etime);
      var dateFromTimestamp = new Date(this.model.get("etime") * 1000);
      dateFromTimestamp.should.be.a("Date");
      dateFromTimestamp.should.be.above(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have an mtime', function() {
      this.model.get("mtime").should.be.a("number");
      this.model.get("mtime").should.equal(this.content.mtime);
      var dateFromTimestamp = new Date(this.model.get("mtime") * 1000);
      dateFromTimestamp.should.be.a("Date");
      dateFromTimestamp.should.be.above(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have a size', function() {
      this.model.get("size").should.be.a("number");
      this.model.get("size").should.equal(this.content.size);
    });
  });
  describe('fetching', function() {
    beforeEach(function() {
      window.spiderOakApp.initialize()
      this.content = {
        name: "filename.pdf",
        url: "filename.pdf",
        ctime: 1359167989,
        etime: 1359167998,
        mtime: 1359167946,
        size: 255434,
        versions: 2
      };
      this.server = sinon.fakeServer.create();
      this.password = "a file password";
      this.model = new spiderOakApp.FileModel();
      this.requestUrl = ("https://spideroak.com/SOME/CONTENT/PATH/" +
                         this.content.filename +
                         "?auth_required_format=json");
      this.model.url = this.requestUrl;
    });
    it('should fetch unrestricted content simply', function () {
      this.server.respondWith(
        "GET",
        this.requestUrl,
        [
          200,
          {"Content-Type": "application/json"},
          JSON.stringify(this.content)
        ]
      );
      this.model.fetch()
      this.server.respond();
      this.model.get("name").should.equal(this.content.name);
      this.model.get("ctime").should.equal(this.content.ctime);
      var dateFromTimestamp = new Date(this.model.get("ctime") * 1000);
      dateFromTimestamp.should.be.a("Date");
      dateFromTimestamp.should.be.above(
        Date.parse("1970-01-01T00:00:00Z")
      );
      // etc...
    });
    describe('password-protected', function () {
      beforeEach(function () {
        this.model = new spiderOakApp.FileModel(
          {
            collection: this.collection
          });
        this.model.url = this.requestUrl;
        var responder = function (request) {
          if (request.url === this.requestUrl &&
              request.hasOwnProperty("requestHeaders") &&
              request.requestHeaders.Authorization ===
                "Basic Ymxhbms6YSBmaWxlIHBhc3N3b3Jk") {
            request.respond(
              200,
              {"Content-Type": "application/json"},
              JSON.stringify(this.content)
            );
          }
          else if (request.url === this.requestUrl) {
            // Password needed, and "...?auth_required_format=json" provokes
            // a content-based prompt for auth:
            request.respond(
              200,
              {"Content-Type": "application/json"},
              '{"password_required": true}'
            );
          }
          else if (request.url === this.requestUrl.split('\?')[0]) {
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
      it('should recognize protected content needing absent password',
         function() {
           this.model.get("password_required").should.be.false;
           this.model.fetch();
           this.server.respond();
           this.server.requests[0].status.should.equal(200);
           this.model.get("password_required").should.be.true;
           chai.expect(this.model.get("name")).to.equal(undefined);
         });
      it('should get protected content when fetching with correct password',
         function() {
           this.model.setPassword(this.password);
           this.model.getPassword().should.equal(this.password);
           this.model.fetch();
           this.server.respond();
           this.server.requests[0].status.should.equal(200);
           this.model.get("name").should.equal(this.content.name);
           this.model.get("size").should.equal(this.content.size);
         });
    });
  });
});
