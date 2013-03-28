if (! window.cordova) {

  window.cordova = {bogus: "Cordova is absent, this stub is for polyfills."};

  window.cordova['define'] = function(ident, thecode) {
    var msg = "Cordova plugin '" + ident + "' ruthlessly skipped - no Cordova.";
    window.console.log(msg);
  };

  if (! navigator.notification) {
    navigator.notification = {};
  }

  if (! navigator.notification.alert) {
    navigator.notification.alert =
        function (message, alertCallback, title, buttonName) {
          window.alert(message);
          if (alertCallback) {
            alertCallback();
          }
        };
  }

  if (! navigator.notification.confirm) {
    navigator.notification.confirm =
        function (message, confirmCallback, title, buttonLabels){
          var isConfirmed = window.confirm(message);
          if (confirmCallback)
          {
            confirmCallback((isConfirmed) ? 1 : 0);
          }
        };
  }
}
