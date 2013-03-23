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

  spiderOakApp.ShareRoomsCollection = Backbone.Collection.extend({
    model: spiderOakApp.ShareRoomModel,
    initialize: function() {
      this.url = "https://" + spiderOakApp.config.server + "/share/";
    },
    which: "ShareRoomsCollection"
  });
  var ShareRoomsCollection = spiderOakApp.ShareRoomsCollection;

  spiderOakApp.MyShareRoomsCollection = ShareRoomsCollection.extend({
    parse: function(resp, xhr) {
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
    },
    which: "MyShareRoomsCollection"
  });

  spiderOakApp.PublicShareRoomsCollection = ShareRoomsCollection.extend({
    model: spiderOakApp.PublicShareRoomModel,
    parse: function(resp, xhr) {
      console.log("PublicShareRoomsCollection.parse: " +
                  JSON.stringify(resp));
      var stats = resp.stats;
      return {
        browse_url: resp.browse_url,
        dirs: resp.dirs,
        name: stats.room_name,
        owner_firstname: stats.firstname,
        owner_lastname: stats.lastname,
        number_of_files: stats.number_of_files,
        number_of_folders: stats.number_of_folders,
        description: stats.room_description,
        size: stats.room_size,
        start_date: stats.start_date
      };
    },
    which: "PublicShareRoomsCollection"
  });

  spiderOakApp.ShareRoomsRecordCollection = Backbone.Collection.extend({
    model: spiderOakApp.ShareRoomRecordModel,
    fetch: function(options) {
      console.log("ShareRoomRecordCollection.fetch()");
      // Skip right to the sync - there is no remote url for fetching:
      this.sync("read", this, options);
    },
    sync: function(mode, collection, options) {
      if (mode.match(/read/i)) {
        console.log("@TODO: ShareRoomRecordCollection READ sync");
        // @DELETE: Dummy code for exercising with an example share room:
        if (this.models.length === 0) {
          var newone = new this.model({
            share_id: "klming",
            room_key: "media",
            retained: true      // "Remember Visited" in the graphical spec.
          });
          this.add(newone);
        }
        // XXX Something beside "request" to get the "complete" to fire?
        collection.trigger('request', collection, null, options);
      }
      else if (mode.match(/write/i)) {
        console.log("@TODO: ShareRoomRecordCollection WRITE sync");
        // @TODO: If we are retaining visits across sessions, preserve the urls.
      }
    },
    which: "ShareRoomRecordCollection"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);


