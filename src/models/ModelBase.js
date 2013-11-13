/**
 * ModelBase.js
 *
 * Application-specific tailorings of Backbone.Model go here.
 *
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$,
      s           = window.s;

  spiderOakApp.ModelBase = Backbone.Model.extend({

    /*
     * How a model in our framework determines its' composite URL.
     *
     * The URL is a concatenation of model and collection url elements.  Any
     * prevailing elements that are functions are evaluated, as methods on
     * the object from which they were obtained, for their result.
     *
     * - A head part is taken in this order of precedence:
     *   - the model's .get("urlBase")
     *   - or the model's urlBase attribute
     *   - or the containing collection's .urlBase
     *   - or the containing collection's .url
     * - The url part is taken from the model's .get("url").
     *
     * @this{model}
     # @param {boolen} bare - when set, strip any query string
     */
    composedUrl: function(bare) {
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
      if (bare) {
        urlHead = urlHead && urlHead.split("?")[0];
        urlTail = urlTail && urlTail.split("?")[0];
      }
      var result = (urlHead || "") + (urlTail || "");
      return result;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
