(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  window.customizeStrings = function () {
    return {
      /** Customize strings
       *
       * @return (string} The result of doing a lookup against the tables
       * defined in www/customAppStrings.json and www/appStrings.json, in
       * that order.  The first matching mapping is returned, or if no
       * mappings are found, the original string is returned.
       *
       * @param {string} stringKey the customization string
       * @param {object} options (currently unused)
       */
      customizeString: function (stringKey, options) {
        var got = window.customizeStrings.stringsTable[stringKey];
        return (typeof got !== "string") ? stringKey : got;
      },
      fetchStringTables: function () {
        var app, custom, key, i, it;
        var consolidate = function () {
          // Actually do the consolidation only when we've collected everything.
          var populate = function (value, key) {
            window.customizeStrings.stringsTable[key] = value;
          };
          if (app && custom) {
            // Do app first, so custom entries take precedence:
            $.map(app, populate);
            $.map(custom, populate);
          }
        };
        $.getJSON("appStrings.json", function(data) {
          app = data; consolidate();
        });
        $.getJSON("customAppStrings.json", function(data) {
          custom = data; consolidate();
        });
      },
      stringsTable: {}
    };
  }();

  window.customizeStrings.fetchStringTables();
  window.s = window.customizeStrings.customizeString;

})(window);
