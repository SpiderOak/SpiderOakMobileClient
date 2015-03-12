/**
 * LoginView.js
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

  spiderOakApp.PreliminaryView = spiderOakApp.ViewBase.extend({
    className: "preliminary",
    destructionPolicy: "never",
    events: {
      "tap .loginButton": "loginButton_tapHandler",
      "tap .need-cta a": "needCta_tapHandler",
      "tap .learn-more": "learnMore_tapHandler"
    },
    initialize: function() {
      window.bindMine(this);
    },
    render: function() {
      this.$el.html(
        window.tmpl['preliminaryViewTemplate']({})
      );
      $(".learn-more").html(
        qq("Learn more about [[SpiderOak]] &raquo;",
           {SpiderOak: s("SpiderOak")})
      );
      return this;
    },
    loginButton_tapHandler: function(event) {
      event.preventDefault();
      window.store.set("showPreliminary", false);
      this.dismiss();
    },
    learnMore_tapHandler: function(event) {
      var learnMoreView = new spiderOakApp.LearnAboutView();
      $(".app").append(learnMoreView.$el);
      learnMoreView.render().show();
    },
    needCta_tapHandler: function(event) {
      var newAccountView = new spiderOakApp.AboutNewAccountView();
      $(".app").append(newAccountView.$el);
      newAccountView.render().show();
    },
    dismiss: function() {
      this.$el.animate({"-webkit-transform": "translate3d(0,-100%,0)"}, {
        duration: 100,
        complete: function() {
          this.remove();
        }.bind(this)
      });
    },
    show: function(duration) {
      this.$el.animate({"-webkit-transform": "translate3d(0,0,0)"}, duration || 100);
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
