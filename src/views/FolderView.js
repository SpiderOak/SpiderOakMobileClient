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
    // ...
  });

  spiderOakApp.FolderListView = Backbone.View.extend({
    tag: "ul",
    className: "edgetoedge",
    template: "", // _.template($('#folder-list-template').text()),
    initialize: function() {
      _.bindAll(this, "render", "addOne", "addAll");
      this.collection.on( "add", this.addOne, this ); // might not be in use in read-only version
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );
    },
    render: function() {
      // Add a "loading spinner" row at the top
    },
    addOne: function(model) {
      // ...
    },
    addAll: function() {
      // ...
    }
  });

  spiderOakApp.FolderListItemView = Backbone.View.extend({
    tag: "li",
    className: "arrow",
    template: "",
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {
      // ...
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);