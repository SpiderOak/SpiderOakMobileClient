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
    defaults: _.extend({},
                       spiderOakApp.FolderModel.prototype.defaults,
                       {icon: "cloud-upload",
                        kind: "My ShareRoom"}
                      ),
    initialize: function() {
      spiderOakApp.FolderModel.prototype.initialize.call(this);
      var id = (spiderOakApp.b32nibbler.encode(this.get("share_id")) +
                       "/" + this.get("room_key") + "/");
      this.set("id", id);
      this.set("url", id);
      this.url = this.composedUrl(false); // Include the query string.
    },
    getWebURL: function () {
      return ("https://" +
              spiderOakApp.settings.get("server").get("value") +
              "/browse/share/" +
              this.get("share_id") +
              "/" +
              this.get("room_key"));
    },
    which: "ShareRoomModel"
  });

  spiderOakApp.PublicShareRoomModel = spiderOakApp.ShareRoomModel.extend({
    defaults: _.extend({},
                       spiderOakApp.ShareRoomModel.prototype.defaults,
                       {remember: 0,
                        kind: "Public ShareRoom"}
                      ),
    initialize: function () {
      this.on("change:remember", this.saveRetainedRecords);
      spiderOakApp.ShareRoomModel.prototype.initialize.call(this);
    },
    saveRetainedRecords: function () {
      this.collection.saveRetainedRecords();
    },
    parseSpecific: function(resp, xhr) {
      var stats = resp.stats;
      return {
        password_required: false,
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

})(window.spiderOakApp = window.spiderOakApp || {}, window);
