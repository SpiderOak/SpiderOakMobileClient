/**
 * MainView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.MainView = Backbone.View.extend({
    el: "#main",
    events: {
      // Use touchend to work around a bug in ICS
      "touchend .menu-btn": "menuButton_handler",
      "touchend .back-btn": "backButton_handler"
    },
    initialize: function() {
      _.bindAll(this);
      $('.page').on('tap',this.closeMenu);
    },
    render: function() {
      this.showBackButton(false);
      return this;
    },
    showBackButton: function(show) {
      if (show) {
        this.$('.menu-btn').hide();
        this.$('.back-btn').show();
      }
      else {
        this.$('.menu-btn').show();
        this.$('.back-btn').hide();
      }
    },
    setTitle: function(title) {
      var $title = this.$('.nav .title');
      if ($.os.android) {
        $title.html(title);
        return;
      }
      $title.animate({opacity:0},50,"linear",function(){
        $title.html(title);
        $title.animate({opacity:1},50,"linear");
      });
    },
    menuButton_handler: function(event) {
      if (!$("#main").hasClass("open")) {
        this.openMenu();
      }
      else {
        this.closeMenu();
      }
      return false;
    },
    backButton_handler: function(event) {
      if (!spiderOakApp.backDisabled) {
        spiderOakApp.navigator.popView(spiderOakApp.defaultEffect);
      }
    },
    openMenu: function(event) {
      $(document).trigger("menuOpening");
      var duration = ($.os.android) ? 200 : 300;
      $('#main').animate({
        translate3d: '270px,0,0'
      },duration,'ease-in-out');
      $("#main").addClass("open");
    },
    closeMenu: function(event) {
      $(document).trigger("menuClosing");
      var duration = ($.os.android) ? 200 : 300;
      if ($("#main").hasClass("open")) {
        $('#main').animate({
          translate3d: '0,0,0'
        },duration,'ease-in-out');
        $('#menu input[type=search]').blur();
        $("#main").removeClass("open");
      }
    }
  });
  spiderOakApp.mainView = new spiderOakApp.MainView().render();

})(window.spiderOakApp = window.spiderOakApp || {}, window);
