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

  spiderOakApp.DevicesListView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.collection.fetch();
    },
    render: function() {
      // @TODO: Add a "loading spinner" row at the top
      this.addAll();
      // @TODO: Then when we are done, clear the "loading spinner"
      return this;
    },
    addOne: function(model) {
      model.url = this.collection.url + model.get("url");
      var view = new spiderOakApp.DeviceItemView({
        model: model
      });
      view.render();
      this.$el.append(view.el);
    },
    addAll: function() {
      this.$el.empty();
      this.collection.each(this.addOne, this);
    }
  });

  spiderOakApp.DeviceItemView = Backbone.View.extend({
    tagName: "li",
    className: "",
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {
      this.$el.html(
        _.template(
          "<a href='#' data-url='<%= url %>'>" +
          "<i class='icon-folder-close'></i> <%= name %></a>",
          this.model.toJSON()
        )
      );
      return this;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
