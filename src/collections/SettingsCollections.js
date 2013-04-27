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

    /** Get setting value, defaulting the value if not present.
     *
     * @param (string) setting id
     * @param (object) default value
     */
    getOrDefault: function (id, defaultValue) {
      var setting = this.get(id);
      if (setting) {
        return setting.get("value");
      }
      else {
        return defaultValue;
      }
    },
    /** Set an existing setting, or create it with indicated value.
     *
     * Retention of the setting by 'retain' is affected only if the setting
     * does not already exist.
     *
     * @param (string) setting id
     * @param (object) value
     * @param (boolean) create a retained value, if true and not already present
     */
    setOrCreate: function (id, value, retain) {
      var setting = this.get(id);
      if (setting) {
        setting.set("value", value);
      }
      else {
        this.add({id: id, value: value, retain: retain ? 1 : 0});
      }
    },

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
      this.saveRetainedSettings();
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
      _.each(this.models, function (model, key) {
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


