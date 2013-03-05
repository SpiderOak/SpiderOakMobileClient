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
      this.addAll();
      return this;
    },
    addOne: function(model) {
      model.url = this.collection.url + model.get("url");
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
      // @TODO: These should be different icons for different file types
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
        this.view();
      }.bind(this), 50);
      console.log(this.model.toJSON());
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
        window.setTimeout(function(){
          navigator.notification.alert(
            "This will remove from favorites",
            null,
            "TODO",
            "OK"
          );
        }, 50);
        this.$(".rightButton").removeClass("favorite");
        // If file exists in PERSISTENT file system, delete it
        // Remove model from the Favorites Collection
        // Persist Favorites Collection to localStorage
      }
      else {
        // Download the file to the PERSISTENT file system
        // Start by getting the folder path
        var path = "Download/SpiderOak/.favorites" +
          this.model.url
            .replace(
              new RegExp(spiderOakApp.accountModel.getStorageURL()),
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
          from: this.model.url,
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
        spiderOakApp.downloader.downloadFile(
          downloadOptions,
          function successCallback(fileEntry) {
            spiderOakApp.dialogView.hide();
            // @FIXME: Add file model (with added local path) to the Favorites Collection
            // @FIXME: Persist Favorites Collection to localStorage
            navigator.notification.alert(
              fileEntry.name + " added to Favorites",
              null,
              "Success",
              "OK"
            );
          },
          function errorCallback(error) { // @FIXME: Real error handling...
            spiderOakApp.dialogView.hide();
            console.log(error);
          }
        );
        this.$(".rightButton").addClass("favorite");
      }
    },
    view: function() {
      var downloadOptions = {
        fileName: this.model.get("name"),
        from: this.model.url,
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
            });
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
    close: function(){
      this.remove();
      this.unbind();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
