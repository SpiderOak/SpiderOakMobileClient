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
    // ...
    parse: function(resp, xhr) {
      // window.console.log(resp);
      var devices = [];
      _.each(resp.devices, function(device){
        devices.push({
          name: device[0],
          url: device[1]
        });
      });
      return devices;
    }
  });

})(window.spiderOakApp = window.spiderOakApp || {}, window);
