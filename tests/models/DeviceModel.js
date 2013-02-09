/*jshint expr:true */
describe('DeviceModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.model = new spiderOakApp.DeviceModel({
        name: "Test device",
        url: "Test%20device/"
      });
    });
    it('should have a name', function() {
      this.model.get("name").should.be.a("string");
      this.model.get("name").should.equal("Test device");
    });
    it('should have a URL', function() {
      this.model.get("url").should.a("string");
      this.model.get("url").should.equal("Test%20device/");
    });
  });
});
