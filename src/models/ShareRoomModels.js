/**
 * ShareRoomModel.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.ShareRoomModel = spiderOakApp.FolderModel.extend({
    initialize: function() {
      this.url = (spiderOakApp.b32nibbler.encode(this.get("share_id")) +
                  "/" + this.get("room_key") + "/");
      this.set("url", this.url);
    },
    parse: function(resp, xhr) {
      if (! resp || ! resp.stats) {
        return resp;
      }
      else {
        //console.log(this.which + ".parse resp (resp.stats): " +
        //            JSON.stringify(resp));
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
      }
    },
    which: "ShareRoomModel"
  });

  /**
   * Distinct entities for identifying currently visited public share rooms.
   *
   * These distinct items and collection enables handling device-local
   * recording, separate from coordination of the actual share rooms with
   * the server.
   */
  spiderOakApp.VisitedShareRoomRootItemModel = Backbone.Model.extend({
    defaults: {
      retained: false,
      share_id: null,
      room_key: null,
      url: ""
    },
    getShareRoom: function() {
      // XXX Seek existing before minting a new one.
      var shareroom = new spiderOakApp.ShareRoomModel({
        share_id: this.get("share_id"),
        room_key: this.get("room_key")
      });
      spiderOakApp.shareRoomsCollection.add([shareroom]);
      shareroom.collection = spiderOakApp.shareRoomsCollection;
      shareroom.url = shareroom.collection.url + shareroom.url;
      shareroom.fetch();
      return shareroom;
    },
    parse: function(resp, xhr) {
      //console.log("VisitedShareRoomRootItemModel.parse resp (resp.stats): " +
      //            JSON.stringify(resp));
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
    which: "VisitedShareRoomRootItemModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
