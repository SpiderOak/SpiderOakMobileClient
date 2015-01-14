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
      qq          = window.qq,
      s           = window.s;

  spiderOakApp.DialogView = spiderOakApp.ViewBase.extend({
    className: "modal",
    events: {
      "tap .cancel-btn a": "cancel_tapHandler"
    },
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
      options.title = options.title || qq("Please wait");
      options.subtitle = options.subtitle || "";
      this.$el.html(window.tmpl["waitDialog"](options));
      if (options.showCancel && $.os.ios) this.$(".cancel-btn").show();
      this.$el.show();
    },
    showNotifyErrorResponse: function(response, options) {
      options = options ? _.clone(options) : {};
      options.title = options.title || ("<i class='icon-warning'></i>" +
                                        qq("Error"));
      options.duration = options.duration || 4000;
      options.subtitle = ((options.subtitle && (options.subtitle + ": ")) ||
                          "");
      options.subtitle += (response.statusText || qq("Network timeout") +
                           "<br>(" + qq("status") + ": " +
                           (response.status || 0) + ")");
      return this.showNotify(options);
    },
    showNotify: function(options) {
      options = options || {};
      options.title = options.title || qq("Done"); // terrible default ;)
      options.subtitle = options.subtitle || "";
      options.duration = options.duration || 2000; // in ms
      this.$el.html(window.tmpl["waitDialog"](options));
      this.$(".fadingBarsG").hide();
      this.$el.show();
      window.setTimeout(function() {
        this.hide();
      }.bind(this), options.duration);
    },
    showToast: function(options) {
      options = options || {};
      options.title = options.title || qq("Done"); // terrible default ;)
      options.duration = options.duration || 1000; // in ms
      options.onShow = options.onShow || function(){};
      options.onHide = options.onHide || function(){};
      this.$el.html(window.tmpl["toastDialog"](options));
      this.$el.css({
        backgroundColor: "rgba(0,0,0,0)"
      });
      this.$el.show();
      options.onShow();
      window.setTimeout(function() {
        this.hide();
        options.onHide();
        this.$el.css({
          backgroundColor: "rgba(0,0,0,0.7)"
        });
      }.bind(this), options.duration);
    },
    cancel_tapHandler: function(event) {
      event.preventDefault();
      $(document).trigger("backbutton");
    },
    hide: function() {
      $(window).off(this.orientationEvent);
      this.$el.hide();
      this.$el.empty();
    },
    showProgress: function(options) {
      options = options || {};
      options.title = options.title || qq("Please wait");
      options.subtitle = options.subtitle || "";
      options.start = options.start || 0;
      this.$el.html(window.tmpl["progressDialog"](options));
      if (options.showCancel && $.os.ios) this.$(".cancel-btn").show();
      this.$el.show();
    },
    updateProgress: function(progressPercent) {
      if ($.os.ios) progressPercent = progressPercent * 2; // WHY?! GAH!!
      if (progressPercent > 100) {
        progressPercent = 100;
      }
      this.$(".meter .progress").animate({"width":progressPercent+"%"});
    },
    showDialogView: function(view) {
      $(window).on(this.orientationEvent, function() {
        // alert("The rotation is " + window.orientation + " and the resolution is " + screen.width + " x " + screen.height);
        if (window.orientation === -90 || window.orientation === 90) {
          view.$el.css({"margin-top":"0", "max-height":"300px"});
          window.setTimeout(function(){
            view.scroller.refresh();
          },10);
        }
        else {
          view.$el.css({"margin-top":"10%", "max-height":"94%"});
          window.setTimeout(function(){
            view.scroller.refresh();
          },10);
        }
      }, false);
      this.$el.html(view.render().el);
      if (window.orientation === -90 || window.orientation === 90) {
        view.$el.css({"margin-top":"0", "max-height":"300px"});
      }
      window.setTimeout(function(){
        view.scroller.refresh();
      },10);
      if ($.os.ios) {
        // the stupid -50% is to keep it centered on iPad
        var _this = this;
        view.$el.css({"-webkit-transform":"translate3d(-50%,100%,0)"});
        this.$el.show();
        window.setTimeout(function(){
          view.$el.animate(
            {"-webkit-transform":"translate3d(-50%,0,0)"}, 150, 'ease-in-out');
        },50);
      } else {
        this.$el.show();
      }
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

  spiderOakApp.ContextPopup = spiderOakApp.ViewBase.extend({
    className: "context-popup",
    events: {
      "tap a": "a_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
    },
    render: function() {
      this.$el.html(
        window.tmpl["contextPopup"]({
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
