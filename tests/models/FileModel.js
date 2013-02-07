describe('FileModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.model = new spiderOakApp.FileModel({
        ctime: 1359167989,
        etime: 1359167998,
        mtime: 1359167946,
        name: "filename.pdf",
        size: 255434,
        url: "filename.pdf",
        versions: 2
      });
    });
    it('should have a name', function() {
      expect(this.model.get("name")).to.be.a("string");
      expect(this.model.get("name")).to.equal("filename.pdf");
    });
    it('should have a URL', function() {
      expect(this.model.get("url")).to.be.a("string");
      expect(this.model.get("url")).to.equal("filename.pdf");
    });
    it('should have a ctime', function() {
      expect(this.model.get("ctime")).to.be.a("number");
      expect(this.model.get("ctime")).to.equal(1359167989);
      var dateFromTimestamp = new Date(this.model.get("ctime") * 1000);
      expect(dateFromTimestamp).to.be.a("Date");
      expect(dateFromTimestamp).to.be.above(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have an etime', function() {
      expect(this.model.get("etime")).to.be.a("number");
      expect(this.model.get("etime")).to.equal(1359167998);
      var dateFromTimestamp = new Date(this.model.get("etime") * 1000);
      expect(dateFromTimestamp).to.be.a("Date");
      expect(dateFromTimestamp).to.be.above(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have an mtime', function() {
      expect(this.model.get("mtime")).to.be.a("number");
      expect(this.model.get("mtime")).to.equal(1359167946);
      var dateFromTimestamp = new Date(this.model.get("mtime") * 1000);
      expect(dateFromTimestamp).to.be.a("Date");
      expect(dateFromTimestamp).to.be.above(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have a size', function() {
      expect(this.model.get("size")).to.be.a("number");
      expect(this.model.get("size")).to.equal(255434);
    });
  });
});
