/*jshint expr:true */
describe('DevicesView', function() {
  beforeEach(function() {
    this.server = sinon.fakeServer.create();
    this.b32username = "ORSXG5DVONSXE3TBNVSQ"; // nibbler b32 of "testusername"
  });
  afterEach(function() {
    this.server.restore();
  });
  describe('Instantiation', function() {
    beforeEach(function() {
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
      this.view = new spiderOakApp.DevicesListView({
        collection: this.devicesCollection,
        el: $("<ul id='devices' class='edgetoedge'></ul>")
      }).render();
      sinon.spy(this.view,'addOne');
      this.server.respond();
    });
    it('should create a list element', function() {
      this.view.el.nodeName.should.equal("UL");
    });
    describe('Methods', function() {
      it('should call addOne', function() {
        this.view.addOne.should.have.been.called;
      });
    });
    describe('List items', function() {
      it('should append a list item for each model', function() {
        this.view.$("li").length
          .should.equal(this.view.collection.models.length);
      });
      it('should display the name of the model', function() {
        // well... it might have a leading space... trim it first
        var liText = this.view.$("li").first().text().replace(/^\s/,"");
        var modelName = this.view.collection.at(0).get("name");
        liText.should.equal(modelName);
      });
    });
  });
});
