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

  spiderOakApp.FolderView = Backbone.View.extend({
    destructionPolicy: "never",
    initialize: function() {
      _.bindAll(this);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    render: function() {
      this.$el.html(_.template(window.tpl.get("folderViewTemplate"),
        this.model.toJSON()));
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      // Load the files and folders at the same time (quasi-async)
      window.setTimeout(function(){
        this.loadFiles();
      }.bind(this), 10);
      this.loadFolders();

      return this;
    },
    loadFolders: function() {
      // The folders...
      this.folders = new spiderOakApp.FoldersCollection();
      if (this.model.collection) {
        this.folders.url = (this.model.collection.urlBase ||
                            this.model.collection.url) + this.model.get("url");
      }
      else {
        this.folders.url = (spiderOakApp.accountModel.get("storageRootURL") +
                            this.model.get("url"));
      }
      this.foldersListView = new spiderOakApp.FoldersListView({
        collection: this.folders,
        el: this.$(".foldersList")
      });
      // When we have finished fetching the folders, help hide the spinner
      this.$(".foldersList").one("complete", function(event) {
        this.$(".folderViewLoading").removeClass("loadingFolders");
        window.setTimeout(function(){
          this.scroller.refresh();
        }.bind(this),0);
        // @TODO: Refresh subviews scroller
      }.bind(this));
    },
    loadFiles: function() {
      // The files...
      this.files = new spiderOakApp.FilesCollection();
      if (this.model.collection) {
        this.files.url = (this.model.collection.urlBase ||
                          this.model.collection.url) + this.model.get("url");
      }
      else {
        this.files.url = (spiderOakApp.accountModel.get("storageRootURL") +
                          this.model.get("url"));
      }
      this.filesListView = new spiderOakApp.FilesListView({
        collection: this.files,
        el: this.$(".filesList")
      });
      // When we have finished fetching the files, help hide the spinner
      this.$(".filesList").one("complete", function(event) {
        // @TODO: Refresh subviews scroller
        this.$(".folderViewLoading").removeClass("loadingFiles");
        window.setTimeout(function(){
          this.scroller.refresh();
        }.bind(this),0);
      }.bind(this));
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle(this.model.get("name"));
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
      this.scroller.destroy();
      this.foldersListView.close();
      this.filesListView.close();
    }
  });

  spiderOakApp.FoldersListView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.subViews = [];

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
      this.$el.append(view.render().el);
      this.subViews.push(view);
    },
    addAll: function() {
      this.$el.empty(); // needed still ?
      this.collection.each(this.addOne, this);
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
        _.template(window.tpl.get("folderItemViewTemplate"),
          this.model.toJSON()
        )
      );
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
      spiderOakApp.navigator.pushView(this.folderView, {},
        spiderOakApp.defaultEffect);
    },
    close: function(){
      this.remove();
      this.unbind();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
