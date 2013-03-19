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
    // ...
    which: "ShareRoomRootItemModel"
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
    initialize: function() {
      this.set("url",
               spiderOakApp.b32nibbler.encode(this.get("share_id")) +
               "/" + this.get("room_key") + "/",
               // Prevent infinite regress:
               {silent: true});
    },
    getShareRoom: function() {
      // XXX Look for existing before minting a new one.
      var shareroom = new spiderOakApp.ShareRoomModel({}, {
        collection: spiderOakApp.shareRoomsCollection
        });
      shareroom.url = this.get("url");
      shareroom.set("url", shareroom.url);
      shareroom.fetch();
      return shareroom;
    },
    which: "VisitedShareRoomRootItemModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
