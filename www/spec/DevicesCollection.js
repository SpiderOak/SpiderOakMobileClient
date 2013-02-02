describe('DevicesCollection', function() {
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
        "https://spideroak.com/storage/" + this.b32username + "/",
        [
          200,
          {"Content-Type": "test/html"},
          '{"devices":[["Test device","Test%20device/"]],"stats":{}}'
        ]
      );
      this.devicesCollection = new spiderOakApp.DevicesCollection();
      this.devicesCollection.url = "https://spideroak.com/storage/" +
                                    this.b32username + "/";
      this.devicesCollection.fetch({
        success: this.successSpy,
        error: this.errorSpy
      });
      this.server.respond();
    });
    it('should fetch from the server using GET', function() {
      expect(this.server.requests[0].method).toEqual("GET");
    });
    it('should use the expected url', function() {
      expect(this.server.requests[0].url)
        .toEqual("https://spideroak.com/storage/" + this.b32username + "/");
    });
    it('should fetch the model(s)', function() {
      var model = this.devicesCollection.at(0);
      expect(this.successSpy.calledOnce).toBeTruthy();
      expect(this.devicesCollection.models.length).toEqual(1);
    });
    it('should populate with DeviceModel instance(s)', function() {
      var model = this.devicesCollection.at(0);
      expect(model instanceof spiderOakApp.DeviceModel).toBeTruthy();
    });
    it('should asign the correct attributes in the model(s)', function() {
      var model = this.devicesCollection.at(0);
      expect(model.get("name")).toEqual("Test device");
      expect(model.get("url")).toEqual("Test%20device/");
    });
  });
});
