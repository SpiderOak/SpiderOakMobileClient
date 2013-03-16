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
      this.on("change:share_id", this.updateURL);
      this.on("change:room_key", this.updateURL);
      this.updateURL();
    },
    updateURL: function() {
      this.set("url",
               spiderOakApp.b32nibbler.encode(this.get("share_id")) +
               "/" + this.get("room_key") + "/",
               // Prevent infinite regress:
               {silent: true});
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
