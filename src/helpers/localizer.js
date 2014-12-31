(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  window.localizer = function () {
    return {
      /** Trivial place holder. */
      localizeString: function (str, options) {
        return str;
      }
    };
  }();

  window.qq = window.localizer.localizeString;

})(window);
