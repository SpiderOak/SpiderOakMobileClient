describe('FoldersView', function() {
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
        "https://spideroak.com/storage/" + this.b32username +
          "/Test%20device/test/",
        [
          200,
          {"Content-Type": "test/html"},
          '{"dirs": [["test folder/", "test%20folder/"], ["tmp/", "tmp/"] ],'+
            ' "files": [{"ctime": 1359167989, "etime": 1359167998, '+
            '"mtime": 1359167946, "name": "filename.pdf", "size": 255434, '+
            '"url": "filename.pdf", "versions": 2 } ] }'
        ]
      );
      this.filesCollection = new spiderOakApp.FoldersCollection();
      this.filesCollection.url = "https://spideroak.com/storage/" +
                                    this.b32username + "/Test%20device/test/";
      this.view = new spiderOakApp.FoldersListView({
        collection: this.filesCollection,
        el: $("<ul id='files' class='edgetoedge'></ul>")
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
      it('should set the model in the dataset', function() {
        var dataModel = this.view.$("li a").first().data("model");
        var collectionModel = this.view.collection.at(0);
        expect(dataModel).toEqual(collectionModel);
      });
    });
  });
});