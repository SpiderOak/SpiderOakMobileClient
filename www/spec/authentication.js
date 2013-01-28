describe('Authentication', function() {
  beforeEach(function(){
    this.server = sinon.fakeServer.create();
    var username = "testusername";
    var b32username = "ORSXG5DVONSXE3TBNVSQ"; // nibbler b32 of "testusername"
    var password = "testpassword";
  });

  afterEach(function() {
    this.server.restore();
  });


});