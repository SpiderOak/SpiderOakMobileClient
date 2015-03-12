(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  /** Return a function that runs something when contingencies are satisfied.
   *
   * Contingencies are satisfied by repeatedly calling the returned function
   * with each of the contingencies, separately, as arguments.
   *
   * An error is thrown if the function is called with unspecified
   * contingencies, and a message is logged to console if the function is
   * called repeatedly with the same contingency.
   *
   * @param {array} contingencies are strings naming what's pending.
   * @param {object} finisherFunc, called when all contingencies are satisfied.
   */
  window.readyFinisher = function (contingencies, finisherFunc) {
    var contingentsObj = {};
    contingencies.forEach(function(item) { contingentsObj[item] = false; });
    return function(which) {
      if (! contingentsObj.hasOwnProperty(which)) {
        throw new Error("No such finisher(" + which + ") contingency.");
      } else {
        if (contingentsObj[which]) {
          console.log("Repeated finisher(" + which + ")");
        }
        contingentsObj[which] = true;
        // We're ready if all contingents are true:
        if (-1 == _.map(contingentsObj,
                        function(value) {return value;}).indexOf(false)) {
          finisherFunc();
        }
      }
    };
  };

})(window);
