/**
 * FileVersionModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function () {};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FileVersionModel = spiderOakApp.FileModel.extend({
    defaults: {
      isFavorite: false
    },
    composedUrl: function (bare) {
      var urlTail = this.get("url");
      var collection = this.collection;
      var urlHead = this.get("urlBase") || this.urlBase;
      var urlHeadObject = urlHead && this;
      if (! urlHead && collection) {
        urlHead = (collection.get("urlBase") ||
                   collection.urlBase ||
                   collection.url ||
                   "");
        urlHeadObject = urlHead && collection;
      }
      if (typeof urlHead === "function") {
        urlHead = urlHead.call(urlHeadObject);
      }
      if (typeof urlTail === "function") {
        urlTail = urlTail.call(this);
      }
      // A version collection url contains the name of the file
      // We don't want that in the individual model's url
      urlHead = urlHead.substring(0, urlHead.lastIndexOf("/") + 1);
      if (bare) {
        urlHead = urlHead.split("?")[0];
      }
      return (urlHead || "") + (urlTail || "");
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
