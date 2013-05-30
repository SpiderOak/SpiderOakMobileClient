/**
 * FileView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      store       = window.store;

  spiderOakApp.FilesListView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.subViews = [];

      this.collection.fetch({
        error: function(collection, response, options) {
          this.render().addAll();
          console.log(JSON.stringify(response.statusText));
          spiderOakApp.dialogView.showNotify({
            title: "<i class='icon-warning'></i> Error",
            subtitle: "An error occurred.",
            duration: 3000
          });
        }.bind(this)
      });
    },
    render: function() {
      // this.addAll();
      return this;
    },
    addOne: function(model) {
      if (spiderOakApp.maxEntries &&
          this.fileCounter > spiderOakApp.maxEntries) {
        return;
      }
      if (this.collection.getPassword()) {
        model.setPassword(this.collection.getPassword());
      }
      this.fileCounter++;
      // @FIXME: Is this the best pattern for this?
      if (spiderOakApp.favoritesCollection &&
                  spiderOakApp.favoritesCollection.models &&
                  spiderOakApp.favoritesCollection.models.length > 0) {
        var isFavorite = _.find(
          spiderOakApp.favoritesCollection.models, function(favorite){
            var faveURL = favorite.get("url");
            var modelURL = model.composedUrl(true);
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
      this.fileCounter = 1;
      if (this.collection.length > spiderOakApp.maxEntries) {
        this.$el.append(
          "<li class='sep'><i class='icon-warning'></i>" +
          " Too many files. Displaying first " +
          spiderOakApp.maxEntries +
          ".</li>"
        );
      }
      this.collection.each(this.addOne, this);
      this.$el.trigger("complete");
    },
    close: function() {
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

  spiderOakApp.FileView = Backbone.View.extend({
    downloadFile: function(model, path, successCallback) {
      // Download the file to the PERSISTENT file system
      // @FIXME: This might be better moved to a method in the model
      spiderOakApp.dialogView.showProgress({
        title: "Downloading",
        subtitle: model.get("name"),
        start: 0
      });
      var downloadOptions = {
        fileName: model.get("name"),
        from: model.composedUrl(true),
        to: decodeURI(path),
        fsType: window.LocalFileSystem.PERSISTENT,
        onprogress: function onprogress(progressEvent) {
          if (progressEvent.lengthComputable) {
            var percentComplete =
                  ((progressEvent.loaded / 2) / progressEvent.total) * 100;
            percentComplete = percentComplete <= 100 ? percentComplete : 100;
            spiderOakApp.dialogView.updateProgress(percentComplete);
          }
        },
        headers: {
          "Authorization": (
            model.getBasicAuth() ||
                spiderOakApp.accountModel.get("basicAuthCredentials"))
        }
      };
      spiderOakApp.downloader.downloadFile(
        downloadOptions,
        successCallback,
        function errorCallback(error) { // @FIXME: Real error handling...
          spiderOakApp.dialogView.hide();
          console.log(JSON.stringify(error));
          switch (error.code) {
            case window.FileError.NOT_FOUND_ERR:
              console.log("FileError.NOT_FOUND_ERR");
              break;
            case window.FileError.SECURITY_ERR:
              console.log("FileError.SECURITY_ERR");
              break;
            case window.FileError.ABORT_ERR:
              console.log("FileError.ABORT_ERR");
              break;
            case window.FileError.NOT_READABLE_ERR:
              console.log("FileError.NOT_READABLE_ERR");
              break;
            case window.FileError.ENCODING_ERR:
              console.log("FileError.ENCODING_ERR");
              break;
            case window.FileError.NO_MODIFICATION_ALLOWED_ERR:
              console.log("FileError.NO_MODIFICATION_ALLOWED_ERR");
              break;
            case window.FileError.INVALID_STATE_ERR:
              console.log("FileError.INVALID_STATE_ERR");
              break;
            case window.FileError.SYNTAX_ERR:
              console.log("FileError.SYNTAX_ERR");
              break;
            case window.FileError.INVALID_MODIFICATION_ERR:
              console.log("FileError.INVALID_MODIFICATION_ERR");
              break;
            case window.FileError.QUOTA_EXCEEDED_ERR:
              console.log("FileError.QUOTA_EXCEEDED_ERR");
              break;
            case window.FileError.TYPE_MISMATCH_ERR:
              console.log("FileError.TYPE_MISMATCH_ERR");
              break;
            case window.FileError.PATH_EXISTS_ERR:
              console.log("FileError.PATH_EXISTS_ERR");
              break;
          }
        }
      );
    },
    saveFavorite: function() {
      if (spiderOakApp.accountModel.get("favoritesConfirmationAccepted")) {
        // Skip confirmation
        this.saveFavoriteConfirmed(1);
      }
      else {
        navigator.notification.confirm(
          "Do you want to add this file to your favorites? This will " +
              " download the contents to your device.",
          this.saveFavoriteConfirmed,
          "Favorites"
        );
      }
    },
    saveFavoriteConfirmed: function(button) {
      if (button !== 1) {
        return;
      }
      var model = this.model;
      // Start by getting the folder path
      var path = "Download/SpiderOak/.favorites/" +
        (spiderOakApp.accountModel.get("b32username") || "anonymous") +
        model.composedUrl(true)
          .replace(new RegExp("^.*(share|storage)\/([A-Z2-7]*)\/"), "/$1/$2/")
          .replace(new RegExp(model.get("url")), "");
      var favorite = model.toJSON();
      favorite.path = decodeURI(path);
      favorite.encodedUrl = favorite.url;
      favorite.url = model.composedUrl(true);
      favorite.isFavorite = true;

      if (spiderOakApp.accountModel.get("isLoggedIn")) {
        store.set("favoritesConfirmationAccepted-" +
          spiderOakApp.accountModel.get("b32username"), true);
      }
      else {
        store.set("favoritesConfirmationAccepted", true);
      }
      spiderOakApp.accountModel.set("favoritesConfirmationAccepted", true);
      this.downloadFile(model, path, function(fileEntry) {
        console.log(fileEntry.fullPath);
        spiderOakApp.dialogView.hide();
        // Add file model (with added local path) to the Favorites Collection
        var favoriteModel = new spiderOakApp.FavoriteModel(favorite);
        spiderOakApp.favoritesCollection.add(
          favoriteModel
        );
        console.log("adding: " + favorite.name);
        // this.$(".rightButton").addClass("favorite");
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
        var recentModels = spiderOakApp.recentsCollection.models;
        var matchingModels = _.filter(recentModels, function(recent){
          return recent.composedUrl(true) === model.composedUrl(true);
        });
        if (matchingModels.length > 1) {
//          console.log("Multiple duplicates detected...");
        }
        spiderOakApp.recentsCollection.remove(matchingModels[0]);
        spiderOakApp.recentsCollection.add(model);
      }.bind(this));
    },
    shareViaIntent: function(path) {
      // @FIXME: This is a bit Android-centric
      var model = this.model;
      var extras = {};
      extras[spiderOakApp.fileViewer.EXTRA_STREAM] = path;
      var params = {
        action: spiderOakApp.fileViewer.ACTION_SEND,
        type: model.get("type"),
        extras: extras
      };
      spiderOakApp.fileViewer.share(
        params,
        function() {
          // Add the file to the recents collection (view or fave)
          var recentModels = spiderOakApp.recentsCollection.models;
          var matchingModels = _.filter(recentModels, function(recent){
            return recent.composedUrl(true) === model.composedUrl(true);
          });
          if (matchingModels.length > 1) {
//            console.log("Multiple duplicates detected...");
          }
          spiderOakApp.recentsCollection.remove(matchingModels[0]);
          spiderOakApp.recentsCollection.add(model);
          // @FIXME: Should we be cleaning up the file here?
        },
        function(error) { // @FIXME: Real error handling...
          console.log(JSON.stringify(error));
          navigator.notification.alert(
            "Cannot find an app to handle files of this type.",
            null,
            "File error",
            "OK"
          );
        }
      );
    },
    sendLink: function() {
      var model = this.model;
      spiderOakApp.dialogView.showWait({subtitle:"Retrieving link"});

      var doView = function (url) {
        // @FIXME: This is a bit Android-centric
        spiderOakApp.dialogView.hide();
        var text = "I want to share this link to " + model.get("name") +
            " with you:\n\n  " + url;
        var extras = {};
        extras[spiderOakApp.fileViewer.EXTRA_TEXT] = text;
        var params = {
          action: spiderOakApp.fileViewer.ACTION_SEND,
          type: "text/plain",
          extras: extras
        };
        spiderOakApp.fileViewer.share(
          params,
          function(){
            // Add the file to the recents collection (view or fave)
            var recentModels = spiderOakApp.recentsCollection.models;
            var matchingModels = _.filter(recentModels, function(recent){
              return recent.composedUrl(true) === model.composedUrl(true);
            });
            if (matchingModels.length > 1) {
//              console.log("Multiple duplicates detected...");
            }
            spiderOakApp.recentsCollection.remove(matchingModels[0]);
            spiderOakApp.recentsCollection.add(model);
          },
          function(error) { // @FIXME: Real error handling...
            navigator.notification.alert(
              "Error sending this link. Try agains later.",
              null,
              "File error",
              "OK"
            );
          }
        );
      };

      // Try technique for contents of storage first, and if that fails
      // with result code 405, use url for contents of share rooms.
      var url = model.composedUrl(true);
      var protohost = url.split("/").slice(0,3).join("/") + "/";
      $.ajax({
        type: "POST",
        url: url,
        headers: {
          "Authorization": (
            model.getBasicAuth() ||
                spiderOakApp.accountModel.get("basicAuthCredentials"))
        },
        success: function(result) {
          doView(protohost + result);
        },
        error: function (xhr, errorType, error) {
          if (xhr.status === 405 && url.split("/")[3] === "share") {
            // Handle as share room contents, which don't allow "POST":
            doView(url);
          }
          else {
            spiderOakApp.dialogView.showNotify({
              title: "Link fetch failed",
              subtitle: ("Access to link " + url + " failed: " +
                         xhr.statusText + " (" + xhr.status + ")")
            });
          }
        }
      });
    },
    shareFile: function() {
      var model = this.model;
      var path;
      // Start by getting the folder path
      if (this.model.get("isFavorite")) {
        path = this.model.get("path") + this.model.get("name");
        window.requestFileSystem(
          window.LocalFileSystem.PERSISTENT,
          0,
          function shareFavoriteGetFS(fileSystem) {
            fileSystem.root.getFile(
              path,
              {},
              function shareFavoriteGotFS(fileEntry) {
                this.shareViaIntent(fileEntry.fullPath);
              }.bind(this)
            );
          }.bind(this),
          function errorSharingFileByPath(error) { // @FIXME: Real error handling...
            navigator.notification.alert(
              "Error sharing file. Error code " + error.code,
              null,
              "File error",
              "OK"
            );
          }
        );
        return; // return early
      }
      path = "Download/SpiderOak/.shared/" +
        (spiderOakApp.accountModel.get("b32username") || "anonymous") +
        model.composedUrl(true)
          .replace(new RegExp("^.*(share|storage)\/([A-Z2-7]*)\/"), "/$1/$2/")
          .replace(new RegExp(model.get("url")), "");
      this.downloadFile(model, path, function(fileEntry) {
        spiderOakApp.dialogView.hide();
        this.shareViaIntent(fileEntry.fullPath);
      }.bind(this));
    },
    view: function() {
      var model = this.model;
      var downloadOptions = {
        fileName: this.model.get("name"),
        from: this.model.composedUrl(true),
        to: ".caches",
        fsType: window.LocalFileSystem.TEMPORARY,
        onprogress: function onprogress(progressEvent) {
          if (progressEvent.lengthComputable) {
            var percentComplete =
                  ((progressEvent.loaded / 2) / progressEvent.total) * 100;
            percentComplete = percentComplete <= 100 ? percentComplete : 100;
            spiderOakApp.dialogView.updateProgress(percentComplete);
          }
        },
        headers: {
          "Authorization": (
            model.getBasicAuth() ||
                spiderOakApp.accountModel.get("basicAuthCredentials"))
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

          if (model.get("openInternally") || $.os.ios) {
            window.open(encodeURI(fileEntry.fullPath),"_blank","location=no,enableViewportScale=yes");
          } else {
            spiderOakApp.fileViewer.view({
                action: spiderOakApp.fileViewer.ACTION_VIEW,
                url: fileEntry.fullPath,
                type: model.get("type")
              },
              function() {
                // Add the file to the recents collection (view or fave)
                var recentModels = spiderOakApp.recentsCollection.models;
                var matchingModels = _.filter(recentModels, function(recent){
                  return recent.composedUrl(true) === model.composedUrl(true);
                });
                if (matchingModels.length > 1) {
//                  console.log("Multiple duplicates detected...");
                }
                spiderOakApp.recentsCollection.remove(matchingModels[0]);
                spiderOakApp.recentsCollection.add(model);
                // @FIXME: Should we be cleaning up the file here?
              },
              function(error) { // @FIXME: Real error handling...
                console.log(JSON.stringify(error));
                navigator.notification.confirm(
                  "Cannot find an app to view files of this type. Would you like to try and open it anyway?",
                  function(button) {
                    if (button !== 1) {
                      return;
                    }
                    window.open(encodeURI(fileEntry.fullPath),"_blank","location=no");
                  }.bind(this),
                  "File error",
                  "Yes,No"
                );
              }
            );
          }
        },
        function(error) { // @FIXME: Real error handling...
          spiderOakApp.dialogView.hide();
          if (error.code) {
            if (error.code === window.FileTransferError.ABORT_ERR) {
              console.log("FileTransfer aborted");
              return;
            }
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
              if (model.get("openInternally") || $.os.ios) {
                window.open(encodeURI(fileEntry.fullPath),"_blank","location=no,enableViewportScale=yes");
              } else {
                spiderOakApp.fileViewer.view({
                    action: spiderOakApp.fileViewer.ACTION_VIEW,
                    url: encodeURI(fileEntry.fullPath),
                    type: model.get("type")
                  },
                  function() {
                    // Add the file to the recents collection (view or fave)
                    var recentModels = spiderOakApp.recentsCollection.models;
                    var matchingModels = _.filter(recentModels, function(recent){
                      return recent.composedUrl(true) === model.composedUrl(true);
                    });
                    if (matchingModels.length > 1) {
  //                    console.log("Multiple duplicates detected...");
                    }
                    spiderOakApp.recentsCollection.remove(matchingModels[0]);
                    spiderOakApp.recentsCollection.add(model);
                  },
                  function(error) { // @FIXME: Real error handling...
                    navigator.notification.alert(
                      "Cannot find an app to view files of this type.",
                      null,
                      "File error",
                      "OK"
                    );
                  }
                );
              }
            },
            function(error) {
              console.log(JSON.stringify(error));
              navigator.notification.alert(
                "Error viewing file.",
                null,
                "File error",
                "OK"
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
    saveFile: function() {
      // Confirmation dialog
      var model = this.model;
      // Start by getting the folder path
      var path = "Download/";
      navigator.notification.confirm(
        "Do you want to save this file to your device?",
        function(button) {
          if (button !== 1) {
            return;
          }
          this.downloadFile(model, path, function(fileEntry) {
            spiderOakApp.dialogView.hide();
            // Add the file to the recents collection (view or fave)
            var recentModels = spiderOakApp.recentsCollection.models;
            var matchingModels = _.filter(recentModels, function(recent){
              return recent.composedUrl(true) === model.composedUrl(true);
            });
            if (matchingModels.length > 1) {
//              console.log("Multiple duplicates detected...");
            }
            spiderOakApp.recentsCollection.remove(matchingModels[0]);
            spiderOakApp.recentsCollection.add(model);
            navigator.notification.alert(
              fileEntry.name + " saved to " + path + fileEntry.name,
              null,
              "Success",
              "OK"
            );
          }.bind(this));
        }.bind(this),
        "Save file"
      );
    },
    refreshFavorite: function(callback) {
      var model = this.model;
      // @FIXME: This should be in a function and be based on platform
      var path = "Download/SpiderOak/.favorites/" +
        (spiderOakApp.accountModel.get("b32username") || "anonymous") +
        model.composedUrl(true)
          .replace(new RegExp("^.*(share|storage)\/([A-Z2-7]*)\/"), "/$1/$2/")
          .replace(new RegExp(model.get("encodedUrl") || model.get("url")), "");
      callback = callback || function(fileEntry) {
        spiderOakApp.dialogView.hide();
      };
      this.downloadFile(model, path, callback);
    },
    removeFavorite: function() {
      // Confirmation dialog
      navigator.notification.confirm(
        "Do you want to remove this file from your favorites?",
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
          // this.$(".rightButton").removeClass("favorite");
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
          // First determine if this.model is a file model or a favorite model
          var model = null;
          if (this.model.get("favoriteModel")) {
            model = this.model.get("favoriteModel");
          }
          else {
            model = this.model;
          }
          // ...then remove it
          spiderOakApp.favoritesCollection.remove(model);
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
    }
  });

  spiderOakApp.FilesListItemView = spiderOakApp.FileView.extend({
    tagName: "li",
    events: {
      "tap a": "a_tapHandler",
      "longTap a": "a_longTapHandler",
      "tap .rightButton": "favorite_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      this.model.on("change",this.render);
    },
    render: function() {
      // if (window.Modernizr.overflowscrolling) {
        this.$el.html(
          _.template(window.tpl.get("fileItemViewTemplate"),
            this.model.toJSON()
          )
        );
      // }
      // else {
      //   this.$el.html(
      //     _.template(window.tpl.get("fileItemViewMinTemplate"),
      //       this.model.toJSON()
      //     )
      //   );
      // }
      this.$("a").data("model",this.model);
      return this;
    },
    a_tapHandler: function(event) {
      event.preventDefault();
      event.stopPropagation();
      if ($("#main").hasClass("open")) {
        spiderOakApp.mainView.closeMenu();
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
      if ($("#main").hasClass("open")) {
        return;
      }
      var items = [
          {className: "open", description: "Open"},
          {className: "details", description: "Details"},
          {className: "send-link", description: "Send link"},
          {className: "save", description: "Save file"},
          {className: "share", description: "Share file"}
      ];
      if (this.model.get("isFavorite")) {
        items.push({
          className: "refresh-favorite", description: "Refresh favorite"
        });
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
            spiderOakApp.navigator.pushView(
              spiderOakApp.FileItemDetailsView,
              { model: this.model },
              spiderOakApp.defaultEffect
            );
            break;
          case "send-link":
            this.sendLink();
            break;
          case "save":
            this.saveFile();
            break;
          case "share":
            this.shareFile();
            break;
          case "favorite":
            this.saveFavorite();
            break;
          case "refresh-favorite":
            this.refreshFavorite();
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
      if (this.model.get("isFavorite")) {
        this.removeFavorite();
      }
      else {
        this.saveFavorite();
      }
    },
    close: function() {
      this.remove();
      this.unbind();
    }
  });

  spiderOakApp.FileItemDetailsView = spiderOakApp.FileView.extend({
//    destructionPolicy: "never",
    initialize: function() {
      _.bindAll(this);
      this.model.on("change",this.render);
      this.on("viewActivate",this.viewActivate);
      this.on("viewDeactivate",this.viewDeactivate);
      spiderOakApp.navigator.on("viewChanging",this.viewChanging);
    },
    render: function() {
      this.$el.html(_.template(window.tpl.get("fileItemDetailsViewTemplate"),
        this.model.toJSON()));
      // spiderOakApp.mainView.setTitle("Details for " + this.model.get("name"));
      spiderOakApp.mainView.setTitle("Details");

      var isVersionDetails = /\?version=[0-9]/.test(this.model.get("url"));

      this.toolbarView = new spiderOakApp.FileItemDetailsToolbarView({
        model: this.model,
        disabled: isVersionDetails
      });
      this.toolbarView.$el.on("shareFile", this.shareFile, event);
      this.toolbarView.$el.on("saveFile", this.saveFile, event);
      this.toolbarView.$el.on("sendLink", this.sendLink, event);
      this.toolbarView.$el.on("favorite", this.favorite_tapHandler, event);

      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: !$.os.android,
        hScrollbar: false
      });
      // Insert list of previous versions here... if there are any
      if (this.model.get("versions") > 1) {
        this.$(".versions").show();
        this.versionsCollection = new spiderOakApp.FileItemVersionsCollection();
        this.versionsCollection.url = this.model.composedUrl(true) +
            "?format=version_info";
        this.versionsCollection.setPassword(this.model.getPassword());
        this.versionsView = new spiderOakApp.FileItemVersionsListView({
          collection: this.versionsCollection
        }).render();
        this.$(".versions").prepend(this.versionsView.el);
        this.$(".versions").prepend(
          "<ul><li class='sep'>Previous versions</li></ul>"
        );
        var scroller = this.scroller;
        this.versionsView.$el.one("complete", function(event) {
          this.$(".versionsViewLoading")
            .removeClass("loadingVersions");
          window.setTimeout(function(){
            this.scroller.refresh();
          }.bind(this),0);
          // @TODO: Refresh subviews scroller
        }.bind(this));
        this.versionsCollection.fetch({
          error: function(collection, response, options) {
            spiderOakApp.dialogView.showNotify({
              title: "<i class='icon-warning'></i> Error",
              subtitle: "An error occurred.",
              duration: 3000
            });
          }
        });
      }
      return this;
    },
    favorite_tapHandler: function(event) {
      if (this.model.get("isFavorite")) {
        this.removeFavorite();
        return;
      }
      this.saveFavorite();
    },
    viewChanging: function(event) {
      if (!event.toView || event.toView === this) {
        spiderOakApp.backDisabled = true;
      }
      else {
        if (this.toolbarView) this.toolbarView.close();
        spiderOakApp.toolbarView.hide();
      }
    },
    viewActivate: function(event) {
      spiderOakApp.backDisabled = false;
      spiderOakApp.mainView.showBackButton(true);
      if (this.toolbarView) {
        spiderOakApp.toolbarView.addButtonsView(this.toolbarView).show();
      }
    },
    viewDeactivate: function(event) {
      this.close();
    },
    close: function() {
      this.scroller.destroy();
      if (this.versionsView) {
        this.versionsView.close();
      }
      if (this.toolbarView) {
        this.toolbarView.close();
      }
      this.remove();
      this.unbind();
    }
  });

  spiderOakApp.FileItemDetailsToolbarView = Backbone.View.extend({
    events: {
      "tap .file-share-button.enabled": "shareFile_tapHandler",
      "tap .file-save-button.enabled": "saveFile_tapHandler",
      "tap .file-send-button.enabled": "sendLink_tapHandler",
      "tap .file-favorite-button.enabled": "favorite_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      this.model.on("change", this.render);
    },
    render: function() {
      this.$el.html(
        _.template(window.tpl.get("fileItemDetailsToolbarViewTemplate"),
         {isFavorite: this.model.get("isFavorite"),
           disabled: this.options.disabled}
        )
      );
      return this;
    },
    shareFile_tapHandler: function(event) {
      this.$el.trigger("shareFile", event);
    },
    saveFile_tapHandler: function(event) {
      this.$el.trigger("saveFile", event);
    },
    sendLink_tapHandler: function(event) {
      this.$el.trigger("sendLink", event);
    },
    favorite_tapHandler: function(event) {
      this.$el.trigger("favorite", event);
    },
    close: function() {
      spiderOakApp.toolbarView.hide();
      this.remove();
      this.unbind();
    }
  });

  spiderOakApp.FileItemVersionsListView = spiderOakApp.FilesListView.extend({
    tagName: "ul",
    initialize: function() {
      _.bindAll(this);
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.subViews = [];
    },
    addOne: function(model) {
      var view = new spiderOakApp.FilesVersionsItemView({
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
    close: function() {
      this.remove();
      this.unbind();
    }
  });

  spiderOakApp.FilesVersionsItemView = spiderOakApp.FilesListItemView.extend({
    render: function() {
      // fileVersionsItemViewMinTemplate
      // if (window.Modernizr.overflowscrolling) {
        this.$el.html(
          _.template(window.tpl.get("fileVersionsItemViewTemplate"),
            this.model.toJSON()
          )
        );
      // }
      // else {
      //   this.$el.html(
      //     _.template(window.tpl.get("fileVersionsItemViewMinTemplate"),
      //       this.model.toJSON()
      //     )
      //   );
      // }
      this.$("a").data("model",this.model);
      return this;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
