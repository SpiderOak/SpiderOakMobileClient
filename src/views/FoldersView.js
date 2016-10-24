/**
 * FolderView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      qq          = window.qq,
      s           = window.s;

  spiderOakApp.FolderView = spiderOakApp.ViewBase.extend({
    destructionPolicy: "never",
    initialize: function() {
      window.bindMine(this);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    render: function() {
      this.$el.html(window.tmpl["folderViewTemplate"](this.model.toJSON()));

      // Just in case... avoid race condition on start-up
      if (!this.model.get("url")) {
        this.model.fetch({
          success: function(model) {
            spiderOakApp.mainView.setTitle(this.model.get("name"));
            this.loadFolders();
            this.loadFiles();
          }.bind(this)
        });
      }
      else {
        this.loadFolders();
        this.loadFiles();
      }

      return this;
    },
    loadFolders: function() {
      // The folders...
      this.folders = new spiderOakApp.FoldersCollection();
      this.folders.url = this.model.composedUrl(true);
      this.folders.setPassword(this.model.getPassword());
      this.foldersListView = new spiderOakApp.FoldersListView({
        collection: this.folders,
        el: this.$(".foldersList")
      }).render();
      // When we have finished fetching the folders, help hide the spinner
      this.$(".foldersList").one("complete", function(event) {
        this.$(".folderViewLoading").removeClass("loadingFolders");
      }.bind(this));
    },
    loadFiles: function() {
      // The files...
      this.files = new spiderOakApp.FilesCollection();
      this.files.url = this.model.composedUrl(true);
      this.files.setPassword(this.model.getPassword());
      this.filesListView = new spiderOakApp.FilesListView({
        collection: this.files,
        el: this.$(".filesList")
      }).render();
      // When we have finished fetching the files, help hide the spinner
      this.$(".filesList").one("complete", function(event) {
        this.$(".folderViewLoading").removeClass("loadingFiles");
      }.bind(this));
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle(this.model.get("name"),event.action);
        if (!!spiderOakApp.navigator.viewsStack[0] &&
              spiderOakApp.navigator.viewsStack[0].instance === this) {
          spiderOakApp.mainView.showBackButton(false);
        }
        else if (!spiderOakApp.navigator.viewsStack[0] ||
            spiderOakApp.navigator.viewsStack.length === 0) {
          spiderOakApp.mainView.showBackButton(false);
        }
        else {
          spiderOakApp.mainView.showBackButton(true);
        }
      }
    },
    viewActivate: function(event) {
      if (spiderOakApp.navigator.viewsStack[0].instance === this) {
        spiderOakApp.mainView.showBackButton(false);
      }
      spiderOakApp.backDisabled = false;
    },
    viewDeactivate: function(event) {
      //this.close();
    },
    remove: function() {
      this.close();
      this.$el.remove();
      this.stopListening();
      return this;
    },
    close: function() {
      // Clean up our subviews
      this.foldersListView.close();
      this.filesListView.close();
    },
    which: "FolderView"
  });

  spiderOakApp.FoldersListView = spiderOakApp.ViewBase.extend({
    initialize: function() {
      window.bindMine(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "complete", this.triggerComplete, this );
      this.collection.on( "all", this.render, this );

      this.subViews = [];

      // @TODO: Errors should either be thrown, or at least a blank state added
      this.collection.fetch({
        error: function(collection, response, options) {
          this.render().addAll();
          console.log(JSON.stringify(response.statusText));
          spiderOakApp.dialogView.showNotifyErrorResponse(response);
        }.bind(this)
      });
    },
    render: function() {
      // this.addAll();
      // @TODO: Then when we are done, clear the "loading spinner"
      return this;
    },
    addOne: function(model) {
      if (spiderOakApp.maxEntries &&
          this.folderCounter > spiderOakApp.maxEntries) {
        return;
      }
      this.folderCounter++;
      if (this.collection.getPassword()) {
        model.setPassword(this.collection.getPassword());
      }
      var view = new spiderOakApp.FoldersListItemView({
        model: model
      });
      this.$el.append(view.render().el);
      this.subViews.push(view);
    },
    addAll: function() {
      this.$el.empty(); // needed still ?
      this.folderCounter = 1;
      if (this.collection.length > spiderOakApp.maxEntries) {
        this.$el.append(
          "<li class='sep'><i class='icon-warning'></i> " +
            qq("Too many folders. Displaying first [[numEntries]]",
               {numEntries: spiderOakApp.maxEntries}) +
            ".</li>"
        );
      }
      this.collection.each(this.addOne, this);
      this.$el.trigger("complete");
    },
    triggerComplete: function() {
      this.$el.trigger("complete");
    },
    close: function(){
      this.remove();
      this.unbind();
      // handle other unbinding needs, here
      _.each(this.subViews, function(subViews){
        if (subViews.close){
          subViews.close();
        }
      });
    },
    which: "FoldersListView"
  });

  spiderOakApp.FoldersListItemView = spiderOakApp.ViewBase.extend({
    tagName: "li",
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
    },
    render: function() {
      this.$el.html(window.tmpl["folderItemViewTemplate"](
          this.model.toJSON()
      ));
      var options = {
        id: this.model.cid,
        model: this.model
      };
      this.folderView = new spiderOakApp.FolderView(options);
      return this;
    },
    a_tapHandler: function(event) {
      event.preventDefault();
      if ($("#main").hasClass("open")) {
        return;
      }
      if (this.model.get("password_required")) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.GetShareRoomPasswordView,
          {model: this.model},
          spiderOakApp.defaultEffect
        );
      }
      else {
        spiderOakApp.navigator.pushView(this.folderView, {},
                                        spiderOakApp.defaultEffect);
      }
    },
    close: function(){
      this.remove();
      this.unbind();
    },
    which: "FoldersListItemView"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
