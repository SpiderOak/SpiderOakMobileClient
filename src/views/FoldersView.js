/**
 * FolderView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  // Should be many of these, so will not be tied to an existing DOM element
  // Will be initialised with a unique id and possibly a URL
  // var folderView = new spiderOakApp.FolderView({
  //   id: "someUniqueID",
  //   url: "/path/to/folder"
  // });
  spiderOakApp.FolderView = Backbone.View.extend({
    templateID: "#folderViewTemplate",
    initialize: function() {
      _.bindAll(this);
      this.$el.bind("pageAnimationStart", this.pageAnimationStart_handler);
      this.$el.bind("pageAnimationEnd", this.pageAnimationEnd_handler);
    },
    render: function() {
      return this;
    },
    pageAnimationStart_handler: function(event, data) {
      if (data.direction === "out" || data.back ||
          this.$(".folderViewLoading").css("display") === "none") {
        return true;
      }
      if (!this.model) {
        this.referrer = this.$el.data("referrer");
        this.model = this.referrer.data("model");
      }
      this.$el.html(_.template($(this.templateID).text(), this.model.toJSON()));
      
      this.loadFolders();
      this.loadFiles();
      this.render();
    },
    pageAnimationEnd_handler: function(event, data) {
      // console.log("storage.pageAnimationEnd - " + data.direction);
    },
    loadFolders: function() {
      // The folders...
      this.folders = new spiderOakApp.FoldersCollection();
      if (this.model.collection) {
        this.folders.url = this.model.collection.url + this.model.get("url");
      }
      else {
        this.folders.url = spiderOakApp.accountModel.getStorageURL() +
          this.model.get("url");
      }
      this.foldersListView = new spiderOakApp.FoldersListView({
        collection: this.folders,
        el: this.$(".foldersList")
      });
      // When we have finished fetching the folders, help hide the spinner
      this.$(".foldersList").one("complete", function(event) {
        this.$(".folderViewLoading").removeClass("loadingFolders");
      }.bind(this));
    },
    loadFiles: function() {
      // The files...
      this.files = new spiderOakApp.FilesCollection();
      if (this.model.collection) {
        this.files.url = this.model.collection.url + this.model.get("url");
      }
      else {
        this.files.url = spiderOakApp.accountModel.getStorageURL() +
          this.model.get("url");
      }
      this.filesListView = new spiderOakApp.FilesListView({
        collection: this.files,
        el: this.$(".filesList")
      });
      // When we have finished fetching the files, help hide the spinner
      this.$(".filesList").one("complete", function(event) {
        this.$(".folderViewLoading").removeClass("loadingFiles");
      }.bind(this));
    }
  });

  spiderOakApp.FoldersListView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.collection.fetch();
    },
    render: function() {
      this.addAll();
      // @TODO: Then when we are done, clear the "loading spinner"
      return this;
    },
    addOne: function(model) {
      model.url = this.collection.url + model.get("url");
      var view = new spiderOakApp.FoldersListItemView({
        model: model
      });
      view.render();
      this.$el.append(view.el);
    },
    addAll: function() {
      this.$el.empty();
      this.collection.each(this.addOne, this);
      this.$el.trigger("complete");
    }
  });

  spiderOakApp.FoldersListItemView = Backbone.View.extend({
    tagName: "li",
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
    },
    render: function() {
      this.$el.html(
        _.template(
          "<a href='#'><i class='icon-folder'></i> <%= name %></a>",
          this.model.toJSON()
        )
      );
      this.$("a").data("model",this.model);
      return this;
    },
    a_tapHandler: function(event) {
      event.preventDefault();
      if ($("#"+this.model.cid).length) {
        window.jQT.goTo("#"+this.model.cid, "slideleft");
      }
      else {
        this.folderView = new spiderOakApp.FolderView({
          id: this.model.cid,
          model: this.model
        });
        this.folderView.render();
        window.jQT.goTo("#"+this.model.cid, "slideleft");
      }
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
