/**
 * ShareRoomsCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.ShareRoomsCollection = Backbone.Collection.extend({
    model: spiderOakApp.ShareRoomModel,
    parse: function(resp, xhr) {
      // window.console.log(resp);
      var sharerooms = [];
      _.each(resp.sharerooms, function(shareroom){
        sharerooms.push({
          name: shareroom[0],
          url: shareroom[1]
        });
      });
      return sharerooms;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
