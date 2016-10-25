/**
 * ViewBase.js
 *
 * Application-specific tailorings of Backbone.View go here.
 *
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function () {};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.ViewBase = Backbone.View.extend({
    /** Compatability for pre-Backbone 1.1 versions. */
    constructor: function (options) {
      this.options = options;
      Backbone.View.apply(this, arguments);
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
