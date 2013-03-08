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
      this.views = [];
      _.bindAll(this);
      // "add" might not be in use in read-only version
      this.collection.on( "add", this.addOne, this );
      this.collection.on( "reset", this.addAll, this );
      this.collection.on( "all", this.render, this );

      this.subViews = [];

      this.collection.fetch();
    },
    render: function() {
      // @TODO: Add a "loading spinner" row at the top
      // this.addAll();
      // @TODO: Then when we are done, clear the "loading spinner"
      return this;
    },
    addOne: function(model) {
      model.url = this.collection.url + model.get("url");
      var view = new spiderOakApp.DeviceItemView({
        model: model
      });
      this.$el.append(view.render().el);
      this.subViews.push(view);
      this.$el.trigger("complete");
    },
    addAll: function() {
      this.$el.empty(); // needed still?
      this.collection.each(this.addOne, this);
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

  spiderOakApp.DeviceItemView = Backbone.View.extend({
    tagName: "li",
    className: "",
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {
      this.$el.html(
        _.template(
          "<a href='#storage'>" +
          "<i class='icon-folder'></i> <%= name %>" +
          "</a>",
          this.model.toJSON()
        )
      );
      this.$("a").data("model", this.model);
      return this;
    },
    a_tapHandler: function(event) {
      spiderOakApp.mainView.closeMenu(event);
      var options = {
        id: this.model.cid,
        title: this.model.get("name"),
        model: this.model
      };
      $("#menusheet ul li").removeClass("current");
      this.$el.addClass("current");
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.FolderView,
          options,
          spiderOakApp.noEffect
        );
        return;
      }
      else if (_.last(spiderOakApp.navigator.viewsStack)
                .instance.model.cid === this.model.cid) {
        return;
      }
      spiderOakApp.navigator.replaceAll(
        spiderOakApp.FolderView,
        options,
        spiderOakApp.noEffect
      );
    },
    close: function(){
      this.remove();
      this.unbind();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
