/**
 * StorageBarView.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.StorageBarView = spiderOakApp.ViewBase.extend({
    el: "#storagebar",
    initialize: function() {
      window.bindMine(this);
      this.model.on("change", this.render, this );
      this.model.fetch({
        error: function(model, response, options) {
          spiderOakApp.dialogView.showNotifyErrorResponse(response);
        }
      });
    },
    render: function() {
      this.$el.empty();
      this.$el.html(window.tmpl["storageBarTemplate"](this.model.toJSON()));
      return this;
    },
    empty: function() {
      this.$el.empty();
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
