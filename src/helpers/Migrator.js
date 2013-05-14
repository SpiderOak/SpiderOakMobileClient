(function (spiderOakApp, window, undefined) {
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
      console.log(results.rows.item(i));
      var row = results.rows.item(i);
      var fileInfo = window.fileHelper.fileTypeFromExtension(row.name);
      var path = row.localpath.replace(
        /^.*\/\.favorites/, "Download/SpiderOak/.favorites"
      );
      var fave = {
        "ctime": row.mtime,
        "etime": row.mtime,
        "mtime": row.mtime,
        "name": row.name,
        "size": row.size,
        "url": row.fullpath,
        "description": fileInfo.description,
        "openInternally": fileInfo.openInternally,
        "icon": fileInfo.icon,
        "isFavorite": true,
        "password_required": false,
        "password": "",
        "path": path.replace(_.last(path.split("/")), ""),
        "encodedUrl": encodeURIComponent(row.name)
      };
      var b32username = "";
      if (row.source && /\/storage\/[2-7A-Z]*\//.test(row.source)) {
        b32username = row.source
                            .replace(/^.*\/storage\/([2-7A-Z]*)\/.*/,"$1");
        console.log(b32username);
      }
      var faves = window.store.get("favorites-" + b32username) || [];
      faves.push(fave);
      console.log(faves);
      window.store.set(
        "favorites-" + b32username,
        faves
      );
    }
    // reset the anon faves in case this just added some
    spiderOakApp.favoritesCollection.reset(window.store.get("favorites-"));
  }

  function errorCB(tx, err) {
      console.log(err);
  }

  // This will create the db to be copied over below
  var db = window.openDatabase("favorites", "", "Favorites DB", 1000000);
  window.resolveLocalFileSystemURI(
    "file:///data/data/com.spideroak.android.beta/databases/favoritesDb",
    function(fileEntry) {
      console.log(fileEntry);
      window.resolveLocalFileSystemURI(
        "file:///data/data/com.spideroak.android.beta/app_database/file__0/",
        function(parentEntry) {
          fileEntry.moveTo(
            parentEntry,
            "0000000000000001.db",
            function() {
              var db = window.openDatabase(
                "favorites", "", "Favorites DB", 1000000
              );
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

})(window.spiderOakApp = window.spiderOakApp || {}, window);
