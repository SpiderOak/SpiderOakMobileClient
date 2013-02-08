describe('DeviceModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.model = new spiderOakApp.DeviceModel({
        name: "Test device",
        url: "Test%20device/"
      });
    });
    it('should have a name', function() {
      expect(this.model.get("name")).to.be.a("string");
      expect(this.model.get("name")).to.equal("Test device");
    });
    it('should have a URL', function() {
      expect(this.model.get("url")).to.a("string");
      expect(this.model.get("url")).to.equal("Test%20device/");
    });
  });
});
