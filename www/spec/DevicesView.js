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
      spyOn(this.view,'addOne').andCallThrough();
      spyOn(this.view,'addAll').andCallThrough();
      this.server.respond();
    });
    it('should create a list element', function() {
      expect(this.view.el.nodeName).toEqual("UL");
    });
    describe('Methods', function() {
      it('should call addAll', function() {
        expect(this.view.addAll).toHaveBeenCalled();
      });
      it('should call addOne', function() {
        expect(this.view.addOne).toHaveBeenCalled();
      });
    });
    describe('List items', function() {
      it('should append a list item for each model', function() {
        expect(this.view.$("li").length)
          .toEqual(this.view.collection.models.length);
      });
      it('should display the name of the model', function() {
        // well... it might have a leading space... trim it first
        var liText = this.view.$("li").first().text().replace(/^\s/,"");
        var modelName = this.view.collection.at(0).get("name");
        expect(liText).toEqual(modelName);
      });
      it('should set the url of the model as the data url attribute', function() {
        var dataURL = this.view.$("li a").first().data("url");
        var modelURL = this.view.collection.at(0).get("url");
        expect(dataURL).toEqual(modelURL);
      });
    });
  });
});
