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
      this.url = this.composedUrl(false); // Include the query string.
    },
    which: "ShareRoomModel"
  });

  spiderOakApp.PublicShareRoomModel = spiderOakApp.ShareRoomModel.extend({
    defaults: {
      password_required: false,
      password: "",
      remember: 0
    },
    composedUrl: function(bare) {
      var base = spiderOakApp.FolderModel.prototype.composedUrl.call(this);
      return base + (bare ? "" : "?auth_required_format=json");
    },
    sync: function () {
      if (this.get("password_required") && this.get("password")) {
        /* Temporarily set basic auth for the share room password, and
           restore the prevailing basic auth while returning. */
        var bam = spiderOakApp.accountModel.basicAuthManager;
        bam.setAlternateBasicAuth(
          this.get("share_id"), // username is disregarded.
          this.get("password")  // The salient thing is the password.
        );
        try {
          return spiderOakApp.ShareRoomModel.prototype.sync.apply(this,
                                                                  arguments);
        }
        finally {
          bam.resumeAccountBasicAuth();
        }
      }
      else {
        return spiderOakApp.ShareRoomModel.prototype.sync.apply(this,
                                                                arguments);
      }
    },
    parse: function(resp, xhr) {
      if (resp.password_required && resp.password_required) {
        return {password_required: true,
                password: ""};
      }
      else {
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
      }
    },
    which: "PublicShareRoomModel"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
