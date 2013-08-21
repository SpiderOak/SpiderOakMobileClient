/*jshint expr:true */
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
          {"Content-Type": "text/html"},
          '{"devices":[{"encoded":"Test%20device/","lastcommit":1366416269,' +
          '"lastlogin":1366435030,"name":"Test device","sysplatform":"darwin"},' +
          '{"encoded":"OtherDevice/","lastcommit":1366242391,' +
          '"lastlogin":1366435028,"name":"OtherDevice","sysplatform":"darwin"}],' +
          '"stats":{"backupsize":"278.56 MB",' +
          '"backupsize_for_robots":"278560719",' +
          '"billing_url":"https://spideroak.com/user/validate?' +
          'hmac=hdwiuey984orpuwhef9uwefiuphwdfougsdf&avatar=573057' +
          '&time=1366867850","devices":2,"firstname":"Test",' +
          '"lastname":"User","size":100,"size_for_robots":100000000000}}'
        ]
      );
      this.collection = new spiderOakApp.DevicesCollection();
      this.collection.url = "https://spideroak.com/storage/" +
                                    this.b32username + "/";
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
                      "/");
    });
    it('should fetch the model(s)', function() {
      var model = this.collection.at(0);
      this.successSpy.should.have.been.calledOnce;
      this.collection.models.length.should.equal(2);
    });
    it('should populate with DeviceModel instance(s)', function() {
      var model = this.collection.at(0);
      model.should.be.instanceOf(spiderOakApp.DeviceModel);
    });
    it('should asign the correct attributes in the model(s)', function() {
      var model = this.collection.at(0);
      model.get("name").should.equal("Test device");
      model.get("url").should.equal("Test%20device/");
    });
  });
});
