/**
 * Migrator.js
 */
(function (spiderOakApp, window, undefined) {
  "use strict";
  var console = window.console || {};
  console.log = console.log || function(){};
  var _           = window._,
      $           = window.$;

  function queryDB(tx) {
    tx.executeSql('SELECT * FROM favorites', [], querySuccess, errorCB);
  }

  function copyFile(from, to, name) {
    window.resolveLocalFileSystemURI(
      "file://" + from,
      function(fromFileEntry) {
        spiderOakApp.downloader.createPath(
          to,
          function(toDirEntry) {
            fromFileEntry.copyTo(
              toDirEntry,
              name,
              function() {
                // yay?
                console.log("Migrated " + from + " to " + to);
              },
              function(err) {
                console.log(JSON.stringify(err));
              }
            );
          },
          function(err) {
            console.log(JSON.stringify(err));
          },
          window.LocalFileSystem.PERSISTENT
        );
      },
      function(err){
        console.log(JSON.stringify(err));
      }
    );
  }

  function querySuccess(tx, results) {
    var len = results.rows.length;
    var faves = {};
    for (var i=0; i<len; i++){
      var row = results.rows.item(i);
      var fileInfo = window.fileHelper.fileTypeFromExtension(row.name);
//      var path = row.localpath.replace(
//        /^.*\/\.favorites/, "Download/" + window.s("SpiderOak") + "/.favorites"
//      );
      var b32username = "";
      if (row.source && /\/storage\/[2-7A-Z]*\//.test(row.source)) {
        b32username = row.source
                            .replace(/^.*\/storage\/([2-7A-Z]*)\/.*/,"$1");
      }
      var path = "Download/" + window.s("SpiderOak") + "/.favorites/" +
        (b32username || "anonymous") +
        row.fullpath
          .replace(new RegExp("^.*(share|storage)\/([A-Z2-7]*)\/"), "/$1/$2/")
          .replace(new RegExp(encodeURIComponent(row.name)), "");
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
        "path": path,
        "encodedUrl": encodeURIComponent(row.name),
        "type": fileInfo.type
      };
      faves["favorites-" + b32username] = faves["favorites-" + b32username] || [];
      faves["favorites-" + b32username].push(fave);
      // now copy the file to its new location
      copyFile(row.localpath, path, row.name);
      b32username = "";
    }
    // ...
    for (var faveCollection in faves) {
      if (faves.hasOwnProperty(faveCollection)) {
        window.store.set(faveCollection, faves[faveCollection]);
      }
    }
    // reset the anon faves in case this just added any from a share
    spiderOakApp.favoritesCollection.reset(faves["favorites-"] || []);
  }

  function errorCB(tx, err) {
      console.log(JSON.stringify(err));
  }

  // This will create the db to be copied over below
  spiderOakApp.migrateFavorites = function() {
    console.log("Running one-time favorites migration");
    window.store.set("favoritesMigrationHasRun", true);
    var db = window.openDatabase("favorites", "", "Favorites DB", 1000000);
    window.resolveLocalFileSystemURI(
      "file:///data/data/com.spideroak.android/databases/favoritesDb",
      function(fileEntry) {
        window.resolveLocalFileSystemURI(
          "file:///data/data/com.spideroak.android/app_database/file__0/",
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
                console.log(JSON.stringify(error));
              }
            );
          },
          function(error) {
            console.log(JSON.stringify(error));
          }
        );
      },
      function(error) {
        console.log(JSON.stringify(error));
      }
    );
  };

  spiderOakApp.doDataMigrations = function (currentVersion) {
    var storedVersion = window.store.get("dataVersion") || "0.0.0",
        semver = window.semver;

    if (semver.gt(currentVersion, storedVersion)) {
      // The app version is more recent than the version which stored the data.
      if (!window.store.get("favoritesMigrationHasRun") && $.os.android) {
        // This is the first favorites migration.
        spiderOakApp.migrateFavorites();
      }
      if (semver.lt(storedVersion, "2.0.3") && $.os.android) {
        // Do second, pre-2.0.3 favorites migration - just manipulate
      }
    }

    window.store.set("dataVersion", currentVersion);
  };

})(window.spiderOakApp = window.spiderOakApp || {}, window);
