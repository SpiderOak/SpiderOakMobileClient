/**
 * visitedShareRoomsCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.MyShareRoomsCollection = Backbone.Collection.extend({
    model: spiderOakApp.ShareRoomModel,
    parse: function(resp, xhr) {
      // window.console.log(resp);
      var sharerooms = [],
          share_id_b32 = resp.share_id_b32,
          share_id = resp.share_id;
      _.each(resp.share_rooms, function(shareroom){
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

  spiderOakApp.VisitedShareRoomsCollection = Backbone.Collection.extend({
    model: spiderOakApp.ShareRoomModel,
    sync: function(mode, model, options) {
      if (mode.match(/read/i)) {
        console.log("@TODO: visitedShareRoomsCollection READ sync");
        // @TODO: If the policy is to restore visits across sessions, do so.
        // @DELETE: Dummy code for exercising with an example share room:
        // if (this.models.length === 0) {
        //   var newone = new this.model(
        //     "https://spideroak.com/browse/share/devgeeks/android-apk"
        //   );
        //   this.add(newone);
        // }
      }
      else if (mode.match(/write/i)) {
        console.log("@TODO: visitedShareRoomsCollection WRITE sync");
        // @TODO: If we are retaining visits across sessions, preserve the urls.
      }
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);


