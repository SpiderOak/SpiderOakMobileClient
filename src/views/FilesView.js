/**
 * FileView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FilesListView = Backbone.View.extend({
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
      // this.addAll();
      return this;
    },
    addOne: function(model) {
      // @FIXME: Is this the best pattern for this?
      if (spiderOakApp.favoritesCollection &&
                  spiderOakApp.favoritesCollection.models &&
                  spiderOakApp.favoritesCollection.models.length > 0) {
        var isFavorite = _.find(
          spiderOakApp.favoritesCollection.models, function(favorite){
            return favorite.get("url") === model.urlResult();
        });
        if (isFavorite) {
          model.set("isFavorite", true);
          model.set("path", isFavorite.get("path"));
          model.set("favoriteModel", isFavorite);
        }
      }
      var view = new spiderOakApp.FilesListItemView({
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

  spiderOakApp.FilesListItemView = Backbone.View.extend({
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
        if (this.model.get("isFavorite")) {
          this.viewFavorite(
            this.model.get("path") + this.model.get("name")
          );
        }
        else {
          this.view();
        }
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
      if (this.$(".rightButton").hasClass("favorite")) {
       this.removeFavorite();
      }
      else {
        this.saveFavorite();
      }
    },
    view: function() {
      var downloadOptions = {
        fileName: this.model.get("name"),
        from: this.model.urlResult() + this.model.get("name"),
        to: ".caches",
        fsType: window.LocalFileSystem.TEMPORARY,
        onprogress: function onprogress(progressEvent) {
          if (progressEvent.lengthComputable) {
            var percentComplete =
                  (progressEvent.loaded / progressEvent.total) * 100;
            spiderOakApp.dialogView.updateProgress(percentComplete);
          }
        },
        headers: {
          "Authorization": spiderOakApp.accountModel
            .get("basicAuthCredentials")
        }
      };
      spiderOakApp.dialogView.showProgress({
        title: "Downloading",
        subtitle: this.model.get("name"),
        start: 0
      });
      spiderOakApp.downloader.downloadFile(
        downloadOptions,
        function successCallback(fileEntry) {
          spiderOakApp.dialogView.hide();

          // if (this.model.get("openInternally")) {
          //   window.open(encodeURI(entry.fullPath),"_blank","location=no");
          // } else {
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
          // }
        },
        function(error) { // @FIXME: Real error handling...
          spiderOakApp.dialogView.hide();
          if (error.code) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("download error code " + error.code);
            console.log("download error status " + error.http_status);
          }
          else {
            console.log(error);
          }
        }
      );
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
    saveFavorite: function() {
      // Confirmation dialog
      navigator.notification.confirm(
        "Do you want to add this file to your favorites?",
        function(button) {
          if (button !== 1) {
            return;
          }
          // Download the file to the PERSISTENT file system
          // Start by getting the folder path
          // @FIXME: This path should be controlled by a platform config
          // @FIXME: This might be better moved to  method in the model
          var path = "Download/SpiderOak/.favorites" +
            this.model.urlResult()
              .replace(
                new RegExp(spiderOakApp.accountModel.get("storageRootURL")),
                "/"
              ).replace(
                new RegExp(this.model.get("name")),
                ""
              );
          spiderOakApp.dialogView.showProgress({
            title: "Adding to Favorites",
            subtitle: this.model.get("name"),
            start: 0
          });
          var downloadOptions = {
            fileName: this.model.get("name"),
            from: this.model.urlResult() + this.model.get("name"),
            to: path,
            fsType: window.LocalFileSystem.PERSISTENT,
            onprogress: function onprogress(progressEvent) {
              if (progressEvent.lengthComputable) {
                var percentComplete =
                      (progressEvent.loaded / progressEvent.total) * 100;
                spiderOakApp.dialogView.updateProgress(percentComplete);
              }
            },
            headers: {
              "Authorization": spiderOakApp.accountModel
                .get("basicAuthCredentials")
            }
          };
          var favorite = this.model.toJSON();
          favorite.path = path;
          favorite.url = this.model.urlResult();
          favorite.isFavorite = true;
          spiderOakApp.downloader.downloadFile(
            downloadOptions,
            function successCallback(fileEntry) {
              spiderOakApp.dialogView.hide();
              // Add file model (with added local path) to the Favorites Collection
              spiderOakApp.favoritesCollection.add(
                new spiderOakApp.FavoriteModel(favorite)
              );
              this.$(".rightButton").addClass("favorite");
              // Persist Favorites Collection to localStorage
              // window.store.set(
              window.store.set(
                "favorites-" + spiderOakApp.accountModel.get("b32username"),
                spiderOakApp.favoritesCollection.toJSON()
              );
              this.model.set("path", favorite.path);
              this.model.set("isFavorite", true);
              navigator.notification.alert(
                fileEntry.name + " added to Favorites",
                null,
                "Success",
                "OK"
              );
            }.bind(this),
            function errorCallback(error) { // @FIXME: Real error handling...
              spiderOakApp.dialogView.hide();
              console.log(error);
            }
          );
        }.bind(this),
        "Favorites"
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
            path: this.model.get("favoriteModel").get("path") +
              this.model.get("favoriteModel").get("name")
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
          spiderOakApp.favoritesCollection.remove(this.model.get("favoriteModel"));
          // Persist Favorites Collection to localStorage
          window.store.set(
            "favorites-" + spiderOakApp.accountModel.get("b32username"),
            spiderOakApp.favoritesCollection.toJSON()
          );
          // Put the model back to unfavorited state
          this.model.unset("path");
          this.model.set("isFavorite", false);
          this.model.unset("favoriteModel");
        }.bind(this),
        "Favorites"
      );
    },
    close: function() {
      this.remove();
      this.unbind();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
