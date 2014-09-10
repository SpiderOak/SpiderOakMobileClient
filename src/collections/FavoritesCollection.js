/**
 * FavoritesCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.FavoritesCollection = spiderOakApp.CollectionBase.extend({
    model: spiderOakApp.FavoriteModel,
    comparator: function(object) {
      return object.get("name");
    },
    favPathForModel: function(model) {
      var base = "Download/" + window.s("SpiderOak") + "/.favorites/" +
            (spiderOakApp.accountModel.get("b32username") || "anonymous"),
          modelUrl = (model.composedUrl(true)
                      .replace(new RegExp("^.*(share|storage)\/([A-Z2-7]*)\/"),
                               "/$1/$2/")),
          splat = modelUrl.split("/");
      return(base + splat.slice(0, splat.length - 1).join("/")) + "/";
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
