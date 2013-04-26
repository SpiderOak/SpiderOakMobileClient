/**
 * SettingsCollections.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.SettingsCollection = Backbone.Collection.extend({
    retentionPrefix: "spiderOakApp_settings_",
    model: spiderOakApp.SettingModel,
    initialize: function () {
      this.on("add", this.addHandler);
      this.on("remove", this.removeHandler);
      this.on("change", this.saveRetainedSettings);
      this.fetch();
      return this;
    },
    reset: function (models, options) {
      this.clear();
      this.fetch();
    },
    fetch: function (options) {
      this.addRetainedSettings();
      this.includeConfigSettings();
    },
    addHandler: function(model, collection, options) {
      var surroundingSuccess = options && options.success,
          surroundingError = options && options.error;
      _.extend(options, {
        success: function() {
          spiderOakApp.settings[model.id] =
              model.get("retain") ? 1 : 0;
          // We always save to account for subtle changes, like retain status.
          this.saveRetainedSettings();
          if (surroundingSuccess) {
            surroundingSuccess();
          }
        }.bind(this),
        error: function(model, xhr, options) {
          this.remove(model);
          if (surroundingError) {
            surroundingError();
          }
        }.bind(this)
      });
    },
    removeHandler: function (model, collection, options) {
      if (spiderOakApp.settings.hasOwnProperty(model.id)) {
        delete spiderOakApp.settings[model.id];
        this.saveRetainedSettings();
      }
    },
    addRetainedSettings: function() {
      var fromStorage = window.store.get(this.retentionName()),
          parsed,
          _self = this;      // @Note: circumvent apparent ghostjs .bind() bug.
      if (! fromStorage) {
        return;
      }
      try {
        parsed = JSON.parse(fromStorage);
      }
      catch (e) {
        if (e instanceof SyntaxError) {
          console.log("Removing malformed locally stored setting: " +
                      fromStorage);
          this.removeRetainedSettings();
          return {};
        }
      }

      _.each(parsed, function (value, key) {
        _self.add({
          id: key,
          value: value,
          retain: 1
        });
      });
    },
    /** Include not-already-present settings from app configuration. */
    includeConfigSettings: function () {
      var _self = this;      // @Note: circumvent apparent ghostjs .bind() bug.
      _.each(spiderOakApp.config, function (metadata, key) {
        // Do not override established settings:
        if (! _self.hasSetting(key)) {
          _self.add({
            id: key,
            value: metadata.value,
            retain: metadata.retain
          }).bind(this);
        }
      });
    },
    hasSetting: function (id) {
      return (typeof this.get(id)) !== "undefined";
    },
    saveRetainedSettings: function() {
      var retain = {};
      _.each(spiderOakApp.settings.models, function (model, key) {
        if (model.get("retain")) {
          retain[model.id] = model.get("value");
        }
      });
      window.store.set(this.retentionName(), JSON.stringify(retain));
    },
    removeRetainedSettings: function() {
      window.store.remove(this.retentionName());
    },
    retentionName: function() {
      // "all" should never collide with all-upper-case base32 account names.
      var name = "plain";
      return this.retentionPrefix + name;
    },
    which: "SettingsCollection"
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);


