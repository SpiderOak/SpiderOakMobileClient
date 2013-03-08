 /**
 * DevicesView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FavoritesView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
    },
    render: function() {
      this.$el.html(_.template(window.tpl.get("favoritesViewTemplate"),{}));
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });

      this.loadFavorites();

      return this;
    },
    loadFavorites: function() {
      if (spiderOakApp.favoritesCollection.models.length === 0) {
        this.$(".folderViewLoading").removeClass("loadingFiles");
        return;
      }
      // When we have finished fetching the files, help hide the spinner
      this.$(".filesList").one("complete", function(event) {
        // @TODO: Refresh subviews scroller
        this.$(".folderViewLoading").removeClass("loadingFiles");
        window.setTimeout(function(){
          this.scroller.refresh();
        }.bind(this),0);
      }.bind(this));

      this.favoritesListView = new spiderOakApp.FavoritesListView({
        collection: spiderOakApp.favoritesCollection,
        el: this.$(".filesList")
      }).render();
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      if (event.toView === this) {
        spiderOakApp.mainView.setTitle("Favorites");
        spiderOakApp.mainView.showBackButton(false);
      }
    },
    viewActivate: function(event) {
      if (spiderOakApp.navigator.viewsStack[0].instance === this) {
        spiderOakApp.mainView.showBackButton(false);
      }
      spiderOakApp.backDisabled = false;
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
      if (this.favoritesListView) {
        this.favoritesListView.close();
      }
    }
  });

  spiderOakApp.FavoritesListView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.subViews = [];
    },
    render: function() {
      this.addAll();
      return this;
    },
    addOne: function(model) {
      var view = new spiderOakApp.FavoritesListItem({
        model: model
      });
      this.$el.append(view.render().el);
      this.subViews.push(view);
    },
    addAll: function() {
      this.$el.empty();
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

  spiderOakApp.FavoritesListItem = Backbone.View.extend({
    tagName: "li",
    events: {
      "tap a": "a_tapHandler",
      "longTap a": "a_longTapHandler",
      "tap .rightButton": "favorite_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
    },
    render: function() {
      this.$el.html(
        _.template(window.tpl.get("fileItemViewTemplate"),
          this.model.toJSON()
        )
      );
      this.$("a").data("model",this.model);
      return this;
    },
    a_tapHandler: function(event) {
      if ($("#main").hasClass("open")) {
        return;
      }
      if ($(event.target).hasClass("icon-star") ||
            $(event.target).hasClass("rightButton")) {
        return;
      }
      window.setTimeout(function(){
        this.viewFavorite(
          this.model.get("path") + this.model.get("name")
        );
      }.bind(this), 50);
    },
    a_longTapHandler: function(event) {
      event.preventDefault();
      event.stopPropagation();
      window.setTimeout(function(){
        navigator.notification.alert(
          "This will show file options",
          null,
          "TODO",
          "OK"
        );
      }, 50);
    },
    favorite_tapHandler: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this.removeFavorite();
    },
    viewFavorite: function(path) {
      window.requestFileSystem(
        window.LocalFileSystem.PERSISTENT,
        0,
        function viewFavoriteGetFS(fileSystem) {
          fileSystem.root.getFile(
            path,
            {},
            function viewFavoriteGotFS(fileEntry) {
              spiderOakApp.fileViewer.view({
                  action: spiderOakApp.fileViewer.ACTION_VIEW,
                  url: encodeURI(fileEntry.fullPath)
                },
                function(){},
                function (error) { // @FIXME: Real error handling...
                  navigator.notification.alert(
                    "Cannot find an app to view files of this type.",
                    null,
                    "File error",
                    "OK"
                  );
                }
              );
            }
          );
        },
        function errorViewingFileByPath(error) { // @FIXME: Real error handling...
          navigator.notification.alert(
            "Error viewing file. Error code " + error.code,
            null,
            "File error",
            "OK"
          );
        }
      );
    },
    removeFavorite: function() {
      // Confirmation dialog
      navigator.notification.confirm(
        "Do you want to remove this file to your favorites?",
        function(button) {
          if (button !== 1) {
            return;
          }
          // If file exists in PERSISTENT file system, delete it
          // @FIXME: Check if the file exists first?
          var options = {
            fsType: window.LocalFileSystem.PERSISTENT,
            path: this.model.get("path") +
              this.model.get("name")
          };
          this.$(".rightButton").removeClass("favorite");
          spiderOakApp.downloader.deleteFile(
            options,
            function(entry) {
              console.log("File deleted");
            },
            function(error) { // @FIXME: Real error handling...
              navigator.notification.alert(
                "Error removing favorite from device (error code: " +
                  error.code + ")",
                null,
                "Error",
                "OK"
              );
            }
          );
          // Remove model from the Favorites Collection
          spiderOakApp.favoritesCollection.remove(this.model);
          // Persist Favorites Collection to localStorage
          window.localStorage.setItem(
            "favorites-" + spiderOakApp.accountModel.get("b32username"),
            JSON.stringify(spiderOakApp.favoritesCollection.toJSON())
          );
        }.bind(this),
        "Favorites"
      );
    },
    close: function(){
      this.remove();
      this.unbind();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
