/**
 * DevicesCollection.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  spiderOakApp.DevicesCollection = Backbone.Collection.extend({
    model: spiderOakApp.DeviceModel,
    fetch: function(options) {
      // Add options.reset = true unless it's already, explicitly false.
      options = options || {};
      if (! options.hasOwnProperty("reset")) {
        options.reset = true;
      }
      Backbone.Collection.prototype.fetch.call(this, options);
    },
    parse: function(resp, xhr) {
      // window.console.log(JSON.stringify(resp));
      var devices = resp.devices;
      _.each(resp.devices, function(device){
        device.url = device.encoded;
        switch (device.sysplatform) {
          case "darwin":
            device.icon = "finder";
            break;
          case "win32":
            device.icon = "windows";
            break;
          case "linux2":
            device.icon = "tux";
            break;
          default:
            device.icon = "folder";
        }
      });
      return devices;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
