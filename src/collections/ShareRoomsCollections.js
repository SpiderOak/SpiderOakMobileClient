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

  spiderOakApp.PublicShareRoomsCollection = ShareRoomsCollection.extend({
    model: spiderOakApp.PublicShareRoomModel,
    initialize: function () {
      var got = ShareRoomsCollection.prototype.initialize.call(this);
      this.visited_records = new spiderOakApp.ShareRoomsRecordCollection();
      this.visited_records.fetch();
      this.index = {};
      return got;
    },
    /**
     * Fetch public share rooms according to the recorded collection of
     * those being visited.
     */
    fetch: function (options) {
      this.visited_records.each(function (visited_record) {
        var share_id = visited_record.get("share_id"),
            room_key = visited_record.get("room_key");
        this.add({share_id: share_id, room_key: room_key});
      }.bind(this));
      // Now fetch the models:
      this.each(function (model) {
        model.fetch();
      });
    },
    which: "PublicShareRoomsCollection"
  });

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

  spiderOakApp.ShareRoomsRecordCollection = Backbone.Collection.extend({
    model: spiderOakApp.ShareRoomRecordModel,
    fetch: function(options) {
      //console.log("ShareRoomRecordCollection.fetch()");
      // Skip right to the sync - records have no remote url to be fetched:
      this.sync("read", this, options);
    },
    sync: function(mode, collection, options) {
      if (mode.match(/read/i)) {
        // @TODO: Replace dummy code for exercising with an example share room:
        if (this.models.length === 0) {
          var newone = new this.model({
            share_id: "klming",
            room_key: "media",
            retained: true      // "Remember Visited" in the graphical spec.
          });
          this.add(newone);
        }
      }
      else if (mode.match(/write/i)) {
        console.log("@TODO: ShareRoomRecordCollection WRITE sync");
        // @TODO: If we are retaining visits across sessions, preserve the urls.
      }
    },
    which: "ShareRoomRecordCollection"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);


