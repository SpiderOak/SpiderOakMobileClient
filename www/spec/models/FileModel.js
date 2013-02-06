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
      expect(this.model.get("name")).toBeDefined();
      expect(this.model.get("name")).toEqual("filename.pdf");
    });
    it('should have a URL', function() {
      expect(this.model.get("url")).toBeDefined();
      expect(this.model.get("url")).toEqual("filename.pdf");
    });
    it('should have a ctime', function() {
      expect(this.model.get("ctime")).toBeDefined();
      expect(this.model.get("ctime")).toEqual(1359167989);
      var dateFromTimestamp = new Date(this.model.get("ctime") * 1000);
      expect(dateFromTimestamp).toBeTruthy();
      expect(dateFromTimestamp).toBeGreaterThan(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have an etime', function() {
      expect(this.model.get("etime")).toBeDefined();
      expect(this.model.get("etime")).toEqual(1359167998);
      var dateFromTimestamp = new Date(this.model.get("etime") * 1000);
      expect(dateFromTimestamp).toBeTruthy();
      expect(dateFromTimestamp).toBeGreaterThan(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have an mtime', function() {
      expect(this.model.get("mtime")).toBeDefined();
      expect(this.model.get("mtime")).toEqual(1359167946);
      var dateFromTimestamp = new Date(this.model.get("mtime") * 1000);
      expect(dateFromTimestamp).toBeTruthy();
      expect(dateFromTimestamp).toBeGreaterThan(
        Date.parse("1970-01-01T00:00:00Z")
      );
    });
    it('should have a size', function() {
      expect(this.model.get("size")).toBeDefined();
      expect(this.model.get("size")).toEqual(255434);
    });
  });
});
