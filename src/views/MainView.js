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
      'touchend .menu-btn': 'menuButton_handler',
      'touchend .back-btn': 'backButton_hanlder'
    },
    initialize: function() {
      _.bindAll(this);
      $('.page').on('tap',this.closeMenu);
    },
    render: function() {
      return this;
    },
    showMenuButton: function(show) {
      if (show) {
        this.$('.menu-btn').show();
      }
      else {
        this.$('.menu-btn').hide();
      }
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
    menuButton_handler: function(event) {
      if (!$("#main").hasClass("open")) {
        this.openMenu();
      }
      else {
        this.closeMenu();
      }
      return false;
    },
    backButton_hanlder: function(event) {
      // ...
    },
    openMenu: function(event) {
      $(document).trigger("menuOpening");
      $('#main').animate({
        "-webkit-transform": "translate3d(270px,0,0)"
      },200,'ease-in-out');
      $("#main").addClass("open");
    },
    closeMenu: function(event) {
      $(document).trigger("menuClosing");
      if ($("#main").hasClass("open")) {
        $('#main').animate({
          "-webkit-transform": "translate3d(0,0,0)"
        },200,'ease-in-out');
        $('#menu input[type=search]').blur();
        $("#main").removeClass("open");
      }
    }
  });
  spiderOakApp.mainView = new spiderOakApp.MainView().render();

})(window.spiderOakApp = window.spiderOakApp || {}, window);
