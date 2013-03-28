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
      this.on("add", this.addHandler);
      this.on("remove", this.removeHandler);
      /** A hash of the public share rooms being visited, mapped to their
       * local storage retention election. Retain is 0 or 1 for compactness.
       * {"<b32(share_id)>/<room_key>": <retain?>, ...}
       */
      this.visiting = this.getRetainedRecords();
      return got;
    },
    /**
     * Fetch public share rooms according to the recorded collection of
     * those being visited.
     */
    fetch: function (options) {
      // Fetch according to the recorded list of those being visited.
      _.each(this.visiting, function (remember, modelId) {
        var splat = modelId.split("/"),
        share_id = spiderOakApp.b32nibbler.decode(splat[0]),
        room_key = splat[1];
        this.add({share_id: share_id,
                  room_key: room_key,
                  remember: remember});
      }.bind(this));
      // addHandler does the fetch for each model.
    },
    addHandler: function(model, collection, options) {
      var surroundingSuccess = options && options.success,
          surroundingError = options && options.error;
      _.extend(options, {
        success: function() {
          this.visiting[model.id] = model.get("remember") ? 1 : 0;
          // We always save to account for subtle changes, like remember status.
          this.saveRetainedRecords();
          if (surroundingSuccess) {
            surroundingSuccess();
          }
        }.bind(this),
        error: function(model, xhr, options) {
          // @TODO: Use some kind of toast, or other non-modal alert.
          navigator.notification.alert("Share Room " +
                                       model.get("share_id") + "/" +
                                       model.get("room_key") +
                                      " not found.");
          this.remove(model);
          if (surroundingError) {
            surroundingError();
          }
        }.bind(this)
      });
      model.fetch(options);
    },
    removeHandler: function(model, collection, options) {
      if (this.visiting.hasOwnProperty(model.id)) {
        delete this.visiting[model.id];
        this.saveRetainedRecords();
      }
    },
    getRetainedRecords: function(name) {
      var fromStorage = window.store.get(this.retentionName());
      return JSON.parse(fromStorage) || {};
    },
    saveRetainedRecords: function(name) {
      var retain = {};
      _.each(this.visiting, function (value, key) {
        if (value) { retain[key] = value; }
      });
      window.store.set(this.retentionName(), JSON.stringify(retain));
    },
    retentionName: function() {
      // "anonymous" should never collide with all-upper-case base32 names.
      var name = spiderOakApp.accountModel.get("b32username") || "anonymous";
      return "spiderOakApp_pubshares_" + name;
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


