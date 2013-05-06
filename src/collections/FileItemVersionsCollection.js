/**
 * FileItemVersionsCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  var ppcb = spiderOakApp.PasswordProtectedCollectionBase;
  spiderOakApp.FileItemVersionsCollection = ppcb.extend({
    model: spiderOakApp.FileVersionModel,
    initialize: function () {
      ppcb.prototype.initialize.call(this);
      // Supercede collections's url in model.composedUrl() by assigning the
      // model with a 'usrBase', one that omits the file name:
      this.on("add", function(model) {
        model.set("urlBase",
                  this.url.substring(0, this.url.lastIndexOf("/") + 1));
      }.bind(this));
    },
    parse: function(resp, xhr) {
      // window.console.log(resp);
      _.each(resp, function(file) {
        _.extend(file, window.fileHelper
          .fileTypeFromExtension(file.name)
        );
      });
      return resp;
    },
    which: "FileItemVersionsCollection"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
