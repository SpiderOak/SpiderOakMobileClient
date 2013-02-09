/*jshint expr:true */
describe('FolderModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.model = new spiderOakApp.FolderModel({
        name: "Test device",
        url: "Test%20device/"
      });
    });
    it('should have a name', function() {
      this.model.get("name").should.be.a("string");
      this.model.get("name").should.equal("Test device");
    });
    it('should have a URL', function() {
      this.model.get("url").should.be.a("string");
      this.model.get("url").should.equal("Test%20device/");
    });
  });
});
