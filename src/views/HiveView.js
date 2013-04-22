/**
 * HiveView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.HiveView = Backbone.View.extend({
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
      this.model.on("change", this.render, this );
      this.model.fetch();
    },
    render: function() {
      this.$el.empty();
      this.$el.html(
        _.template(
          "<li><a href='#' class='hivefolder'>" +
            "<i class='icon-folder'></i> SpiderOak Hive</a></li>"
        )
      );
      this.$("a").data("model", this.model);
      this.$el.trigger("complete");
      return this;
    },
    a_tapHandler: function(event) {
      spiderOakApp.mainView.closeMenu(event);
      var options = {
        id: this.model.cid,
        title: "SpiderOak Hive",
        model: this.model
      };
      $("#menusheet ul li").removeClass("current");
      this.$("li").addClass("current");
      if (spiderOakApp.navigator.viewsStack.length === 0) {
        spiderOakApp.navigator.pushView(
          spiderOakApp.FolderView,
          options,
          spiderOakApp.noEffect
        );
        return;
      }
      else if (_.last(spiderOakApp.navigator.viewsStack)
                .instance.model === this.model) {
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
