describe('FolderModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.model = new spiderOakApp.FolderModel({
        name: "Test device",
        url: "Test%20device/"
      });
    });
    it('should have a name', function() {
      expect(this.model.get("name")).toBeDefined();
      expect(this.model.get("name")).toEqual("Test device");
    });
    it('should have a URL', function() {
      expect(this.model.get("url")).toBeDefined();
      expect(this.model.get("url")).toEqual("Test%20device/");
    });
  });
});
