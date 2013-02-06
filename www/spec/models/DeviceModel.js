describe('DeviceModel', function() {
  describe('instantiation', function() {
    beforeEach(function() {
      this.deviceModel = new spiderOakApp.DeviceModel({
        name: "Test device",
        url: "Test%20device/"
      });
    });
    it('should have a name', function() {
      expect(this.deviceModel.get("name")).toBeDefined();
      expect(this.deviceModel.get("name")).toEqual("Test device");
    });
    it('should have a URL', function() {
      expect(this.deviceModel.get("url")).toBeDefined();
      expect(this.deviceModel.get("url")).toEqual("Test%20device/");
    });
  });
});
