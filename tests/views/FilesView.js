/*jshint expr:true */
describe('FilesView', function() {
	beforeEach(function() {
    this.server = sinon.fakeServer.create();
    this.b32username = "ORSXG5DVONSXE3TBNVSQ"; // nibbler b32 of "testusername"
    window.Modernizr.overflowscrolling = true; // Hack to display what we want
  });
  afterEach(function() {
    this.server.restore();
  });
  describe('Instantiation', function() {
    beforeEach(function() {
      var filesObj = {dirs: [["test folder/", "test%20folder/"],
                             ["tmp/", "tmp/"]],
                      files: [{ctime: 1359167989,
                               etime: 1359167998,
                               mtime: 1359167946,
                               name: "filename.pdf",
                               size: 255434,
                               url: "filename.pdf",
                               versions: 2
                              }]};
      this.server.respondWith(
        "GET",
        "https://spideroak.com/storage/" + this.b32username +
          "/Test%20device/test/",
        [
          200,
          {"Content-Type": "test/html"},
          JSON.stringify(filesObj)
        ]
      );
      this.filesCollection = new spiderOakApp.FilesCollection();
      this.filesCollection.url = "https://spideroak.com/storage/" +
                                    this.b32username + "/Test%20device/test/";
      this.view = new spiderOakApp.FilesListView({
        collection: this.filesCollection,
        el: $("<ul id='files'></ul>")
      }).render();
      sinon.spy(this.view,'addOne');
      this.completeSpy = sinon.spy();
      this.view.$el.on("complete", this.completeSpy);
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
        var liText = this.view.$("li .filename").first().text();
        var modelName = this.view.collection.at(0).get("name");
        var regexp = new RegExp(liText).test(modelName);
        regexp.should.be.ok;
      });
      it('should set the model in the dataset', function() {
        var dataModel = this.view.$("li a").first().data("model");
        var collectionModel = this.view.collection.at(0);
        dataModel.should.equal(collectionModel);
      });
      it('should fire a "complete" event when all items added',
        function(){
          this.completeSpy.should.be.called;
        }
      );
    });
  });
});
