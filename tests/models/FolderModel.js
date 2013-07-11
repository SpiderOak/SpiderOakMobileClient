/*jshint expr:true */
describe('FolderModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.content = {
        name: "foldername",
        url: "foldername/",
      };
      this.model = new spiderOakApp.FolderModel(this.content);
    });
    it('should have a name', function() {
      this.model.get("name").should.be.a("string");
      this.model.get("name").should.equal(this.content.name);
    });
    it('should have a URL setting', function() {
      this.model.get("url").should.be.a("string");
      this.model.get("url").should.equal(this.content.url);
    });
  });
  describe('fetching', function() {
    beforeEach(function() {
      window.spiderOakApp.initialize()
      this.content = {
        name: "foldername",
        url: "foldername/",
      };
      this.server = sinon.fakeServer.create();
      this.password = "a folder password";
      this.requestUrl = ("https://spideroak.com/SOME/CONTENT/PATH/" +
                         this.content.url +
                         "?auth_required_format=json");
      this.model = new spiderOakApp.FolderModel();
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
      this.successSpy = sinon.spy();
      this.model.fetch({success: this.successSpy})
      this.server.respond();
      this.successSpy.should.have.been.called.once;
      this.model.get("name").should.equal(this.content.name);
      this.model.get("url").should.equal(this.content.url);
    });
    describe('password-protected', function () {
      beforeEach(function () {
        this.content = {
          name: "foldername",
          url: "foldername/",
        };
        this.requestUrl = ("https://spideroak.com/SOME/CONTENT/PATH/" +
                           this.content.url +
                           "?auth_required_format=json");
        this.model = new spiderOakApp.FolderModel();
        this.model.url = this.requestUrl;
        var responder = function (request) {
          if (request.url === this.requestUrl &&
              request.hasOwnProperty("requestHeaders") &&
              request.requestHeaders.Authorization ===
                "Basic Ymxhbms6YSBmb2xkZXIgcGFzc3dvcmQ=") {
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
      it('should get protected content when fetching with password',
         function() {
           this.model.setPassword(this.password);
           this.model.getPassword().should.equal(this.password);
           this.model.fetch();
           this.server.respond();
           this.server.requests[0].status.should.equal(200);
           this.model.get("name").should.equal(this.content.name);
         });
    });
  });
});
