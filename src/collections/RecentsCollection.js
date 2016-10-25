/**
 * RecentsCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function () {};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.RecentsCollection = spiderOakApp.CollectionBase.extend({
    model: spiderOakApp.RecentModel,
    /** Remove recent models having the same composedURL and place this one. */
    replace: function (model) {
      // Add the file to the recents collection (view or fave)
      var matchingModels = _.filter(this.models, function (recent) {
        return recent.composedUrl(true) === model.composedUrl(true);
      });
      if (matchingModels.length > 1) {
        console.log("Multiple recents with same composedUrl detected...");
      }
      this.remove(matchingModels);
      this.add(model);
    },
    which: "RecentsCollection"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
