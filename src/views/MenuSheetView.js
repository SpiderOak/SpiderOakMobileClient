/**
 * MenuSheetView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.MenuSheetView = Backbone.View.extend({
    el: "#menusheet",
    events: {
      'focus #menu-search': 'menuSearch_focusHandler',
      'keyup #menu-search': 'menuSearch_changeHandler',
      'tap .clear-icon': 'clearIcon_tapHandler'
    },
    initialize: function() {
      _.bindAll(this);
      this.$el.bind('pageAnimationStart', this.pageAnimationStart_handler);
      this.$el.bind('pageAnimationEnd', this.pageAnimationEnd_handler);
    },
    render: function() {
      // $('#menusheet').menusheet('init');
      this.$('input[type=search]').attr('disabled',true);
      // Hax fix for container scrolling while menu is open.
      $('#jqt').on('scroll', function(event) {
        // Snap back if not after about the half way point...
        if (this.scrollLeft < ($(window).width() / 4)) {
          this.scrollLeft = 0;
        }
        // Or close if it is...
        else {
          $('#menusheet').menusheet('hide');
        }
      });
      return this;
    },
    pageAnimationStart_handler: function(event, data) {
      if (data.direction === "out") {
        this.$('input[type=search]').attr('disabled', true);
        this.$('input[type=search]').blur();
      }
    },
    pageAnimationEnd_handler: function(event, data) {
      if (data.direction === "in") {
        window.setTimeout(function(){
          this.$('input[type=search]').removeAttr('disabled');
        },100);
      }
    },
    menuSearch_focusHandler: function(event) {
      // ...
    },
    menuSearch_changeHandler: function(event) {
      if ($(event.target).val().length) {
        this.$('.clear-icon').show();
      }
      else {
        this.$('.clear-icon').hide();
      }
    },
    clearIcon_tapHandler: function(event) {
      $('#menu-search').val('');
      this.$('.clear-icon').hide();
    }
  });
  spiderOakApp.menuSheetView = new spiderOakApp.MenuSheetView().render();

})(window.spiderOakApp = window.spiderOakApp || {}, window);
