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
      /** A hash of the share rooms to be retained in local storage.
       * {"<b32(share_id)>/<room_key>": 1, ...}
       */
      this.retain = this.getRetainedRecords("everyone");//Could be account name.
      return got;
    },
    /**
     * Fetch public share rooms according to the recorded collection of
     * those being visited.
     */
    fetch: function (options) {
      _.each(this.retain, function (value, key) {
        this.addFromModelId(key);
      }.bind(this));
      // Now fetch the models:
      this.each(function (model) {
        model.fetch();
      });
    },
    addFromModelId: function(modelId) {
      var splat = modelId.split("/"),
          share_id = spiderOakApp.b32nibbler.decode(splat[0]),
          room_key = splat[1];
      this.add({share_id: share_id, room_key: room_key});
    },
    formRetainedName: function(name) {
      return "spiderOakApp_pubshares_" + JSON.stringify(name);
    },
    getRetainedRecords: function(name) {
      var fromStorage = window.store.get(this.formRetainedName(name));
      // XXX Artificially inject a demo item:
      fromStorage = JSON.stringify({"NNWG22LOM4/media": 0});
      return JSON.parse(fromStorage);
    },
    saveRetainedRecords: function(name) {
      window.store.set(this.formRetainedName(name),
                       JSON.stringify(this.retain));
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

})(window.spiderOakApp = window.spiderOakApp || {}, window);


