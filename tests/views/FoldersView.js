/*jshint expr:true */
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
        el: $("<ul id='files'></ul>")
      }).render();
      sinon.spy(this.view,'addOne');
      this.completeSpy = sinon.spy();
      this.view.$el.on("complete", this.completeSpy);
      this.server.respond();
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
        var liText = this.view.$("li .foldername").first().text();
        var modelName = this.view.collection.at(0).get("name");
        var regexp = new RegExp(liText).test(modelName);
        regexp.should.be.ok;
      });
      it('should fire a "complete" event when all items added',
        function(){
          this.completeSpy.should.be.called;
        }
      );
    });
  });
});
