(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      html10n     = window.html10n,
      $           = window.$;

  window.localizer = function () {
    return {
      /** Trivial place holder. */
      localizeString: function (str, options) {
        return html10n.get(str, options);
      }
    };
  }();

  window.qq = window.localizer.localizeString;

})(window);
