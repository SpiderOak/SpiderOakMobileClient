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
    showDialogView: function(view) {
      this.$el.html(view.render().el);
      this.$el.show();
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

  spiderOakApp.ContextPopup = Backbone.View.extend({
    className: "context-popup",
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      _.bindAll(this);
    },
    render: function() {
      this.$el.html(_.template(
        window.tpl.get("androidContextPopup"),
        {items: this.options.items}
      ));
      this.scroller = new window.iScroll(this.el, {
        bounce: !$.os.android,
        vScrollbar: false,
        hScrollbar: false
      });
      return this;
    },
    a_tapHandler: function(event) {
      this.trigger("item:tapped", event);
    },
    remove: function() {
      this.close();
      this.$el.remove();
      this.stopListening();
      return this;
    },
    close: function() {
      this.scroller.destroy();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
