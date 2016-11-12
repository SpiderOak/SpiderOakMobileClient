(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function () {};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  window.makeBasicAuthString = function (username, password) {
    // First encode UTF8 characters, to prevent any from choking btoa:
    var tok = window.encodeUTF8(username) + ':' + window.encodeUTF8(password);
    var hash = btoa(tok);
    return "Basic " + hash;
  };

  /** Return a new copy of options and options.headers with basic auth string.
   *
   * We avoid changing the original options object, and its existing
   * options.headers contained object, if any.
   *
   * @return (object} fresh Backbone .sync() options object
   * @param {object} options Backbone .sync() options object
   * @param {string} basicAuthString HTML authentication string
   */
  window.makeBasicOptionsHeader = function (options, basicAuthString) {
    var extendedOptions = _.extend({}, options);
    extendedOptions.headers = _.extend({}, options.headers || {});
    extendedOptions.headers.Authorization = basicAuthString;
    return extendedOptions;
  };
})(window);
