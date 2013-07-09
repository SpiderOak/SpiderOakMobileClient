/*jshint expr:true */
describe('ShareRoomsCollection', function() {
  beforeEach(function() {
    this.server = sinon.fakeServer.create();
  });
  afterEach(function() {
    this.server.restore();
  });
  describe('Fetching My ShareRooms', function() {
    beforeEach(function() {
      this.username = "testshareid";
      this.usernameB32 = spiderOakApp.b32nibbler.encode(this.username);
      this.shareId = "testshareid";
      this.shareIdB32 = spiderOakApp.b32nibbler.encode(this.shareId);
      this.roomKey = "testroomkey";
      this.mySharesListURL = ("https://spideroak.com/storage/" +
                              this.b32username + "/shares");
      this.successSpy = sinon.spy();
      this.errorSpy = sinon.spy();
      // Reliable way to get valid JSON string: create desired result, and then
      // use JSON.stringify at apt time, to package it:
      this.mySharesObj = {share_id: this.shareId,
                          share_id_b32: this.shareIdB32,
                          share_rooms: [
                            {room_name: "Name 1",
                             room_key: "key1",
                             room_description: "Description 1.",
                             url: ("/browse/share/" + this.shareIdB32 + "/key1")
                            },
                            {room_name: "Name 2",
                             room_key: "key2",
                             room_description: "Description 2.",
                             url: ("/browse/share/" + this.shareIdB32 + "/key2")
                            }
                          ]};
      this.server.respondWith(
        "GET",
        this.mySharesListURL,
        [
          200,
          {"Content-Type": "application/json"},
          JSON.stringify(this.mySharesObj)
        ]
      );
      this.collection = new spiderOakApp.MyShareRoomsCollection();
      this.collection.url = this.mySharesListURL;
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
        .should.equal(this.mySharesListURL);
    });
    it('should fetch the model(s)', function() {
      var model = this.collection.at(0);
      this.successSpy.should.have.been.calledOnce;
      this.collection.models.length.should.equal(2);
    });
    it('should populate with ShareRoomModel instance(s)', function() {
      var model = this.collection.at(0);
      model.should.be.instanceOf(spiderOakApp.ShareRoomModel);
    });
    it('should asign the correct attributes in the model(s)', function() {
      var model = this.collection.at(0);
      model.get("name").should.equal("Name 1");
      model.get("url").should.equal(this.shareIdB32 + "/key1/");
    });
  });
});
