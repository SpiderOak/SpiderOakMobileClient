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
      var id = (spiderOakApp.b32nibbler.encode(this.get("share_id")) +
                       "/" + this.get("room_key") + "/");
      this.set("id", id);
      this.set("url", id);
      this.url = this.composedUrl();
    },
    which: "ShareRoomModel"
  });

  spiderOakApp.PublicShareRoomModel = spiderOakApp.ShareRoomModel.extend({
    parse: function(resp, xhr) {
      //console.log("PublicShareRoomModel.parse() " +
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
    which: "PublicShareRoomModel"
  });

  /**
   * Distinct entities for identifying currently visited public share rooms.
   *
   * These distinct items and collection enables handling device-local
   * recording, separate from coordination of the actual share rooms with
   * the server.
   */
  spiderOakApp.ShareRoomRecordModel = Backbone.Model.extend({
    defaults: {
      retained: false,
      share_id: null,
      room_key: null,
      url: ""
    },
    initialize: function() {
      this.set("id", (spiderOakApp.b32nibbler.encode(this.get("share_id")) +
                      "/" + this.get("room_key") + "/"));
    },
    which: "ShareRoomRecordModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);