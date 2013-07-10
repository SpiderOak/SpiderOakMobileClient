/*jshint expr:true */
describe('ShareRoomsCollection', function() {
  beforeEach(function() {
    helper.suspendLocalStorage();
    spiderOakApp.initialize();
    this.theServerURL = "https://spideroak.com";
    this.server = sinon.fakeServer.create();
  });
  afterEach(function() {
    this.server.restore();
    helper.resumeLocalStorage();
  });
  describe('Fetching My ShareRooms', function() {
    beforeEach(function() {
      this.username = "testshareid";
      this.usernameB32 = spiderOakApp.b32nibbler.encode(this.username);
      this.shareId = "testshareid";
      this.shareIdB32 = spiderOakApp.b32nibbler.encode(this.shareId);
      this.roomKey = "testroomkey";
      this.mySharesListURL = (this.theServerURL + "/storage/" +
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
      this.successSpy.should.have.been.calledOnce;
      this.collection.models.length.should.equal(2);
      var model = this.collection.at(0);
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
  describe('Manipulate Public ShareRooms roster', function() {
    beforeEach(function() {
      this.pubShareId = "shareid1";
      this.pubShareIdB32 = spiderOakApp.b32nibbler.encode(this.pubShareId);
      this.pubRoomKey = "roomkey1";
      this.theShareURL = (this.theServerURL + "/share/" +
                          this.pubShareIdB32 + "/" + this.pubRoomKey + "/");
      this.successSpy = sinon.spy();
      this.errorSpy = sinon.spy();
      // Reliable way to get valid JSON string: create desired result, and then
      // use JSON.stringify at apt time, to package it:
      this.server.respondWith(
        "GET",
        this.theShareURL + "?auth_required_format=json",
        [
          200,
          {"Content-Type": "application/json"},
          JSON.stringify(
            {browse_url: ("/browse/share/" +
                          this.pubShareIdB32 + "/" + this.pubRoomKey),
             dirs: [],
             stats: {
               room_name: "The fetched name",
               firstname: "Some",
               lastname: "Body",
               number_of_files: 0,
               number_of_folders: 0,
               room_description: "The fetched description",
               room_size: "123 MB",
               start_date: ""}}
          )
        ]
      );
      this.collection = new spiderOakApp.PublicShareRoomsCollection();
      this.saveRetainedRecordsSpy =
          sinon.spy(this.collection, "saveRetainedRecords");
      this.collection.add({
        share_id: this.pubShareId,
        room_key: this.pubRoomKey,
        remember: 0
      }, {
        success: this.successSpy,
        error: this.errorSpy
      });
      this.server.respond();
    });
    it('should fetch successfully from the server using GET', function() {
      this.successSpy.should.have.been.calledOnce;
      this.server.requests[0].method.should.equal("GET");
    });
    it('should include the added public ShareRoom', function() {
      this.collection.models.length.should.equal(1);
      this.collection.models[0].get("name").should.equal("The fetched name");
      this.collection.models[0].get("size")
          .should.equal("123 MB");
      this.saveRetainedRecordsSpy.should.have.been.calledOnce;
    });
    it('should properly do removal of the added public ShareRoom', function() {
      this.saveRetainedRecordsSpy.should.have.been.calledOnce;
      this.collection.remove(this.collection.models[0]);
      this.collection.models.length.should.equal(0);
      this.saveRetainedRecordsSpy.should.have.been.calledTwice;
    });
  });
});
