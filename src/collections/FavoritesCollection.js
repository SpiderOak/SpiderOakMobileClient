/**
 * FavoritesCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function () {};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.FavoritesCollection = spiderOakApp.CollectionBase.extend({
    model: spiderOakApp.FavoriteModel,
    /** Get root of favorites path for current user */
    basePath: function () {
      return ("Download/" +
              s("SpiderOak") +
              "/.favorites/" +
              (spiderOakApp.accountModel.get("b32username") || "anonymous"));
    },
    comparator: function (object) {
      return object.get("name");
    },
    /** Persist locally. */
    store: function () {
      window.store.set(
        "favorites-" + spiderOakApp.accountModel.get("b32username"),
        this.toJSON()
      );
    },
    removeFavoriteness: function (model) {
      var theFav;
      theFav = model.get("favoriteModel") || model;
      this.remove(theFav);
      this.store();
      // Put the model back to unfavorited state
      model.unset("path");
      model.set("isFavorite", false);
      model.unset("favoriteModel");
      // Update recents with this one:
      spiderOakApp.recentsCollection.replace(model);
      console.log("Favorite removed.");
    },
    favPathForModel: function (model) {
      var base = "Download/" + window.s("SpiderOak") + "/.favorites/" +
            (spiderOakApp.accountModel.get("b32username") || "anonymous"),
          modelUrl = (model.composedUrl(true)
                      .replace(new RegExp("^.*(share|storage)\/([A-Z2-7]*)\/"),
                               "/$1/$2/")),
          splat = modelUrl.split("/");
      return(base + splat.slice(0, splat.length - 1).join("/")) + "/";
    },
    which: "favoritesCollection"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
