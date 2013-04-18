/*jshint expr:true */
describe('FileItemVersionsCollection', function() {
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
          "/Test%20device/test/filename.pdf?format=version_info",
        [
          200,
          {"Content-Type": "text/html"},
          '[{ "url": "filename.pdf?version=0", "name": "filename.pdf", "size": 255434,' +
            '"ctime": 1359167989, "mtime": 1359167946,' +
            '"preview_800": "filename.pdf?version=0&preview_800"},{' +
            '"url": "filename.pdf?version=1", "name": "filename.pdf", "size": 255454,' +
            '"ctime": 1359167989, "mtime": 1359167946,' +
            '"preview_800": "filename.pdf?version=1&preview_800" }]'
        ]
      );
      this.collection = new spiderOakApp.FileItemVersionsCollection();
      this.collection.url = "https://spideroak.com/storage/" +
                                    this.b32username +
                                    "/Test%20device/test/filename.pdf" +
                                    "?format=version_info";
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
                      "/Test%20device/test/filename.pdf" +
                      "?format=version_info");
        console.log(this.server.responses[0]);
    });
    it('should fetch the model(s)', function() {
      var model = this.collection.at(0);
      this.successSpy.should.have.been.calledOnce;
      this.collection.models.length.should.equal(2);
    });
    it('should populate with FileModel instance(s)', function() {
      var model = this.collection.at(0);
      model.should.be.instanceOf(spiderOakApp.FileModel);
    });
    it('should assign the correct attributes in the model(s)', function() {
      var model = this.collection.at(0);
      model.get("name").should.equal("filename.pdf");
      model.get("url").should.equal("filename.pdf?version=0");
      model.get("ctime").should.equal(1359167989);
      model.get("mtime").should.equal(1359167946);
      model.get("size").should.equal(255434);
    });
    it('should assign the correct additional attributes in the model(s)', function() {
      var model = this.collection.at(0);
      model.get("description").should.equal("Adobe PDF");
      model.get("icon").should.equal("file-pdf");
      model.get("openInternally").should.equal(false);
      model.get("type").should.equal("application/pdf");
    });
  });
});