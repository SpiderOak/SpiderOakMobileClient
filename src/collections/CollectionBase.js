/**
 * Collection.js
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
    /** For backwards compat with backbone up to v 0.9.10 */
    fetch: function(options) {
      // Add options.reset = true unless it's already, explicitly false.
      options = options || {};
      if (! options.hasOwnProperty("reset")) {
        options.reset = true;
      }
      Backbone.Collection.prototype.fetch.call(this, options);
    },
    which: "Collection (so)"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
