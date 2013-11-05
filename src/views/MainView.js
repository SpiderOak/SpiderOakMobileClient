/**
 * MainView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.MainView = Backbone.View.extend({
    el: "#main",
    events: {
      // Use touchend to work around a bug in ICS
      "tap .menu-btn": "menuButton_handler",
      "tap .back-btn": "backButton_handler"
    },
    initialize: function() {
      window.bindMine(this);
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
    setTitle: function(title,action) {
      var $title = this.$('.nav .title');
      if ($.os.android) {
        $title.html(title);
        return;
      }
      if (action == "pop") {
        $title.animate({opacity:0,"-webkit-transform":"translate(30%,0)"},125,"linear",function(){
          $title.css({"-webkit-transform":"translate(-30%,0)"});
          $title.html(title);
          $title.animate({opacity:1,"-webkit-transform":"translate(0,0)"},125,"ease-out");
        });
        return;
      }
      if (action == "push") {
        $title.animate({opacity:0,"-webkit-transform":"translate(-30%,0)"},125,"linear",function(){
          $title.css({"-webkit-transform":"translate(30%,0)"});
          $title.html(title);
          $title.animate({opacity:1,"-webkit-transform":"translate(0,0)"},125,"ease-out");
        });
        return;
      }
      $title.animate({opacity:0},150,"linear",function(){
        $title.html(title);
        $title.animate({opacity:1},150,"linear");
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
      if ($("#main").hasClass("open")) {
        this.closeMenu();
        return;
      }
      if (!spiderOakApp.backDisabled) {
        spiderOakApp.navigator.popView(spiderOakApp.defaultPopEffect);
      }
    },
    openMenu: function(event) {
      $(document).trigger("menuOpening");
      var duration = 200;
      $('#main').animate({
        translate3d: '270px,0,0'
      },duration,'ease-in-out');
      $("#main").addClass("open");
    },
    closeMenu: function(event) {
      $(document).trigger("menuClosing");
      var duration = 200;
      if ($("#main").hasClass("open") || window.inAction) {
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
