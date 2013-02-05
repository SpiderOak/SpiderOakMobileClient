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

      this.collection.fetch();
    },
    render: function() {
      this.addAll();
      // @TODO: Then when we are done, clear the "loading spinner"
      return this;
    },
    addOne: function(model) {
      console.log(this.collection.url);
      model.url = this.collection.url + model.get("url");
      var view = new spiderOakApp.FilesListItemView({
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

  spiderOakApp.FilesListItemView = Backbone.View.extend({
    tagName: "li",
    className: "arrow",
    initialize: function() {
      _.bindAll(this);
    },
    render: function() {
      this.$el.html(
        _.template(
          "<a href='#'>" +
          "<i class='icon-file'></i> <%= name %>" +
          "</a>",
          this.model.toJSON()
        )
      );
      this.$("a").data("model",this.model);
      return this;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);