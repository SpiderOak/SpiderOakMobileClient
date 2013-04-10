/*jshint expr:true */
describe('StorageBarModel', function() {
  beforeEach(function() {
    this.server = sinon.fakeServer.create();
    this.b32username = "ORSXG5DVONSXE3TBNVSQ"; // nibbler b32 of "testusername"
  });
  afterEach(function() {
    this.server.restore();
  });
  describe('instantiation', function() {
    beforeEach(function() {
      this.successSpy = sinon.spy();
      this.errorSpy = sinon.spy();
      this.server.respondWith(
        "GET",
        "https://spideroak.com/storage/" + this.b32username + "/",
        [
          200,
          {"Content-Type": "text/html"},
          '{"devices":[["Test device","Test%20device/"],'+
            '["Other device","Other%20device/"]],"stats":{'+
              '"backupsize":"543.21 MB","backupsize_for_robots":"543215432",'+
              '"billing_url":"https://spideroak.com/user/validate?hmac='+
              '&avatar=&time=","devices":2,'+
              '"firstname":"Test","lastname":"User","size":100,'+
              '"size_for_robots":100000000000}}'
        ]
      );
      this.model = new spiderOakApp.StorageBarModel();
      this.model.url = "https://spideroak.com/storage/" +
                                    this.b32username + "/";
      this.model.fetch({
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
    it('should asign the correct attributes in the model', function() {
      this.successSpy.should.have.been.calledOnce;
      this.model.get("backupsize").should.equal("543.21 MB");
      this.model.get("backupsize_for_robots").should.equal("543215432");
      this.model.get("size").should.equal(100);
      this.model.get("size_for_robots").should.equal(100000000000);
    });
    it('should calculate the percent of the backup used', function() {
      this.model.get("percentUsed").should.equal(1);
    });
  });
});
