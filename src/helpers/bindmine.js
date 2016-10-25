window.bindMine = function () {
  var omits = ["$", "_configure", "_ensureElement", "bind", "constructor",
               "delegateEvents", "devicesReady", "listenTo", "off", "on",
               "once", "remove", "setElement", "stopListening", "trigger",
               "unbind", "undelegateEvents"];
  return function (it) {
    window._.bindAll.apply(window._,
                           [it].concat(window._.without(window._.functions(it),
                                                        omits)));
  };
}();
