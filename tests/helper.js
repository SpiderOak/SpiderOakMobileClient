var helper = {
    trigger: function(obj, name) {
        var e = document.createEvent('Event');
        e.initEvent(name, true, true);
        obj.dispatchEvent(e);
    },
    /** Stash for holding suspended local storage values. */
    localStorageStack: [],
    /** Clear local storage, stashing prior values for later resumption. */
    suspendLocalStorage: function() {
      var holder = {};
      for (var i in window.localStorage) {
        holder[i] = window.localStorage[i];
      }
      window.localStorage.clear();
      helper.localStorageStack.push(holder);
    },
    /** Reestablish last suspended local storage values. */
    resumeLocalStorage: function() {
      if (helper.localStorageStack.length === 0) {
        throw new Error("resumeLocalStorage() without" +
                        " corresponding suspendLocalStorage()");
      }
      var holder = helper.localStorageStack.pop();
      window.localStorage.clear();
      for (var i in holder) {
        window.localStorage[i] = holder[i];
      }
    }
};
