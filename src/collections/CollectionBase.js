/**
 * CollectionBase.js
 *
 * Application-specific tailorings of Backbone.Collection go here.
 *
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.CollectionBase = Backbone.Collection.extend({
    model: spiderOakApp.ModelBase,
    set: function(models, options) {
      var got = Backbone.Collection.prototype.set.call(this, models, options);
      this.trigger("complete");
      return got;
    },

    which: "CollectionBase"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
