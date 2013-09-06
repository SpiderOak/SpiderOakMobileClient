/**
 * DialogView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.DialogView = Backbone.View.extend({
    className: "modal",
    initialize: function() {
      window.bindMine(this);
      var supportsOrientationChange = "onorientationchange" in window;
      this.orientationEvent = supportsOrientationChange ?
                                "orientationchange" :
                                "resize";
    },
    render: function() {
      $("body").append(this.el);
      return this;
    },
    showWait: function(options) {
      options = options || {};
      options.title = options.title || "Please wait";
      options.subtitle = options.subtitle || "";
      this.$el.html(window.tmpl["waitDialog"](options));
      this.$el.show();
    },
    showNotifyErrorResponse: function(response, options) {
      options = options ? _.clone(options) : {};
      options.title = options.title || "<i class='icon-warning'></i> Error";
      options.duration = options.duration || 4000;
      options.subtitle = ((options.subtitle && (options.subtitle + ": ")) ||
                          "");
      options.subtitle += (response.statusText || "Network timeout " +
                           "<br>(status: " + response.status || 0 + ")");
      return this.showNotify(options);
    },
    showNotify: function(options) {
      options = options || {};
      options.title = options.title || "Done"; // terrible default ;)
      options.subtitle = options.subtitle || "";
      options.duration = options.duration || 2000; // in ms
      this.$el.html(window.tmpl["waitDialog"](options));
      this.$(".fadingBarsG").hide();
      this.$el.show();
      window.setTimeout(function(){
        this.hide();
      }.bind(this), options.duration);
    },
    hide: function() {
      $(window).off(this.orientationEvent);
      this.$el.hide();
      this.$el.empty();
    },
    showProgress: function(options) {
      options = options || {};
      options.title = options.title || "Please wait";
      options.subtitle = options.subtitle || "";
      options.start = options.start || 0;
      this.$el.html(window.tmpl["progressDialog"](options));
      this.$el.show();
    },
    updateProgress: function(progressPercent) {
      this.$(".meter .progress").animate({"width":progressPercent+"%"});
    },
    showDialogView: function(view) {
      $(window).on(this.orientationEvent, function() {
        // alert("The rotation is " + window.orientation + " and the resolution is " + screen.width + " x " + screen.height);
        if (window.orientation === -90 || window.orientation === 90) {
          view.$el.css({"margin-top":"0", "max-height":"275px"});
          window.setTimeout(function(){
            view.scroller.refresh();
          },10);
        }
        else {
          view.$el.css({"margin-top":"10%", "max-height":"90%"});
          window.setTimeout(function(){
            view.scroller.refresh();
          },10);
        }
      }, false);
      this.$el.html(view.render().el);
      if (window.orientation === -90 || window.orientation === 90) {
        view.$el.css({"margin-top":"0", "max-height":"275px"});
      }
      window.setTimeout(function(){
        view.scroller.refresh();
      },10);
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
      window.bindMine(this);
    },
    render: function() {
      this.$el.html(
        window.tmpl["androidContextPopup"]({
          items: this.options.items
        })
      );
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
