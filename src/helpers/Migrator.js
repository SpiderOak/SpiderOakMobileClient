(function (window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var Backbone    = window.Backbone,
      _           = window._,
      $           = window.$;

  function queryDB(tx) {
      tx.executeSql('SELECT * FROM favorites', [], querySuccess, errorCB);
  }

  function querySuccess(tx, results) {
      var len = results.rows.length;
      console.log("favorites table: " + len + " rows found.");
      for (var i=0; i<=len; i++){
        // @TODO: DO SOMETHING WITH THE DATA HERE...
        console.log(JSON.stringify(results.rows.item(i)));
      }
  }

  function errorCB(tx, err) {
      console.log(err);
  }

  var db = window.openDatabase("favorites", "", "Favorites DB", 1000000);
  window.resolveLocalFileSystemURI(
    "file:///data/data/com.spideroak.android/databases/favoritesDb",
    function(fileEntry) {
      console.log(fileEntry);
      window.resolveLocalFileSystemURI(
        "file:///data/data/com.spideroak.android/app_database/file__0/",
        function(parentEntry) {
          fileEntry.moveTo(
            parentEntry,
            "0000000000000001.db",
            function() {
              var db = window.openDatabase("favorites", "", "Favorites DB", 1000000);
              db.transaction(queryDB, errorCB);
            },
            function(error) {
              console.log(error);
            }
          );
        },
        function(error) {
          console.log(error);
        }
      );
    },
    function(error) {
      console.log(error);
    }
  );

})(window);
