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
    templateID: "#fileItemViewTemplate",
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
        _.template($(this.templateID).text(),
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
      window.setTimeout(function(){
        navigator.notification.alert(
          "This will add to favorites",
          null,
          "TODO",
          "OK"
        );
      }, 50);
    },
    view: function() {
      window.requestFileSystem(
        window.LocalFileSystem.TEMPORARY,
        0,
        this.gotFS,
        function(error) { // @FIXME: Real error handling...
          console.log(error);
        }
      );
    },
    gotFS: function(fileSystem) {
      fileSystem.root.getDirectory(
        "data", // @FIXME: What does this path really need to be?
        {create: true, exclusive: false},
        this.gotDir,
        function(error){ // @FIXME: Real error handling...
          console.log(error);
        }
      );
    },
    gotDir: function(dirEntry) {
      dirEntry.getFile(
        this.model.get("name"),
        {create: true, exclusive: false},
        this.gotFile,
        function(error) { // @FIXME: Real error handling...
          console.log(error);
        }
      );
    },
    gotFile: function(fileEntry) {
      // Start FileTransfer here...
      var fileTransfer = new window.FileTransfer();

      var options = {
        headers: {
            "Authorization": spiderOakApp.accountModel
              .get("basicAuthCredentials")
        }
      };
      fileTransfer.onprogress = function(progressEvent) {
        if (progressEvent.lengthComputable) {
          var percentComplete =
                (progressEvent.loaded / progressEvent.total) * 100;
          spiderOakApp.dialogView.updateProgress(percentComplete);
        }
      };

      spiderOakApp.dialogView.showProgress({
        title: "Downloading",
        subtitle: this.model.get("name"),
        start: 0
      });

      $(document).one("backbutton", function(event) {
        fileTransfer.abort();
        spiderOakApp.dialogView.hide();
      });

      fileTransfer.download(
        this.model.url,
        fileEntry.fullPath,
        function(entry) {
          spiderOakApp.dialogView.hide();

          // if (this.model.get("openInternally")) {
          //   window.open(encodeURI(entry.fullPath),"_blank","location=no");
          // } else {
            spiderOakApp.fileViewer.view({
              action: spiderOakApp.fileViewer.ACTION_VIEW,
              url: encodeURI(entry.fullPath)
            }, null,
            function (error) { // @FIXME: Real error handling...
              navigator.notification.alert(
                "Cannot find an app to view files of this type.",
                null,
                "File error",
                "OK"
              );
            });
          // }
          console.log("download complete: " + entry.fullPath);
        }.bind(this),
        function(error) { // @FIXME: Real error handling...
          spiderOakApp.dialogView.hide();
          console.log("download error source " + error.source);
          console.log("download error target " + error.target);
          console.log("download error code " + error.code);
          console.log("download error status " + error.http_status);
        },
        false,
        options
      );
    },
    close: function(){
      this.remove();
      this.unbind();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
