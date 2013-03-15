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
            var faveURL = favorite.get("url") + favorite.get("name");
            var modelURL = model.urlResult() + model.get("name");
            return faveURL === modelURL;
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
      event.preventDefault();
      event.stopPropagation();
      if ($("#main").hasClass("open")) {
        return;
      }
      if ($(event.target).hasClass("icon-star-2") ||
            $(event.target).hasClass("rightButton")) {
        return;
      }
      // View it otherwise
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
      var items = [
          {className: "open", description: "Open"},
          {className: "details", description: "Details"},
          {className: "send-link", description: "Send link"},
          {className: "save", description: "Save file"},
          {className: "share", description: "Share file"}
      ];
      if (this.model.get("isFavorite")) {
        items.push({
          className: "un-favorite", description: "Remove from favorites"
        });
      }
      else {
        items.push({
          className: "favorite", description: "Add to favorites"
        });
      }
      var menuView = new spiderOakApp.ContextPopup({
        items: items
      });
      $(document).one("backbutton", function(event) {
        spiderOakApp.dialogView.hide();
        menuView.remove();
      });
      menuView.once("item:tapped", function menu_tapHandler(event){
        var command = $(event.target).data("command");
        spiderOakApp.dialogView.hide();
        menuView.remove();
        switch(command) {
          case "open":
            this.a_tapHandler(event);
            break;
          case "details":
            window.setTimeout(function(){
              navigator.notification.alert(
                "Display " + this.model.get("name") + " details",
                null,
                "TODO",
                "OK"
              );
            }.bind(this), 50);
            break;
          case "send-link":
            window.setTimeout(function(){
              navigator.notification.alert(
                "Create link to " + this.model.get("name") +
                  " and send via SMS (or Email?)",
                null,
                "TODO",
                "OK"
              );
            }.bind(this), 50);
            break;
          case "save":
            window.setTimeout(function(){
              navigator.notification.alert(
                "What in the world is this supposed to do?!",
                null,
                "TODO",
                "OK"
              );
            }.bind(this), 50);
            break;
          case "share":
            window.setTimeout(function(){
              navigator.notification.alert(
                "Share " + this.model.get("name") + " via share intent",
                null,
                "TODO",
                "OK"
              );
            }.bind(this), 50);
            break;
          case "favorite":
            this.saveFavorite();
            break;
          case "un-favorite":
            this.removeFavorite();
            break;
        }
      }.bind(this));
      spiderOakApp.dialogView.showDialogView(menuView);
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
      var model = this.model;
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
              function(){
                // Add the file to the recents collection (view or fave)
                spiderOakApp.recentsCollection.add(model);
              },
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
            switch (error.code) {
              case window.FileTransferError.FILE_NOT_FOUND_ERR:
                console.log("FILE_NOT_FOUND_ERR");
                break;
              case window.FileTransferError.INVALID_URL_ERR:
                console.log("INVALID_URL_ERR");
                break;
              case window.FileTransferError.CONNECTION_ERR:
                console.log("CONNECTION_ERR");
                break;
              case window.FileTransferError.ABORT_ERR:
                console.log("ABORT_ERR");
                break;
            }
          }
          else {
            console.log(error);
          }
        }
      );
    },
    viewFavorite: function(path) {
      var model = this.model;
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
                function(){
                  // Add the file to the recents collection (view or fave)
                  spiderOakApp.recentsCollection.add(model);
                },
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
      var model = this.model;
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
          // @FIXME: This might be better moved to a method in the model
          var path = "Download/SpiderOak/.favorites" +
            this.model.urlResult()
              .replace(
                new RegExp("^.*" + spiderOakApp.accountModel.get("b32username")),
                ""
              ).replace(
                new RegExp(model.get("name")),
                ""
              );
          spiderOakApp.dialogView.showProgress({
            title: "Adding to Favorites",
            subtitle: model.get("name"),
            start: 0
          });
          var downloadOptions = {
            fileName: model.get("name"),
            from: model.urlResult() + model.get("name"),
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
          var favorite = model.toJSON();
          favorite.path = path;
          favorite.url = model.urlResult();
          favorite.isFavorite = true;
          spiderOakApp.downloader.downloadFile(
            downloadOptions,
            function successCallback(fileEntry) {
              spiderOakApp.dialogView.hide();
              // Add file model (with added local path) to the Favorites Collection
              var favoriteModel = new spiderOakApp.FavoriteModel(favorite);
              spiderOakApp.favoritesCollection.add(
                favoriteModel
              );
              console.log("adding: " + favorite.name);
              this.$(".rightButton").addClass("favorite");
              // Persist Favorites Collection to localStorage
              // window.store.set(
              window.store.set(
                "favorites-" + spiderOakApp.accountModel.get("b32username"),
                spiderOakApp.favoritesCollection.toJSON()
              );
              model.set("path", favorite.path);
              model.set("isFavorite", true);
              model.set("favoriteModel", favoriteModel);
              // Add the file to the recents collection (view or fave)
              spiderOakApp.recentsCollection.add(model);
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
