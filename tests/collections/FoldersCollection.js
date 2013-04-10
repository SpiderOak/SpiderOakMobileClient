/*jshint expr:true */
describe('FoldersCollection', function() {
  beforeEach(function() {
    this.server = sinon.fakeServer.create();
    this.b32username = "ORSXG5DVONSXE3TBNVSQ"; // nibbler b32 of "testusername"
  });
  afterEach(function() {
    this.server.restore();
  });
  describe('Fetching', function() {
    beforeEach(function() {
      this.successSpy = sinon.spy();
      this.errorSpy = sinon.spy();
      this.server.respondWith(
        "GET",
        "https://spideroak.com/storage/" + this.b32username +
          "/Test%20device/test/",
        [
          200,
          {"Content-Type": "text/html"},
          '{"dirs": [["test folder/", "test%20folder/"], ["tmp/", "tmp/"] ],'+
            ' "files": [{"ctime": 1359167989, "etime": 1359167998, '+
            '"mtime": 1359167946, "name": "filename.pdf", "size": 255434, '+
            '"url": "filename.pdf", "versions": 2 } ] }'
        ]
      );
      this.collection = new spiderOakApp.FoldersCollection();
      this.collection.url = "https://spideroak.com/storage/" +
                                    this.b32username + "/Test%20device/test/";
      this.collection.fetch({
        success: this.successSpy,
        error: this.errorSpy
      });
      this.server.respond();
    });
    it('should fetch from the server using GET', function() {
      this.server.requests[0].method.should.equal("GET");
    });
    it('should use the expected url', function() {
      this.server.requests[0].url
        .should.equal("https://spideroak.com/storage/" +
                      this.b32username +
                      "/Test%20device/test/");
    });
    it('should fetch the model(s)', function() {
      var model = this.collection.at(0);
      this.successSpy.should.have.been.calledOnce;
      this.collection.models.length.should.equal(2);
    });
    it('should populate with FolderModel instance(s)', function() {
      var model = this.collection.at(0);
      model.should.be.instanceOf(spiderOakApp.FolderModel);
    });
    it('should asign the correct attributes in the model(s)', function() {
      var model = this.collection.at(0);
      // Note: trailing slash on "name" stripped during fetch
      model.get("name").should.equal("test folder");
      model.get("url").should.equal("test%20folder/");
    });
  });
});
