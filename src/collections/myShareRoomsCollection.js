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

  spiderOakApp.myShareRoomsCollection = Backbone.Collection.extend({
    model: spiderOakApp.ShareRoomModel,
    parse: function(resp, xhr) {
      // window.console.log(resp);
      var sharerooms = [],
          share_id_b32 = resp.share_id_b32,
          share_id = resp.share_id;
      _.each(resp.share_rooms,
             function(shareroom){
               sharerooms.push({
                 url: share_id_b32 + "/" + shareroom.room_key + "/",
                 share_id_b32: share_id_b32,
                 share_id: share_id,
                 room_key: shareroom.room_key,
                 name: shareroom.room_name,
                 description: shareroom.room_description,
                 browse_url: shareroom.url
               });
      });
      return sharerooms;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
