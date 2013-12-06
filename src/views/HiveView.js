/**
 * HiveView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.HiveView = spiderOakApp.ViewBase.extend({
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
      this.model.on("change", this.render, this );
      this.model.fetch({
        error: function(model, response, options) {
          spiderOakApp.dialogView.showNotifyErrorResponse(response,
                                                          {duration: 3000});
        }
      });
    },
    render: function() {
      this.$el.empty();
      this.$el.html(window.tmpl["hiveViewTemplate"](this.model.toJSON()));
      this.$("a").data("model", this.model);
      this.$el.trigger("complete");
      return this;
    },
    a_tapHandler: function(event) {
      spiderOakApp.mainView.closeMenu(event);
      var options = {
        id: this.model.cid,
        title: s("SpiderOak Hive"),
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
