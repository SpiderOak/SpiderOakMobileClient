/**
 * ToolbarView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.ToolbarView = Backbone.View.extend({
    el: "#toolbar",
    events: {
      // ...
    },
    initialize: function() {
      window.bindMine(this);
    },
    render: function() {
      return this;
    },
    show: function() {
      this.$el.show();
    },
    hide: function() {
      this.$el.html("<div class='clear'></div>");
      this.$el.hide();
    },
    addButtonsView: function(view) {
      this.$el.prepend(view.render().el);
      return this;
    }
  });
  spiderOakApp.toolbarView = new spiderOakApp.ToolbarView().render();

})(window.spiderOakApp = window.spiderOakApp || {}, window);
