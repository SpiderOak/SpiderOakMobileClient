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
    initialize: function() {
      _.bindAll(this);
      $("#jqt").append(this.el);
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
    className: "arrow",
    initialize: function() {
      _.bindAll(this);
    },
    render: function() {
      this.$el.html(
        _.template(
          "<a href='#'>" +
          "<i class='icon-folder-close'></i> <%= name %>" +
          "</a>",
          this.model.toJSON()
        )
      );
      this.$("a").data("model",this.model);
      return this;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);