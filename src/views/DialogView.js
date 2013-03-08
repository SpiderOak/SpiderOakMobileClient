/**
 * DialogView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.DialogView = Backbone.View.extend({
    className: "modal",
    initialize: function() {
      _.bindAll(this);
    },
    render: function() {
      $("body").append(this.el);
      return this;
    },
    showWait: function(options) {
      options = options || {};
      options.title = options.title || "Please wait";
      options.subtitle = options.subtitle || "";
      this.$el.html(_.template(
        window.tpl.get("waitDialog"),
        options
      ));
      this.$el.show();
    },
    hide: function() {
      this.$el.hide();
      this.$el.empty();
    },
    showProgress: function(options) {
      options = options || {};
      options.title = options.title || "Please wait";
      options.subtitle = options.subtitle || "";
      options.start = options.start || 0;
      this.$el.html(_.template(
        window.tpl.get("progressDialog"),
        options
      ));
      this.$el.show();
    },
    updateProgress: function(progressPercent) {
      this.$(".meter .progress").animate({"width":progressPercent+"%"});
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
  spiderOakApp.dialogView = new spiderOakApp.DialogView().render();

})(window.spiderOakApp = window.spiderOakApp || {}, window);
