/*jshint expr:true */
describe('FileVersionModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.model = new spiderOakApp.FileVersionModel({
        url: "filename.pdf?version=1",
        name: "filename.pdf",
        size: 255434,
        ctime: 1359167989,
        mtime: 1359167946
      });
    });
    it('should have a name', function() {
      this.model.get("name").should.be.a("string");
      this.model.get("name").should.equal("filename.pdf");
    });
    it('should have a URL', function() {
      this.model.get("url").should.be.a("string");
      this.model.get("url").should.equal("filename.pdf?version=1");
    });
    it('should have a ctime', function() {
      this.model.get("ctime").should.be.a("number");
      this.model.get("ctime").should.equal(1359167989);
      var dateFromTimestamp = new Date(this.model.get("ctime") * 1000);
      dateFromTimestamp.should.be.a("Date");
      dateFromTimestamp.should.be.above(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have an mtime', function() {
      this.model.get("mtime").should.be.a("number");
      this.model.get("mtime").should.equal(1359167946);
      var dateFromTimestamp = new Date(this.model.get("mtime") * 1000);
      dateFromTimestamp.should.be.a("Date");
      dateFromTimestamp.should.be.above(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have a size', function() {
      this.model.get("size").should.be.a("number");
      this.model.get("size").should.equal(255434);
    });
  });
});