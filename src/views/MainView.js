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
      'tap .menu-btn': 'menuButton_handler',
      'tap .back-btn': 'backButton_hanlder'
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
      $('#main').animate({
        "-webkit-transform": "translate3d(270px,0,0)"
      },200,'ease-in-out');
      $("#main").addClass("open");
      // window.setTimeout(function(){
      //   $('#menu input[type=search]').removeAttr('disabled');
      // },300);
    },
    closeMenu: function(event) {
      if ($("#main").hasClass("open")) {
        $('#main').animate({
          "-webkit-transform": "translate3d(0,0,0)"
        },200,'ease-in-out');
        $('#menu input[type=search]').blur();
        // window.setTimeout(function(){
        //   $('#menu input[type=search]').attr('disabled',true);
        // },200);
        $("#main").removeClass("open");
      }
    }
  });
  spiderOakApp.mainView = new spiderOakApp.MainView().render();

})(window.spiderOakApp = window.spiderOakApp || {}, window);
