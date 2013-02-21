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
        navigator.notification.alert(
          "Still looking for a good way to handle viewing files...",
          null,
          "TODO",
          "OK"
        );
      }, 50);
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
    close: function(){
      this.remove();
      this.unbind();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
