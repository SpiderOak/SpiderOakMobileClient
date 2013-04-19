/**
 * FileVersionModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FileVersionModel = spiderOakApp.FileModel.extend({
    defaults: {
      isFavorite: false
    },
    composedUrl: function() {
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
      // File versions have some extraneous query strings in their url
      urlHead = urlHead.replace(
        new RegExp(this.get("name") + "\\?format=version_info"), "");
      return (urlHead || "") + (urlTail || "");
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
