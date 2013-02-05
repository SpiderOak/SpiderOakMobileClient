/**
 * StorageView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.StorageView = Backbone.View.extend({
    el: "#storage",
    events: {
      // ...
    },
    initialize: function() {
      _.bindAll(this);
      this.$el.bind("pageAnimationStart", this.pageAnimationStart_handler);
      this.$el.bind("pageAnimationEnd", this.pageAnimationEnd_handler);
    },
    render: function() {
      return this;
    },
    pageAnimationStart_handler: function(event, data) {
      this.referrer = this.$el.data("referrer");
      this.model = this.referrer.data("model");
      this.$el.html(_.template(
        $("#storageRootTemplate").text(),
        this.model.toJSON()
      ));
      // The folders...
      this.folders = new spiderOakApp.FoldersCollection();
      this.folders.url = spiderOakApp.accountModel.getStorageURL() +
        this.model.get("url");
      this.foldersListView = new spiderOakApp.FoldersListView({
        collection: this.folders,
        el: this.$(".foldersList")
      });
      // When we have finished fetching the folders, help hide the spinner
      this.$(".foldersList").one("complete", function(event) {
        this.$(".folderViewLoading").removeClass("loadingFolders");
      }.bind(this));
      // The files...
      this.files = new spiderOakApp.FilesCollection();
      this.files.url = spiderOakApp.accountModel.getStorageURL() +
        this.model.get("url");
      this.filesListView = new spiderOakApp.FilesListView({
        collection: this.files,
        el: this.$(".filesList")
      });
      // When we have finished fetching the files, help hide the spinner
      this.$(".filesList").one("complete", function(event) {
        this.$(".folderViewLoading").removeClass("loadingFiles");
      }.bind(this));

      this.render();
    },
    pageAnimationEnd_handler: function(event, data) {
      // console.log("storage.pageAnimationEnd - " + data.direction);
    }
  });
  spiderOakApp.storageView = new spiderOakApp.StorageView().render();

})(window.spiderOakApp = window.spiderOakApp || {}, window);
