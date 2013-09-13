/*jshint expr:true */
describe('FilesView', function() {
  beforeEach(function() {
    // nibbler b32 of "testusername":
    this.b32username = "ORSXG5DVONSXE3TBNVSQ";
    // Hack to display what we want:
    window.Modernizr.overflowscrolling = true;
  });
  describe('Instantiation', function() {
    beforeEach(function() {
      this.server = sinon.fakeServer.create();
      this.server.respondWith(
        "GET",
        "https://spideroak.com/storage/" + this.b32username +
          "/Test%20device/test/",
        [
          200,
          {"Content-Type": "text/html"},
          JSON.stringify(
            {dirs: [["test folder/", "test%20folder/"], ["tmp/", "tmp/"]],
             files: [{ctime: 1359167989, etime: 1359167998,
                      mtime: 1359167946, name: "filename.pdf",
                      size: 255434, url: "filename.pdf", versions: 2}]}
          )
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
    afterEach(function() {
      this.server.restore();
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
  describe('Send Link', function() {
    beforeEach(function() {
      spiderOakApp.initialize();
      this.server = sinon.fakeServer.create();

      this.testURLFilename = "filename.pdf";

      this.testURLStoragePrefix = ("https://spideroak.com/storage/" +
                                   this.b32username +
                                   "/Test%20device/test/");
      this.testURLStorage = this.testURLStoragePrefix + this.testURLFilename;
      this.testURLStorageResponse =
        "/storage/NNWG25DFON2A/shared/456789-1-1234/filename.pdf?c123abc";

      this.testURLSharePrefix = ("https://spideroak.com/share/" +
                                 this.b32username +
                                 "/aShare/test/");
      this.testURLShare = this.testURLSharePrefix + this.testURLFilename;
      this.testURLShareResponse = this.testURLShare;

      // @FIXME: Android specific!
      // Stub out the fileViewer:
      this.wasFileViewer = spiderOakApp.fileViewer;
      this.gotText = null;
      this.fakeFileViewer = spiderOakApp.fileViewer = {
        EXTRA_TEXT: "EXTRA_TEXT",
        ACTION_SEND: "ACTION_SEND",
        share: function(params, success, error) {
          this.gotText = params.extras[spiderOakApp.fileViewer.EXTRA_TEXT];
          return success();
        }
      };
      this.shareSpy = sinon.spy(this.fakeFileViewer, "share");

      this.content = {
        name: "filename.pdf",
        url: "filename.pdf",
        ctime: 1359167989,
        etime: 1359167998,
        mtime: 1359167946,
        size: 255434,
        versions: 2
      };
      this.fileModel = new spiderOakApp.FileModel(
        this.content
        // Omitting collection until we need to do stuff with the model.
      );
      this.view = new spiderOakApp.FileView({
        model: this.fileModel
      }).render();

      var responder = function (request) {
        if (request.method !== "POST") {
          request.respond(404, {}, "Must use POST");
        }
        else {
          if (request.url === this.testURLStorage) {
            console.log("testURLStorage response, for request url: " +
                        request.url);
            request.respond(200, {}, this.testURLStorageResponse);
          }
          else if (request.url === this.testURLShare) {
            console.log("testURLShare response, for request url: " +
                        request.url);
            request.respond(405, {}, "error");
          }
          else {
            console.log("other response, for request url: " +
                        request.url);
            request.respond(404, {}, "default");
          }
        }
      }.bind(this);
      this.server.respondWith(responder);
      this.server.respond();
    });
    afterEach(function() {
      for (var element in spiderOakApp.fileViewer) {
        delete element;
      }
      delete spiderOakApp.fileViewer;
      delete this.gotText;
      delete this.fakeFileViewer;
      delete this.fileModel;
      delete this.shareSpy;
      delete this.view;
      spiderOakApp.fileViewer = this.wasFileViewer;
      delete this.server;
    });
    it("should doView of storage item with constructed URL", function () {
      this.fileModel.urlBase = this.testURLStoragePrefix;
      this.view.sendLink(this.testURLStorage);
      console.log("testURLStorage attempt got text: " + this.gotText)
    });
    it("should doView of share item with passed-in URL", function () {
      this.fileModel.urlBase = this.testURLSharePrefix;
      this.view.sendLink(this.testURLShare);
      console.log("testURLShare attempt got text: " + this.gotText)
    });
  });
});
