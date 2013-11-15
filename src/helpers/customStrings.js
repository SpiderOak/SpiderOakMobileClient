(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  window.customizeStrings = function () {
    return {
      /** Customize string
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
        window.customizeStrings.stringsTable = {};
        var tables = {app: {}, custom: {}};
        var key, i, it;
        var consolidate = function () {
          // Actually do the consolidation only when we've collected everything.
          var populate = function (value, key) {
            window.customizeStrings.stringsTable[key] = value;
          };
          // Depend on tables.app and tables.custom being iterable; do app
          // first, so custom entries prevail when both are present:
          $.map(tables.app, populate);
          $.map(tables.custom, populate);
        };
        var loadStringsJSON = function(fileURL, tableName) {
          return $.ajax({dataType: "json",
                         url: fileURL,
                         data: null,
                         success: function(data) {
                           if (data) {
                             tables[tableName] = data;
                             consolidate();
                           }
                         },
                         error: function(xhr, status, err) {
                           console.log("*** customizeStrings: '" +
                                       fileURL +
                                       "' - " +
                                       status +
                                       ": " +
                                       err);
                         }
               });
        };
        loadStringsJSON("appStrings.json", "app");
        loadStringsJSON("customAppStrings.json", "custom");
      },
      stringsTable: {}
    };
  }();

  window.customizeStrings.fetchStringTables();
  window.s = window.customizeStrings.customizeString;

})(window);
