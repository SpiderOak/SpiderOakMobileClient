/**
 * ShareRoomsCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  var ppcb = spiderOakApp.PasswordProtectedCollectionBase;
  spiderOakApp.ShareRoomsCollection = ppcb.extend({
    model: spiderOakApp.ShareRoomModel,
    initialize: function() {
      this.url = ("https://" +
                  spiderOakApp.settings.get("server").get("value") +
                  "/share/");
    },
    hasByAttributes: function(share_id, room_key) {
      return this.get(this.attributesToId(share_id, room_key));
    },
    attributesToId: function (share_id, room_key) {
      return spiderOakApp.b32nibbler.encode(share_id) + "/" + room_key + "/";
    },
    which: "ShareRoomsCollection"
  });
  var ShareRoomsCollection = spiderOakApp.ShareRoomsCollection;

  spiderOakApp.PublicShareRoomsCollection = ShareRoomsCollection.extend({
    settingPrefix: "pubshares_",
    model: spiderOakApp.PublicShareRoomModel,
    initialize: function () {
      var got = ShareRoomsCollection.prototype.initialize.call(this);
      this.on("add", this.addHandler);
      this.on("remove", this.removeHandler);
      /** A hash of the public ShareRooms being visited, mapped to their
       * local storage retention election. Retain is 0 or 1 for compactness.
       * {"<b32(share_id)>/<room_key>": <retain?>, ...}
       */
      if (! spiderOakApp.visitingPubShares) {
        spiderOakApp.visitingPubShares = this.getRetainedRecords();
        if (spiderOakApp.accountModel.get("isLoggedIn")) {
          // Include the records from the anonymous collection, too:
          spiderOakApp.visitingPubSharesAnon = this.getRetainedRecords(true);
        }
        else {
          spiderOakApp.visitingPubSharesAnon = {};
        }
      }
      return got;
    },
    reset: function (models, options) {
      ShareRoomsCollection.prototype.reset.call(this, models, options);
      spiderOakApp.visitingPubShares = null;
      spiderOakApp.visitingPubSharesAnon = null;
    },
    /**
     * Fetch public ShareRooms according to the recorded collection of
     * those being visited.
     */
    fetch: function (options) {
      // Fetch according to the recorded list of those being visited.
      var all = _.clone(spiderOakApp.visitingPubShares);
      _.extend(all, spiderOakApp.visitingPubSharesAnon);
      _.each(all, function (remember, modelId) {
        var splat = modelId.split("/"),
        share_id = spiderOakApp.b32nibbler.decode(splat[0]),
        room_key = splat[1];
        this.add({share_id: share_id,
                  room_key: room_key,
                  remember: remember,
                  beenSituated: true});
      }.bind(this));
      // addHandler does the fetch for each model.
    },
    addHandler: function(model, collection, options) {
      var surroundingSuccess = options && options.success,
          surroundingError = options && options.error;
      var preserve = function (model) {
        spiderOakApp.visitingPubShares[model.id] =
            model.get("remember") ? 1 : 0;
        // We always save to account for subtle changes, like remember status.
        this.saveRetainedRecords();
      }.bind(this);
      _.extend(options, {
        success: function(model, response, options) {
          preserve(model);
          if (surroundingSuccess) {
            surroundingSuccess(model, response, options);
          }
        }.bind(this),
        error: function(model, response, options) {
          if (model.get("beenSituated")) {
            preserve(model);
          }
          else {
            this.remove(model);
            if (surroundingError) {
              surroundingError(model, response, options);
            }
          }
        }.bind(this)
      });
      model.fetch(options);
    },
    removeHandler: function(model, collection, options) {
      /* Do both current account and anonymous, independently.
         This may mean removing an item from both - proper. */
      if (spiderOakApp.visitingPubShares.hasOwnProperty(model.id)) {
        delete spiderOakApp.visitingPubShares[model.id];
        this.saveRetainedRecords();
      }
      if (spiderOakApp.visitingPubSharesAnon.hasOwnProperty(model.id)) {
        delete spiderOakApp.visitingPubSharesAnon[model.id];
        this.saveRetainedRecords(true);
      }
    },
    getRetainedRecords: function(anonymous) {
      var setting = spiderOakApp.settings.get(this.settingName(anonymous));
      if (! setting) {
        return {};
      }
      try {
        return JSON.parse(setting.get("value"));
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.log("Removing malformed locally stored" +
                      " Public ShareRoom records: " +
                      setting.get("value"));
          this.removeRetainedRecords(anonymous);
          return {};
        }
      }
    },
    /** Update app ledger that tracks retaineds, and record in local storage.
     */
    saveRetainedRecords: function(anonymous) {
      var retain = {},
          model,
          they = (anonymous ?
                  spiderOakApp.visitingPubSharesAnon :
                  spiderOakApp.visitingPubShares);
      _.each(they, function (value, key) {
        model = this.get(key);
        if (model && model.get("remember") !== value) {
          // Update ledger with the model's new value:
          they[key] = value = model.get("remember");
        }
        if (value) { retain[key] = value; }
      }.bind(this));
      spiderOakApp.settings.setOrCreate(this.settingName(anonymous),
                                        JSON.stringify(retain),
                                        1);
    },
    removeRetainedRecords: function(anonymous) {
      spiderOakApp.settings.remove(this.settingName(anonymous));
    },
    /** Get the name of our setting object, per authenticated account.
     *
     * @param {object} anonymous true to force the name for non-authenticated
     */
    settingName: function(anonymous) {
      // "anonymous" should never collide with all-upper-case base32 names.
      var name = "anonymous";
      if (! anonymous) {
        name = spiderOakApp.accountModel.get("b32username") || name;
      }
      return this.settingPrefix + name;
    },
    which: "PublicShareRoomsCollection"
  });

  spiderOakApp.MyShareRoomsCollection = ShareRoomsCollection.extend({
    initialize: function () {
      try {
        return ShareRoomsCollection.prototype.initialize.call(this);
      }
      finally {
        this.on("reset", this.resetHandler, this);
      }
    },
    resetHandler: function(options) {
      this.each(function (model) {
        // Don't pass the options we get - they're for the collection.
        model.fetch();
      });
    },
    parse: function(resp, options) {
      var sharerooms = [],
          share_id_b32 = resp.share_id_b32,
          share_id = resp.share_id;
      _.each(resp.share_rooms, function(shareroom){
        sharerooms.push({
          preliminary: true,
          url: share_id_b32 + "/" + shareroom.room_key + "/",
          share_id_b32: share_id_b32,
          share_id: share_id,
          room_key: shareroom.room_key,
          name: shareroom.room_name,
          description: shareroom.room_description,
          number_of_folders: shareroom.number_of_folders,
          number_of_files: shareroom.number_of_files,
          browse_url: shareroom.url
        });
      });
      return sharerooms;
    },
    which: "MyShareRoomsCollection"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);


